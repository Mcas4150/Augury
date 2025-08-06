# ── app/api.py ─────────────────────────────────────────────────────────
import random, os, uuid, base64, subprocess, tempfile, platform
from pathlib import Path

from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from .settings import settings
import edge_tts

from .augur import omen, get_llm
from .rules.engine import evaluate_omen     # ← relative import

router = APIRouter()                         # router, not FastAPI

# ── Schemas ────────────────────────────────────────────────────────────


class OmenResponse(BaseModel):
    proclamation: str
    judgement: str

class AudioResponse(BaseModel):
    proclamation: str
    judgement: str
    audio_base64: str

# ── Text-only endpoint ────────────────────────────────────────────────
@router.post("/proclaim", response_model=OmenResponse)
def proclaim(_: dict | None = Body(None)):
    try:
        get_llm()
        if settings.LATEST_SPECIES is None:
            raise HTTPException(503, "No bird detected yet")

        side  = random.choice(["dexter", "sinister"])
        facts = {"species": settings.LATEST_SPECIES, "side": side}
        judgement  = evaluate_omen(facts)["omen"]
        text       = omen(facts)

        return {"proclamation": text, "judgement": judgement}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

# ── Audio + text endpoint ─────────────────────────────────────────────
@router.post("/proclaim/audio", response_model=AudioResponse)
async def proclaim_audio():
    try:
        get_llm()
        facts      = req.dict()
        judgement  = evaluate_omen(facts)["omen"]
        text       = omen(facts)

        tmp_path = Path(tempfile.gettempdir()) / f"omen_{uuid.uuid4().hex}.mp3"
        communicate = edge_tts.Communicate(text, voice="en-US-GuyNeural")
        await communicate.save(str(tmp_path))

        b64 = base64.b64encode(tmp_path.read_bytes()).decode("ascii")

        if platform.system() == "Darwin":
            subprocess.Popen(["afplay", str(tmp_path)],
                             stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        elif platform.system() == "Windows":
            subprocess.Popen(["powershell", "-c",
                              f"(New-Object Media.SoundPlayer '{tmp_path}').PlaySync()"],
                             stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        tmp_path.unlink(missing_ok=True)
        return {"proclamation": text, "judgement": judgement, "audio_base64": b64}

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
