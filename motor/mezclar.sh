#!/usr/bin/env bash
# Uso: ./mezclar.sh video-con-voz.mp4 musica.mp3 salida.mp4
# Música por debajo de la voz (baja sola cuando hablás), volumen final -14 LUFS, sin re-renderizar el video.
# loudnorm retiene ~3 s al final: se rellena con silencio (apad) antes de cada loudnorm y se recorta a la duración
# del video al final; si no, se perdían las últimas palabras de la voz.
set -euo pipefail
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$1")
OUT=$(python3 -c "print(max(0, $D - 2.5))")
DM=$(python3 -c "print($D + 4)")
ffmpeg -v error -y -i "$1" -stream_loop -1 -i "$2" -filter_complex \
"[0:a]apad=pad_dur=4,asplit=2[v0][sc];[v0]loudnorm=I=-16:TP=-2[v];[1:a]atrim=0:$DM,volume=0.22,afade=t=in:d=1,afade=t=out:st=$OUT:d=2.5[m];[m][sc]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[md];[v][md]amix=inputs=2:normalize=0:duration=first,apad=pad_dur=4,loudnorm=I=-14:TP=-1.5,atrim=0:$D[a]" \
-map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -t "$D" "${3%.mp4}.tmp.mp4"
mv "${3%.mp4}.tmp.mp4" "$3"
