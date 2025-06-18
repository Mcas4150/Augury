# rules/engine.py
import pathlib

import yaml

_rules = yaml.safe_load(open(pathlib.Path(__file__).parent.parent / "augury_rules.yaml"))

def evaluate_omen(fact: dict) -> dict:
    species = fact.get("species")
    side = fact.get("side")
    species_class = "oscines" if species in _rules["oscines"] else None

    logic = []

    if species_class == "oscines":
        bird_judgment = _rules["oscines"][species]
        side_judgment = _rules["sides"][side]
        logic.append(f"{species} is oscine → judged by side")
        logic.append(f"{side} side → {side_judgment}")
        if bird_judgment == "favourable" and side_judgment == "favourable":
            return {"omen": "faustum", "logic": logic}
        else:
            return {"omen": "inafaustum", "logic": logic}

    # fallback
    logic.append(f"{species} unknown or unsupported")
    return {"omen": "incertum", "logic": logic}
