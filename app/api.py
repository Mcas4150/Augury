import base64
import random

from fastapi import APIRouter, Body, HTTPException
from pydantic import BaseModel

from .augur import omen
from .rules.engine import evaluate_omen
from .settings import settings
from .tts import synthesize

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

    try:
        audio_bytes, mime = await synthesize(text, temperature=0.3)
    except Exception as e:
        # Log full detail server-side; return clean message client-side
        # (FastAPI will still log the exception message)
        raise HTTPException(status_code=502, detail=f"TTS failed — {e}")

    b64 = base64.b64encode(audio_bytes).decode("ascii")
    return {"proclamation": text, "judgement": judgement, "audio_base64": b64}
