# Uso: python3 tiempos.py palabras.json voz.m4a src/guion.json props.json
# Alinea la transcripción con las escenas del guion (aunque Gerardo cambie palabras) y arma props.json
import json, re, sys, subprocess, difflib
words = json.load(open(sys.argv[1]))
# Whisper parte "CI/CD" en "CI" + "-CD": unir esos pedazos con la palabra anterior
w2 = []
for w in words:
    if w2 and w["w"].startswith("-"): w2[-1] = dict(w2[-1], w=w2[-1]["w"] + w["w"], e=w["e"])
    else: w2.append(w)
words = w2
dur = float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",sys.argv[2]],capture_output=True,text=True).stdout)
escenas = json.load(open(sys.argv[3]))["escenas"]
NUM = {"uno":"1","dos":"2","tres":"3","cuatro":"4","cinco":"5","seis":"6","siete":"7","ocho":"8","nueve":"9","diez":"10","primero":"1","segundo":"2","tercero":"3"}
def norm(w):
    w = re.sub(r"[^a-z0-9áéíóúñü]", "", w.lower())
    return NUM.get(w, w)
tw = [norm(w["w"]) for w in words]
idx = [0]
for e in escenas[1:]:
    full = [x for x in (norm(w) for w in e["voz"].split()) if x and x != "número"]
    # si no dijo el "Uno:" / "A," del inicio, probar también sin esa primera palabra
    refs = [full[:6]] + ([full[1:7]] if full and (full[0].isdigit() or len(full[0]) == 1) else [])
    best, bj = -1, None
    for ref in refs:
        for j in range(idx[-1] + 1, len(tw)):
            cand = [x for x in tw[j:j+9] if x != "número"][:len(ref)]
            r = difflib.SequenceMatcher(None, ref, cand).ratio() - 0.002 * (j - idx[-1]) + (0.05 if cand and cand[0] == ref[0] else 0)
            if r > best: best, bj = r, j
    if bj is None or best < 0.3: sys.exit(f"no pude ubicar la escena {e['id']} (mejor {best:.2f})")
    if tw[bj-1:bj] == ["número"]: bj -= 1
    idx.append(bj)
b = [0.0] + [max(0, words[i]["s"] - 0.15) for i in idx[1:]] + [min(dur + 0.3, words[-1]["e"] + 3.0)]
tiempos = []
for n in range(len(idx)):
    fin_i = idx[n+1] if n+1 < len(idx) else len(words)
    tiempos.append({"inicio": round(b[n],2), "fin": round(b[n+1],2), "palabras": words[idx[n]:fin_i]})
# Subtítulos: donde Whisper escribió mal una palabra que sí está en el guion ("Escrivenos" -> "Escribinos"), usar la del guion
for e, t in zip(escenas, tiempos):
    g = e["voz"].split()
    sm = difflib.SequenceMatcher(None, [norm(p["w"]) for p in t["palabras"]], [norm(w) for w in g])
    for op, a1, a2, b1, b2 in sm.get_opcodes():
        if op == "equal":  # misma palabra: tomar la escritura del guion (tildes, "CI/CD")
            for k in range(a2 - a1): t["palabras"][a1+k] = dict(t["palabras"][a1+k], w=g[b1+k])
        if op != "replace": continue
        b = b1
        for a in range(a1, a2):
            for k in range(b, b2):
                if difflib.SequenceMatcher(None, norm(t["palabras"][a]["w"]), norm(g[k])).ratio() >= 0.6:
                    t["palabras"][a] = dict(t["palabras"][a], w=g[k]); b = k + 1; break
    pw = t["palabras"]
    for k in range(len(pw)):  # mayúscula al inicio de cada frase (el guion dice "Uno: cada…" y él no dijo el "Uno:")
        if (k == 0 or re.search(r"[.?!:]$", pw[k-1]["w"])) and pw[k]["w"][:1].islower(): pw[k] = dict(pw[k], w=pw[k]["w"][0].upper() + pw[k]["w"][1:])
json.dump({"voz": "voz.m4a", "tiempos": tiempos}, open(sys.argv[4], "w"), ensure_ascii=False)
for e, t in zip(escenas, tiempos): print(e["id"], t["inicio"], t["fin"], " ".join(p["w"] for p in t["palabras"])[:50])
