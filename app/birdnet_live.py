# app/birdnet_live.py
import asyncio, queue, numpy as np, sounddevice as sd, logging
from datetime import datetime
from birdnetlib.analyzer import Analyzer
from birdnetlib import RecordingBuffer
from pythonosc.udp_client import SimpleUDPClient
from .settings import settings            # holds DEV, SR, etc.

log  = logging.getLogger(__name__)
osc  = SimpleUDPClient(settings.TD_IP, settings.TD_PORT)
analyzer = Analyzer()
q    = queue.Queue(maxsize=20)
ring = np.empty(0, dtype=np.float32)

def _callback(indata, frames, time, status):
    if status:
        log.warning(status)
    try:
        q.put_nowait(indata.mean(axis=1).astype(np.float32))
    except queue.Full:
        pass

async def run_birdnet():
    was = sd.WasapiSettings(exclusive=False)
    with sd.InputStream(device=settings.DEV, samplerate=settings.SR,
                        channels=2, dtype='float32',
                        blocksize=settings.SR//2,
                        callback=_callback, extra_settings=was):
        log.info("BirdNET mic opened")
        while True:
            # non-blocking pull from the audio queue
            try:
                chunk = q.get_nowait()
                global ring
                ring = np.append(ring, chunk)
                while len(ring) >= settings.WIN_SEC * settings.SR:
                    buf, ring = ring[:settings.WIN_SEC*settings.SR], ring[settings.WIN_SEC*settings.SR:]
                    rec = RecordingBuffer(analyzer, buf, rate=settings.SR,
                                          date=datetime.utcnow(), min_conf=settings.MIN_CONF)
                    rec.analyze()
                    for d in rec.detections:
                        species = d["common_name"]
                        conf    = round(d["confidence"], 3)
                        osc.send_message("/birdnet/detect", [species, conf])
                        settings.LATEST_SPECIES = species
                        # stash to a global asyncio.Queue for the augur route if needed
                        await settings.DETECTION_Q.put({"species": species, "conf": conf})
                await asyncio.sleep(0)   # yield
            except queue.Empty:
                await asyncio.sleep(0.01)
