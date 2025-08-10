# ── app/augur.py ───────────────────────────────────────────────────────
import os, sys, json, pathlib, contextlib, yaml
from llama_cpp import Llama, llama_log_set
from .rules.engine import evaluate_omen          # ← relative import

# silence llama.cpp logs
llama_log_set(None, None)

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

MODEL = pathlib.Path("models/llama3-8B-q4_k_m.gguf").expanduser()

_llm = None
def build_llm():
<<<<<<< HEAD
    # with mute_native():
        return Llama(
            model_path=str(MODEL),
            n_ctx=2048,
            n_gpu_layers=20,            # Start with CPU-only
            verbose=False,
=======
    with mute_native():
        return Llama(
            model_path=str(MODEL),
            n_ctx=2048,
            n_gpu_layers=0,           # CPU-only wheel on Windows
            verbose=False
>>>>>>> 9282a51 (birdnet working)
        )

def get_llm():
    global _llm
    if _llm is None:
        _llm = build_llm()
    return _llm

SYSTEM = (
    "You are the Pontifex Augur of Rome. "
    "Speak in elevated, archaic English with Latin flourishes. "
    "• Begin with 'Hear, O mortals!' "
    "• Provide a short chain of thought under 'THINK:', numbered ❶ ❷ ❸. "
    "• Then, under 'OMEN:', proclaim the verdict in ≤120 words, ending with '<END>'."
)
TEMPLATE = "FACTS:\n{facts}\nTHINK:\n"

RULES_PATH = pathlib.Path(__file__).parent / "augury_rules.yaml"
with RULES_PATH.open("r", encoding="utf-8") as f:
    rules = yaml.safe_load(f)

def omen(data: dict) -> str:
    facts = data.copy()
    facts.update(evaluate_omen(facts))
    prompt = f"{SYSTEM}\n{TEMPLATE.format(facts=json.dumps(facts, indent=2))}"

    with mute_native():
        text = get_llm()(
            prompt,
            max_tokens=200,
            temperature=0.8,
            top_p=0.9,
            repeat_penalty=1.1,
            stop=["<END>"]
        )["choices"][0]["text"]

    return text.strip().removesuffix("<END>").strip()

if __name__ == "__main__":
    print(omen(json.loads(sys.stdin.read())))
