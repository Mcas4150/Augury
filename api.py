import os
import uuid
import base64
import subprocess

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import edge_tts

from augur import omen, get_llm         # lazy-loader exposed
from rules.engine import evaluate_omen   # to extract raw judgement

app = FastAPI(title="Augury API", docs_url="/docs")

# ── CORS ────────────────────────────────────────────────────────────────
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",  # Next.js dev
    # production origins here...
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Schemas ──────────────────────────────────────────────────────────────
class OmenRequest(BaseModel):
    species: str
    side: str

class OmenResponse(BaseModel):
    proclamation: str
    judgement: str

class AudioResponse(BaseModel):
    proclamation: str
    judgement: str
    audio_base64: str

# ── Text-only endpoint ───────────────────────────────────────────────────
@app.post("/proclaim", response_model=OmenResponse)
def proclaim(req: OmenRequest):
    try:
        get_llm()  # ensure model is loaded once
        facts = req.dict()
        # raw judgement from rules.engine
        outcome = evaluate_omen(facts)
        judgement = outcome["omen"]
        # natural language proclamation
        text = omen(facts)
        return {"proclamation": text, "judgement": judgement}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

# ── Audio + text endpoint ───────────────────────────────────────────────
@app.post("/proclaim/audio", response_model=AudioResponse)
async def proclaim_audio(req: OmenRequest):
    try:
        get_llm()
        facts = req.dict()
        outcome = evaluate_omen(facts)
        judgement = outcome["omen"]
        # 1) generate text
        text = omen(facts)

        # 2) synthesize to temp file
        tmpfile = f"/tmp/omen_{uuid.uuid4().hex}.mp3"
        communicate = edge_tts.Communicate(text, voice="en-US-GuyNeural")
        await communicate.save(tmpfile)

        # 3) read + base64-encode
        with open(tmpfile, "rb") as f:
            audio_bytes = f.read()
        b64 = base64.b64encode(audio_bytes).decode("ascii")

        # 4) optionally play locally
        subprocess.Popen(["afplay", tmpfile], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        # 5) cleanup
        os.remove(tmpfile)

        # 6) return both text, judgement, and audio
        return {"proclamation": text, "judgement": judgement, "audio_base64": b64}

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
