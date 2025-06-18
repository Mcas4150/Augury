import os, sys, json, pathlib, contextlib, yaml
from llama_cpp import Llama, llama_log_set
from rules.engine import evaluate_omen

# ── 1 │ silence standard llama.cpp logger
llama_log_set(None, None)

# ── 2 │ context manager to mute Metal / ggml native prints
@contextlib.contextmanager
def mute_native():
    with open(os.devnull, "w") as devnull:
        old_out, old_err = os.dup(1), os.dup(2)
        os.dup2(devnull.fileno(), 1)   # redirect stdout → /dev/null
        os.dup2(devnull.fileno(), 2)   # redirect stderr → /dev/null
        try:
            yield
        finally:                       # restore console
            os.dup2(old_out, 1)
            os.dup2(old_err, 2)

MODEL = pathlib.Path("models/llama3-8B-q4_k_m.gguf").expanduser()

# ── 3 │ build model & run inference entirely inside mute block
with mute_native():
    llm = Llama(
        model_path=str(MODEL),
        n_ctx=2048,
        n_gpu_layers=35,
        verbose=False          # suppress perf/timing prints
    )

    SYSTEM = (
        "You are the Pontifex Augur of Rome. "
        "Speak in elevated, archaic English with Latin flourishes. "
        "• Begin with 'Hear, O mortals!' "
        "• Provide a short chain of thought under 'THINK:', numbered ❶ ❷ ❸. "
        "• Then, under 'OMEN:', proclaim the verdict in ≤120 words, ending with '<END>'."
    )
    TEMPLATE = "FACTS:\n{facts}\nTHINK:\n"
    rules    = yaml.safe_load(open("augury_rules.yaml"))

    def omen(data: dict) -> str:
        facts = data.copy()
        facts.update(evaluate_omen(facts))            # add omen + logic
        prompt = f"{SYSTEM}\n{TEMPLATE.format(facts=json.dumps(facts, indent=2))}"

        result = llm(
            prompt,
            max_tokens=200,
            temperature=0.8,      # ↗ creativity
            top_p=0.9,
            repeat_penalty=1.1,
            stop=["<END>"]
        )["choices"][0]["text"]

        return result.strip().removesuffix("<END>").strip()

    # read stdin, compute proclamation while still silenced
    proclamation = omen(json.loads(sys.stdin.read()))
    del llm   # free Metal buffers while muted

# ── 4 │ print only the final proclamation
print(proclamation)
