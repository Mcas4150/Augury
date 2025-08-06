# ── app/settings.py (patch) ───────────────────────────────────────────
import asyncio, sounddevice as sd
from pydantic_settings import BaseSettings

HOSTAPIS = sd.query_hostapis()              # list once at import time

def hostapi_name(idx: int) -> str:
    """Return human-readable host-API name for a device index."""
    return HOSTAPIS[sd.query_devices()[idx]['hostapi']]['name']

def find_device(name_key: str, host_key: str | None = None) -> int:
    """
    Return first PortAudio device whose 'name' contains `name_key`
    (case-insensitive) and whose host-API name contains `host_key`
    if that filter is provided.
    """
    for idx, dev in enumerate(sd.query_devices()):
        if name_key.lower() not in dev['name'].lower():
            continue
        if host_key and host_key.lower() not in hostapi_name(idx).lower():
            continue
        return idx
    raise RuntimeError(f"No audio device matches name='{name_key}', host='{host_key}'")

class Settings(BaseSettings):
    DEV: int   = find_device("In 1-2 (MOTU", host_key="WASAPI")
    SR: int    = 48_000
    WIN_SEC: int = 3
    MIN_CONF: float = 0.30

    TD_IP: str   = "127.0.0.1"
    TD_PORT: int = 7000

    DETECTION_Q: asyncio.Queue = asyncio.Queue()
    class Config:
        env_file = ".env"

settings = Settings()
