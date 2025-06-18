# tests/test_rules.py
from rules.engine import evaluate_omen

def test_raven_right():
    data = {"species": "corvus corax", "side": "dexter"}
    result = evaluate_omen(data)
    assert result["omen"] == "faustum"
    assert "oscine" in result["logic"][0]

def test_raven_left():
    data = {"species": "corvus corax", "side": "sinister"}
    result = evaluate_omen(data)
    assert result["omen"] == "inafaustum"

def test_unknown_bird():
    data = {"species": "phoenix fictus", "side": "dexter"}
    result = evaluate_omen(data)
    assert result["omen"] == "incertum"
