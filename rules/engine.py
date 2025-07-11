# ── rules/engine.py ───────────────────────────────────────────────────────
import pathlib
import yaml

_rules = yaml.safe_load(
    open(pathlib.Path(__file__).parent.parent / "augury_rules.yaml")
)

def evaluate_omen(fact: dict) -> dict:
    # 1) pull raw inputs
    raw_sp   = fact.get("species", "")
    raw_side = fact.get("side", "")

    # 2) normalize (strip whitespace + lower case)
    sp   = raw_sp.strip().lower()
    side = raw_side.strip().lower()

    # 3) (optionally) map synonyms before lookup
    synonyms      = _rules.get("synonyms", {})
    side_syns     = _rules.get("side_synonyms", {})
    sp   = synonyms.get(sp, sp)
    side = side_syns.get(side, side)

    logic = []

    # 4) now do your existing logic, but using the normalized keys
    species_class = "oscines" if sp in _rules["oscines"] else None

    if species_class == "oscines":
        bird_judgment = _rules["oscines"][sp]
        side_judgment = _rules["sides"].get(side, None)
        logic.append(f"{sp} is oscine → judged by side")
        logic.append(f"{side} side → {side_judgment}")
        if bird_judgment == "favourable" and side_judgment == "favourable":
            return {"omen": "faustum", "logic": logic}
        else:
            return {"omen": "inafaustum", "logic": logic}

    # fallback
    logic.append(f"{sp} unknown or unsupported")
    return {"omen": "incertum", "logic": logic}
