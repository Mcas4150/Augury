import json, pathlib, yaml
from .rules.engine import evaluate_omen, inaugurate_omen
from .ollama_engine import OllamaEngine
from .settings import settings

# SYSTEM = (
#     "You are the Pontifex Augur of Rome. "
#     "Speak in elevated, archaic English with Latin flourishes. "
#     "• Begin with 'Hear, O mortals!' "
#     "• Provide a short chain of thought under 'THINK:', numbered ❶ ❷ ❸. "
#     "• Then, under 'OMEN:', proclaim the verdict in ≤120 words, ending with '<END>'."
# )
# TEMPLATE = "FACTS:\n{facts}\nTHINK:\n"

SYSTEM = (
    "You are the Pontifex Augur of Rome. "
    "Speak in elevated, archaic English with Latin flourishes. "
    "• Begin with 'Hear, O mortals!' "
    "• Offer terse rationale under 'NOTAE:' — 3 bullet lines. "
    "• Then, under 'OMEN:', proclaim the verdict in ≤120 words, ending with '<END>'."
)
TEMPLATE = "FACTS:\n{facts}\nNOTAE:\n"


SYSTEM2 = (
    "You are the Pontifex Augur of Rome. "
    "Speak in elevated, archaic English with Latin flourishes. "
    "• Begin with 'My people, The Gods have spoken' "
    "• Then, proclaim the verdict in ≤240 words, ending with '<END>'."
)
TEMPLATE2 = "FACTS:\n{facts}\nNOTAE:\n"

RULES_PATH = pathlib.Path(__file__).parent / "augury_rules.yaml"
with RULES_PATH.open("r", encoding="utf-8") as f:
    rules = yaml.safe_load(f)

_engine = OllamaEngine(settings.OLLAMA_URL, settings.OLLAMA_MODEL)

def build_prompt(data: dict) -> str:
    facts = data.copy()
    facts.update(evaluate_omen(facts))
    return f"{SYSTEM}\n{TEMPLATE.format(facts=json.dumps(facts, indent=2))}"

def build_inaugurate_prompt(data: dict) -> str:
    facts = data.copy()
    facts.update(inaugurate_omen(facts))
    return f"{SYSTEM2}\n{TEMPLATE2.format(facts=json.dumps(facts, indent=2))}"

def omen(data: dict) -> str:
    prompt = build_prompt(data)
    text = _engine.generate(
        prompt,
        max_tokens=settings.NUM_PREDICT,
        temperature=settings.TEMP,
        stop=["<END>"],
        options={"num_ctx": settings.NUM_CTX, "num_batch": settings.NUM_BATCH, "repeat_penalty": 1.1},
    )
    return text.strip().removesuffix("<END>").strip()


def inaugurate(data: dict) -> str:
    prompt = build_inaugurate_prompt(data)
    text = _engine.generate(
        prompt,
        max_tokens=settings.NUM_PREDICT,
        temperature=settings.TEMP,
        stop=["<END>"],
        options={"num_ctx": settings.NUM_CTX, "num_batch": settings.NUM_BATCH, "repeat_penalty": 1.1},
    )
    return text.strip().removesuffix("<END>").strip()
