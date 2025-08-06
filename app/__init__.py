import asyncio, logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import router
from .birdnet_live import run_birdnet

log = logging.getLogger("augury")

app = FastAPI(title="Augury API", docs_url="/docs")
app.include_router(router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def _start_birdnet():
    asyncio.create_task(run_birdnet())
    log.info("BirdNET task started")
