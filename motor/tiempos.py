# Uso: python3 tiempos.py palabras.json voz.m4a src/guion.json props.json
# Alinea la transcripción con las escenas del guion (aunque Gerardo cambie palabras) y arma props.json
import json, re, sys, subprocess, difflib
words = json.load(open(sys.argv[1]))
dur = float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",sys.argv[2]],capture_output=True,text=True).stdout)
escenas = json.load(open(sys.argv[3]))["escenas"]
NUM = {"uno":"1","dos":"2","tres":"3","cuatro":"4","cinco":"5","seis":"6","siete":"7","ocho":"8","nueve":"9","diez":"10","primero":"1","segundo":"2","tercero":"3"}
def norm(w):
    w = re.sub(r"[^a-z0-9áéíóúñü]", "", w.lower())
    return NUM.get(w, w)
tw = [norm(w["w"]) for w in words]
idx = [0]
for e in escenas[1:]:
    ref = [x for x in (norm(w) for w in e["voz"].split()) if x and x != "número"][:6]
    best, bj = -1, None
    for j in range(idx[-1] + 1, len(tw)):
        cand = [x for x in tw[j:j+9] if x != "número"][:len(ref)]
        r = difflib.SequenceMatcher(None, ref, cand).ratio() - 0.002 * (j - idx[-1])
        if r > best: best, bj = r, j
    if bj is None or best < 0.3: sys.exit(f"no pude ubicar la escena {e['id']} (mejor {best:.2f})")
    if tw[bj-1:bj] == ["número"]: bj -= 1
    idx.append(bj)
b = [0.0] + [max(0, words[i]["s"] - 0.15) for i in idx[1:]] + [min(dur + 0.3, words[-1]["e"] + 3.0)]
tiempos = []
for n in range(len(idx)):
    fin_i = idx[n+1] if n+1 < len(idx) else len(words)
    tiempos.append({"inicio": round(b[n],2), "fin": round(b[n+1],2), "palabras": words[idx[n]:fin_i]})
json.dump({"voz": "voz.m4a", "tiempos": tiempos}, open(sys.argv[4], "w"), ensure_ascii=False)
for e, t in zip(escenas, tiempos): print(e["id"], t["inicio"], t["fin"], " ".join(p["w"] for p in t["palabras"])[:50])
