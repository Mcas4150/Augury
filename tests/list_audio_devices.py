import sounddevice as sd
# for idx, d in enumerate(sd.query_devices()):
#     print(f"{idx:2d}  {d['name']}")

for idx, dev in enumerate(sd.query_devices()):
    host = sd.query_hostapis(dev['hostapi'])['name']
    print(f"{idx:2d}  {dev['name']:<35}  {host}")