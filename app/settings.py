import asyncio
import sounddevice as sd
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

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
    # Audio capture — resolve at runtime, not import
    DEV: int | None = None
    SR: int = 48_000
    WIN_SEC: int = 3
    MIN_CONF: float = 0.30

    # Ollama
    OLLAMA_URL: str = "http://127.0.0.1:11435"
    OLLAMA_MODEL: str = "llama31-instruct-local"
    NUM_CTX: int = 4096
    NUM_BATCH: int = 512
    NUM_PREDICT: int = 200
    TEMP: float = 0.8

    # OSC target
    TD_IP: str = "127.0.0.1"
    TD_PORT: int = 7000

    # Cross-task data
    DETECTION_Q: asyncio.Queue = asyncio.Queue()
    LATEST_SPECIES: str | None = None

    TTS_MODE: str = "elevenlabs"  # "elevenlabs" | "subprocess" | "http"

    # ElevenLabs
    XI_API_KEY: str = "sk_e7a9fae80a6b73105e2837b19d1b6940bcc7eae34ad02313"  # set in .env
    ELEVEN_VOICE_ID: str = "Z5qTx7MVrv73V3hrssGx"  # set in .env (cloned or stock)
    ELEVEN_MODEL_ID: str = "eleven_flash_v2_5"  # or "eleven_multilingual_v2"
    ELEVEN_OUTPUT_FORMAT: str = "mp3_44100_128"  # see docs for options


    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="AUGURY_",     # prevents collisions with PATH, TEMP, etc.
        case_sensitive=False,
        extra="ignore",
    )

settings = Settings()

def resolve_input_device() -> int:
    if settings.DEV is not None:
        return settings.DEV
    try:
        return find_device("In 1-2 (MOTU", host_key="WASAPI")
    except Exception:
        return sd.default.device[0]

settings.DEV = resolve_input_device()
