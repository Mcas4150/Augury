# app/tts.py
import os, httpx, asyncio
from typing import Literal
from .settings import settings

TTSMode = Literal["elevenlabs"]  # trimmed to one mode


async def _tts_elevenlabs_bytes(text: str) -> tuple[bytes, str]:
    api_key = settings.XI_API_KEY or os.getenv("XI_API_KEY")
    if not api_key:
        raise RuntimeError("ElevenLabs: XI_API_KEY missing")

    model_id = settings.ELEVEN_MODEL_ID or "eleven_multilingual_v2"
    fmt      = settings.ELEVEN_OUTPUT_FORMAT or "mp3_44100_128"

    voice_id = settings.ELEVEN_VOICE_ID

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json",
        # Do NOT set Accept—server returns correct type for fmt; Accept can cause 400s in some setups.
    }
    params = {"output_format": fmt}
    payload = {"text": text, "model_id": model_id, "voice_settings": {  "stability": 0.8,"style": 0.3}}

    async with httpx.AsyncClient(timeout=60) as cli:
        r = await cli.post(url, params=params, headers=headers, json=payload)
        if not r.is_success:
            # Surface server's diagnostic—to logs and caller
            raise RuntimeError(f"ElevenLabs {r.status_code}: {r.text}")
        mime = "audio/mpeg" if fmt.startswith("mp3") else ("audio/wav" if fmt.startswith("wav") else "application/octet-stream")
        return r.content, mime

async def synthesize(text: str, temperature: float = 0.3):
    # temperature kept for API parity—unused by ElevenLabs
    audio, mime = await _tts_elevenlabs_bytes(text)
    return audio, mime