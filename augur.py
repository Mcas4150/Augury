import os, sys, json, pathlib, contextlib, yaml
from llama_cpp import Llama, llama_log_set
from rules.engine import evaluate_omen

# ── Silence the standard llama.cpp logger
llama_log_set(None, None)

# ── Mute native Metal / ggml prints
@contextlib.contextmanager
def mute_native():
    with open(os.devnull, "w") as devnull:
        old_out, old_err = os.dup(1), os.dup(2)
        os.dup2(devnull.fileno(), 1)
        os.dup2(devnull.fileno(), 2)
        try:
            yield
        finally:
            os.dup2(old_out, 1)
            os.dup2(old_err, 2)

# ── Model path
MODEL = pathlib.Path("models/llama3-8B-q4_k_m.gguf").expanduser()

# ── Lazy-loaded global model
_llm = None
def build_llm():
    with mute_native():                      # hide Metal init spam
        return Llama(
            model_path=str(MODEL),
            n_ctx=2048,
            n_gpu_layers=35,
            verbose=False                    # hide perf prints
        )

def get_llm():
    global _llm
    if _llm is None:
        _llm = build_llm()
    return _llm

# ── Prompt scaffold
SYSTEM = (
    "You are the Pontifex Augur of Rome. "
    "Speak in elevated, archaic English with Latin flourishes. "
    "• Begin with 'Hear, O mortals!' "
    "• Provide a short chain of thought under 'THINK:', numbered ❶ ❷ ❸. "
    "• Then, under 'OMEN:', proclaim the verdict in ≤120 words, ending with '<END>'."
)
TEMPLATE = "FACTS:\n{facts}\nTHINK:\n"
rules = yaml.safe_load(open("augury_rules.yaml"))

# ── Main omen function (used by CLI & API)
def omen(data: dict) -> str:
    facts = data.copy()
    facts.update(evaluate_omen(facts))      # add omen + logic
    prompt = f"{SYSTEM}\n{TEMPLATE.format(facts=json.dumps(facts, indent=2))}"

    with mute_native():                     # hide perf prints per call
        text = get_llm()(
            prompt,
            max_tokens=200,
            temperature=0.8,
            top_p=0.9,
            repeat_penalty=1.1,
            stop=["<END>"]
        )["choices"][0]["text"]

    return text.strip().removesuffix("<END>").strip()

# ── CLI entry-point
if __name__ == "__main__":
    print(omen(json.loads(sys.stdin.read())))
