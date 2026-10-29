import sys, json
from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8")
import subprocess, numpy as np
raw = subprocess.run(["ffmpeg","-v","error","-i",sys.argv[1],"-ac","1","-ar","16000","-f","f32le","-"],capture_output=True).stdout
audio = np.frombuffer(raw, np.float32)
segs, info = m.transcribe(audio, language="es", word_timestamps=True, vad_filter=True)
words = []
for s in segs:
    for w in s.words:
        words.append({"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)})
json.dump(words, open(sys.argv[2], "w"), ensure_ascii=False)
print(" ".join(x["w"] for x in words))
