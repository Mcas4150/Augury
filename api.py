import os
import uuid
import base64
import subprocess

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import FileResponse

import edge_tts

from augur import omen, get_llm  # lazy-loader exposed

app = FastAPI(title="Augury API", docs_url="/docs")

# ── CORS ────────────────────────────────────────────────────────────────
origins = [
    "http://localhost:3000",   # Next.js dev
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

class AudioResponse(BaseModel):
    proclamation: str
    audio_base64: str

# ── Text-only endpoint ───────────────────────────────────────────────────
@app.post("/proclaim", response_model=OmenResponse)
def proclaim(req: OmenRequest):
    try:
        get_llm()  # ensure model is loaded once
        text = omen(req.dict())
        return {"proclamation": text}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

# ── Audio + text endpoint ───────────────────────────────────────────────
@app.post("/proclaim/audio", response_model=AudioResponse)
async def proclaim_audio(req: OmenRequest):
    try:
        get_llm()
        # 1) generate text
        text = omen(req.dict())

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

        # 5) cleanup temp file
        os.remove(tmpfile)

        # 6) return both
        return {"proclamation": text, "audio_base64": b64}

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
