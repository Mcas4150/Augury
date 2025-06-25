from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from augur import omen, get_llm     # lazy loader exposed

from fastapi.responses import FileResponse
import edge_tts
import uuid
import asyncio
import subprocess


app = FastAPI(title="Augury API", docs_url="/docs")

origins = [
    "http://localhost:3000",   # your Next.js dev URL
    # add any other origins you need in prod, e.g. "https://your-vercel-app.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],      # allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],      # allow all headers
)

class OmenRequest(BaseModel):
    species: str
    side: str

class OmenResponse(BaseModel):
    proclamation: str

@app.post("/proclaim", response_model=OmenResponse)
def proclaim(req: OmenRequest):
    try:
        # Ensure model is loaded on first call only
        get_llm()
        text = omen(req.dict())
        return {"proclamation": text}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/proclaim/audio")
async def proclaim_audio(req: OmenRequest):
    text = omen(req.dict())
    filename = f"temp_{uuid.uuid4().hex}.mp3"
    communicate = edge_tts.Communicate(text, voice="en-US-GuyNeural")
    await communicate.save(filename)
    subprocess.Popen(["afplay", filename])
    return FileResponse(filename, media_type="audio/mpeg", filename="omen.mp3")
