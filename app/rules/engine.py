# ── rules/engine.py ───────────────────────────────────────────────────────
import pathlib
import yaml

RULES_FILE = pathlib.Path(__file__).parent.parent / "augury_rules.yaml"
with RULES_FILE.open("r", encoding="utf-8") as f:        # ← key fix
    _rules = yaml.safe_load(f)

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
        bird_judgment = _rules["oscines"].get(sp)
        side_judgment = _rules["sides"].get(side)
        logic.append(f"{sp} is oscine → judged by side")
        logic.append(f"{side} side → {side_judgment}")

        if bird_judgment == "favourable" and side_judgment == "favourable":
            return {"omen": "faustum", "logic": logic}
        elif bird_judgment is None or side_judgment is None:
            logic.append("missing specific data for bird or side")
            return {"omen": "incertum", "logic": logic}
        else:
            return {"omen": "inafaustum", "logic": logic}

    # fallback
    logic.append(f"{sp} unknown or unsupported")
    return {"omen": "incertum", "logic": logic}



def inaugurate_omen(fact: dict) -> dict:
    # inputs: prior favor & chosen door
    raw_favor = fact.get("favor", "")
    raw_door  = fact.get("door", "")

    favor = raw_favor.strip().lower()
    door  = raw_door.strip().lower()

    favor_syns = _rules.get("favor_synonyms", {})
    door_syns  = _rules.get("door_synonyms", {})

    favor = favor_syns.get(favor, favor)
    door  = door_syns.get(door, door)

    logic = []

    doors = _rules.get("doors", {})
    door_node = doors.get(door)
    if not door_node:
        logic.append(f"door '{door}' unknown")
        return {"omen": "incertum", "logic": logic}

    if favor == "favourable":
        outcome = "faustum"
    elif favor == "unfavourable":
        outcome = "inafaustum"
    else:
        outcome = "incertum"

    logic.append(f"door={door} → contexts found")
    logic.append(f"favor={favor} → outcome={outcome}")

    # surface structured context so the LLM can riff sensibly
    return {
        "omen": outcome,
        "door": door,
        "favor": favor,
        "context": {
            "title": door_node.get("title"),
            "good": door_node.get("good"),
            "bad":  door_node.get("bad"),
            "primer": door_node.get("primer"),  # optional, see YAML below
        },
        "logic": logic,
    }
