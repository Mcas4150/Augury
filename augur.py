import json, pathlib, yaml
from llama_cpp import Llama

MODEL = pathlib.Path("models/llama3-8B-q4_k_m.gguf").expanduser()
llm = Llama(model_path=str(MODEL), n_ctx=2048, n_gpu_layers=35)

SYSTEM = """You are the Pontifex Augur. First reason, then proclaim the omen in ≤120 words."""
TEMPLATE = "FACTS:\n{facts}\nTHINK:\n"

rules = yaml.safe_load(open("augury_rules.yaml"))

def omen(data: dict) -> str:
    # trivial rule lookup — replace with experta later
    species = data["species"]
    side    = data["side"]
    outcome = (
        "faustum" if rules["oscines"].get(species) == "favourable"
        and rules["sides"][side] == "favourable" else "dirum"
    )
    facts = json.dumps({**data, "omen": outcome}, indent=2)
    prompt = f"{SYSTEM}\n{TEMPLATE.format(facts=facts)}"
    return llm(prompt, max_tokens=160)["choices"][0]["text"].strip()

if __name__ == "__main__":
    import sys, json
    print(omen(json.loads(sys.stdin.read())))