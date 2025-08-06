import asyncio, sounddevice as sd
from pydantic_settings import BaseSettings

HOSTAPIS = sd.query_hostapis()

def hostapi_name(idx: int) -> str:
    return HOSTAPIS[sd.query_devices()[idx]['hostapi']]['name']

def find_device(name_key: str, host_key: str | None = None) -> int:
    for idx, dev in enumerate(sd.query_devices()):
        if name_key.lower() not in dev['name'].lower():
            continue
        if host_key and host_key.lower() not in hostapi_name(idx).lower():
            continue
        return idx
    raise RuntimeError(f"No audio device matches name='{name_key}', host='{host_key}'")

class Settings(BaseSettings):
    # ── Audio capture
    DEV: int   = find_device("In 1-2 (MOTU", host_key="WASAPI")
    SR: int    = 48_000
    WIN_SEC: int = 3
    MIN_CONF: float = 0.30

    # ── OSC target
    TD_IP: str   = "127.0.0.1"
    TD_PORT: int = 7000

    # ── Cross-task data
    DETECTION_Q: asyncio.Queue = asyncio.Queue()
    LATEST_SPECIES: str | None = None        # ← declare it here

    class Config:
        env_file = ".env"

settings = Settings()
