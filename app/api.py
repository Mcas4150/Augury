import os, uuid, base64, subprocess, tempfile, platform, random
from pathlib import Path

from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
import edge_tts

from .augur import omen
from .rules.engine import evaluate_omen
from .settings import settings

router = APIRouter()

class OmenResponse(BaseModel):
    proclamation: str
    judgement: str

class AudioResponse(OmenResponse):
    audio_base64: str

class FactsIn(BaseModel):
    species: str | None = None
    side: str | None = None

@router.post("/proclaim", response_model=OmenResponse)
def proclaim(facts: FactsIn | None = Body(None)):
    species = (facts.species if facts else None) or settings.LATEST_SPECIES
    if species is None:
        raise HTTPException(503, "No bird detected yet")
    side = (facts.side if facts else None) or random.choice(["dexter", "sinister"])
    data = {"species": species, "side": side}

    judgement = evaluate_omen(data)["omen"]
    text = omen(data)
    return {"proclamation": text, "judgement": judgement}

@router.post("/proclaim/audio", response_model=AudioResponse)
async def proclaim_audio(facts: FactsIn | None = Body(None)):
    species = (facts.species if facts else None) or settings.LATEST_SPECIES
    if species is None:
        raise HTTPException(503, "No bird detected yet")
    side = (facts.side if facts else None) or random.choice(["dexter", "sinister"])
    data = {"species": species, "side": side}

    judgement = evaluate_omen(data)["omen"]
    text = omen(data)

    tmp = Path(tempfile.gettempdir()) / f"omen_{uuid.uuid4().hex}.mp3"
    tts = edge_tts.Communicate(text, voice="en-US-GuyNeural")
    await tts.save(str(tmp))
    b64 = base64.b64encode(tmp.read_bytes()).decode("ascii")

    # optional local playback
    if platform.system() == "Darwin":
        subprocess.Popen(["afplay", str(tmp)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    elif platform.system() == "Windows":
        subprocess.Popen(["powershell", "-c", f"(New-Object Media.SoundPlayer '{tmp}').PlaySync()"],
                         stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    tmp.unlink(missing_ok=True)
    return {"proclamation": text, "judgement": judgement, "audio_base64": b64}
