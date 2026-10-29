# Reels de Cloud Station: flujo automático

Dos tareas programadas siguen este manual. Cada una arranca en una sesión nueva, sin memoria: todo lo necesario está aquí.

## Datos fijos

| Qué | Valor |
|---|---|
| Repo (este) | `falconcr/falconcr-cloudstation-reels`, rama `main`. Videos en `AAAA/AAAA-MM-DD-<slug>.mp4`, guiones en `guiones/AAAA-MM-DD.json` |
| Link público del video | `https://raw.githubusercontent.com/falconcr/falconcr-cloudstation-reels/main/<ruta del mp4>` |
| Calendario de ideas | Artifact `https://claude.ai/artifact/1wwmZfXG3GS9qNynxzoH84`, base de datos, colección `videos` (campos `tema, notas, serie, n, estado, fecha, formatos, prioridad`; estados `idea → guion → grabado → editado → publicado`) |
| Drive `Cloud Station/Voces` | carpeta `1sRAL12Mm_tRx4D265i2AsG3nAx34VGXo`. Nota de voz con la fecha del video en el nombre: `AAAA-MM-DD.m4a` (o .mp3/.ogg/.wav) |
| Drive `Cloud Station/Musica` | carpeta `1rKTsmJJejHDkypMpIF08EDL21WAsth0a` (pistas libres de Pixabay; rotarlas) |
| Metricool | marca Cloudstation, `blogId` `7116505`. Redes: instagram, facebook, youtube, tiktok |
| WhatsApp de la empresa | **+506 8339 3375** (el único que se publica) |
| Publicación | martes y viernes, 18:00 `America/Costa_Rica`, publicación automática |
| Marca | sistema de diseño `https://claude.ai/artifact/TEJrFhxafhnS7Mw2qp6A37`; tokens ya aplicados en `motor/src/brand.ts` |

Voz: español centroamericano de vos ("escribinos", "migrá"). Para gente con problemas de negocio, no solo técnicos. Primero el problema, después la herramienta. Sin promesas vacías.

## Tarea A: guion (domingo y miércoles)

1. Calculá la fecha del próximo video: el domingo → el martes siguiente; el miércoles → el viernes siguiente.
2. Si ya existe `guiones/<fecha>.json` en el repo, terminá sin hacer nada.
3. Leé la colección `videos`. Elegí el tema: primero los de `prioridad: true` en estado `idea`; si no hay, el de estado `idea` cuya serie se haya publicado hace más tiempo (rotá series, no repitas la del último video). Si Gerardo dejó un tema con `fecha` igual a esa fecha, usá ese.
4. Escribí el guion: 40 a 60 segundos leído (110 a 150 palabras), gancho fuerte en la primera frase, 3 a 5 puntos numerados ("Uno… Dos…"), cierre: "En Cloud Station … Escribinos por WhatsApp." Guardalo como `guiones/<fecha>.json` con la misma forma que `motor/src/guion.json` (`serie`, `pilar` CLOUD/SOFTWARE/IA, `escenas` con `id, tipo, numero?, titulo, claves, voz, seg`). Tipos visuales disponibles en `motor/src/Reel.tsx`: `hook, codigo, terminal, web, nube, ia, proyectos, puntos, cta`. `puntos` sirve para cualquier tema; la Tarea B puede crear tipos nuevos.
5. Commit y push al repo.
6. En el calendario (`update` con `if_version`): `estado: "guion"`, `fecha: <fecha>`, `notas: "GUION LISTO, grabá y subí <fecha>.m4a a Drive/Cloud Station/Voces: <texto completo para leer>"`. Si el tema es nuevo, creá el documento con el siguiente id libre (`v43`, `v44`…).
7. Notificá a Gerardo (push) en una línea: tema + que el guion está en el calendario.

## Tarea B: video (martes y viernes, varias veces al día)

1. Fecha = hoy (Costa Rica). Si ya existe un mp4 de esa fecha en el repo, terminá: ya se hizo.
2. Buscá en Drive `Voces` un archivo cuyo nombre empiece con la fecha. Si no está: en la última corrida del día (la de las 16:xx) avisale a Gerardo que falta la nota de voz y terminá; en las demás, terminá sin avisar.
3. Preparar el entorno (una vez por sesión):
   ```bash
   cd motor && npm ci && pip install --break-system-packages -q faster-whisper
   ```
   Chromium ya viene instalado en `/opt/pw-browsers/...` (ruta en `render.mjs`; si cambió, buscá `chrome` con `node -e "console.log(require('playwright').chromium.executablePath())"`).
4. Bajá la voz con `download_file_content` (el resultado se guarda en un archivo JSON; decodificá `content` de base64) a `motor/public/voz.m4a`. Bajá una pista de `Musica` (rotá: no repitas la del video anterior) a `motor/musica.mp3`.
5. Copiá `guiones/<fecha>.json` a `motor/src/guion.json`. Si un tipo de escena no existe, agregalo en `Reel.tsx` usando solo los tokens de `brand.ts`.
6. Transcribí y alineá:
   ```bash
   python3 transcribir.py public/voz.m4a out/palabras.json
   python3 tiempos.py out/palabras.json public/voz.m4a src/guion.json out/props.json
   ```
   Si lo que dijo agrega una herramienta o idea que no está en `claves`, agregala al guion antes de renderizar.
7. Revisá antes del render completo: `node render.mjs out/f out/props.json --frames <un frame por escena>` y mirá los cuadros (textos cortados, cosas encimadas).
8. Render (unos 12 minutos con 2 núcleos; correlo en segundo plano):
   ```bash
   node render.mjs out/voz.mp4 out/props.json
   ./mezclar.sh out/voz.mp4 musica.mp3 out/final.mp4
   ```
9. Copiá `out/final.mp4` a `AAAA/<fecha>-<slug>.mp4`, commit y push. Verificá que el link raw responda 200.
10. Programá en Metricool (`createScheduledPost`, `blogId` 7116505, fecha `<fecha>T18:00:00-06:00`, `publicationDate.timezone` `America/Costa_Rica`, `autoPublish: true`):
    - `media`: el link raw; `videoCoverMilliseconds`: 3000
    - providers: instagram, facebook, youtube, tiktok
    - `instagramData`: `type: REEL`, collaborators `gelopfalcon`
    - `facebookData`: `type: REEL`, `title`
    - `youtubeData`: `type: short`, `privacy: public`, `madeForKids: false`, `category: EDUCATION`, `title`, tags
    - `tiktokData`: `privacyOption: PUBLIC_TO_EVERYONE`, `commercialContentOwnBrand: true`, `title` (la cuenta de TikTok es @gelopfalcon; mencioná @cloudstation.sh en el texto)
    - `text`: gancho + los puntos + pregunta para comentarios + "En Cloud Station (@cloudstation.sh) damos cursos de cloud, software e IA. Escribinos por WhatsApp: +506 8339 3375" + 5 o 6 hashtags
11. Calendario: `estado: "publicado"` (programado), `notas` con "Reel con voz programado 18:00 en IG, FB, YouTube y TikTok".
12. Notificá a Gerardo (push): tema + "programado 6 p. m." + link de Metricool (`plannerUrl`).

Si algo falla (transcripción, render, Metricool), no publiques a medias: avisale a Gerardo qué pasó y en qué paso quedó.
