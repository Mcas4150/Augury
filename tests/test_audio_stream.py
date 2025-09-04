# probe_capture.py
import numpy as np, sounddevice as sd, time

DEV = 26          # In 1-2 (MOTU Pro Audio)
SR  = 48_000

# WASAPI exclusive avoids Windows resampling
was = sd.WasapiSettings(exclusive=True)

with sd.InputStream(device=DEV, samplerate=SR, channels=2,
                    dtype='float32', blocksize=SR//10,  # 100 ms
                    extra_settings=was) as s:
    print("Listening on device 26 … Ctrl-C to stop")
    for _ in range(50):
        data, _ = s.read(SR//10)
        mono = data.mean(axis=1)
        rms = np.sqrt((mono**2).mean())
        print(f"RMS: {rms:.4f}")
        time.sleep(0.1)
