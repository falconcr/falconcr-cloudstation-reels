#!/usr/bin/env bash
# Uso: ./mezclar.sh video-con-voz.mp4 musica.mp3 salida.mp4
# Música por debajo de la voz (baja sola cuando hablás), volumen final -14 LUFS, sin re-renderizar el video.
set -euo pipefail
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$1")
OUT=$(python3 -c "print(max(0, $D - 2.5))")
ffmpeg -v error -y -i "$1" -stream_loop -1 -i "$2" -filter_complex \
"[0:a]loudnorm=I=-16:TP=-2,asplit=2[v][sc];[1:a]atrim=0:$D,volume=0.22,afade=t=in:d=1,afade=t=out:st=$OUT:d=2.5[m];[m][sc]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[md];[v][md]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5[a]" \
-map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -t "$D" "${3%.mp4}.tmp.mp4"
mv "${3%.mp4}.tmp.mp4" "$3"
