# Reels de Cloud Station: flujo automático

Tres tareas programadas siguen este manual (A: guion, B: video, C: tendencias). La estrategia de formatos, estilos y ganchos vive en `estrategia.json`. Cada una arranca en una sesión nueva, sin memoria: todo lo necesario está aquí.

## Datos fijos

| Qué | Valor |
|---|---|
| Repo (este) | `falconcr/falconcr-cloudstation-reels`, rama `main`. Videos en `AAAA/AAAA-MM-DD-<slug>.mp4`, guiones en `guiones/AAAA-MM-DD.json` |
| Link público del video | `https://raw.githubusercontent.com/falconcr/falconcr-cloudstation-reels/main/<ruta del mp4>` |
| Calendario de ideas | Artifact `https://claude.ai/artifact/1wwmZfXG3GS9qNynxzoH84`, base de datos, colección `videos` (campos `tema, notas, serie, n, estado, fecha, formatos, prioridad`; estados `idea → guion → grabado → editado → publicado`) |
| Release `crudos` del repo | videos de Gerardo hablando (`AAAA-MM-DD.mov` o `.mp4`), un solo release para todos; él agrega cada archivo con *Edit release*. Se bajan con `curl -sSL <browser_download_url>` (`get_release_by_tag`, tag `crudos`). Drive no sirve para video: el conector baja máximo 10 MB |
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
4. Leé `estrategia.json`. Elegí:
   - **formato**: el que mejor encaje con el tema, a igualdad de encaje el de mayor `peso`; no repitas el formato del último guion.
   - **estilo**: el siguiente de `rotacion_estilos` después del estilo del último guion (saltá uno si `estilo_por_tema` indica claramente otro para este tema, pero no repitas el del último).
   - **gancho**: uno de los patrones de `ganchos`, adaptado al tema.
5. Si una escena funciona mejor con Gerardo a cámara (la que sigue al gancho, una opinión personal), poné `"camara": "completa"` en esa escena; por defecto solo la primera y el `cta` van con la cara completa.
6. Escribí el guion siguiendo las `reglas` de `estrategia.json`: 40 a 60 segundos leído (110 a 150 palabras), cierre siempre: pedir que deje su opinión y "En Cloud Station te damos más información. Escribinos por WhatsApp." (sin Diagnóstico gratuito) Guardalo como `guiones/<fecha>.json` con la forma de `motor/src/guion.json`: `serie`, `pilar` (CLOUD/SOFTWARE/IA), `estilo`, `formato`, `escenas`. Campos de escena en `motor/src/guion.ts` (`*palabra*` resalta en naranja). Tipos de escena: `hook` (con `grande` opcional), `puntos`, `codigo`, `terminal`, `web`, `nube`, `ia`, `checklist` (`items`), `mito` (`veredicto`), `realidad`, `error`, `solucion`, `linea` (`hora`), `versus` (`a`, `b`), `cifra` (`valor`), `pregunta` (`items`: 2 o 3 opciones), `cta`. **Nada genérico en pantalla:** cada escena tiene que mostrar algo concreto de lo que se dice en su `voz`, pensado para este tema. Varios moldes traen un ejemplo de relleno que sale si no le das contenido, y queda mal (ya pasó: el reel de CI/CD mostraba `git init` mientras se hablaba de compilar y de pruebas). Antes de dar el guion por listo, revisá escena por escena qué se va a ver y llená estos campos:
   - `codigo`: `lineas` (la primera, si empieza con `#` o `//`, va como comentario). Relleno: una función `promedio` en Python.
   - `terminal`: `lineas`; `$ comando` se escribe, `✓ …` sale en verde y `✗ …` / `■ …` en rojo. Relleno: `git init / add / commit / push`.
   - `web`: `nodos` (3 cajas) y `flechas` (2 etiquetas). Relleno: Navegador · API · Base de datos, HTTP · SQL.
   - `ia`: `prompt` (lo que se le pide), `lineas` (la respuesta) y `etiqueta` (sello verde). Relleno: validar un correo con regex.
   - `nube`: `etiqueta` (insignia verde). Relleno: «✓ en producción».
   Máximo unos 30 caracteres por línea. Los comandos, nombres y cifras tienen que ser realistas (que un ingeniero no se ría) y entendibles para alguien de negocio (ejemplos tipo tienda, pagos, facturas). Si ningún molde muestra bien la idea, usá `puntos` o `checklist` con texto antes que un dibujo que no tiene que ver. Ejemplo de cada uno en `motor/muestra-escenas.json`; capturas en `muestras/`. Si el formato usa números ("Uno… Dos…"), poné `numero` en esas escenas.
7. Commit y push al repo.
8. En el calendario (`update` con `if_version`): `estado: "guion"`, `fecha: <fecha>`, `notas: "GUION LISTO, grabá en video y agregalo como <fecha>.mov al release Crudos del repo (o solo audio: <fecha>.m4a a Drive/Cloud Station/Voces): <texto completo para leer>"`. Si el tema es nuevo, creá el documento con el siguiente id libre (`v43`, `v44`…).
9. Agregá al final de `historial` en `estrategia.json`: `{"fecha", "tema", "formato", "estilo"}` (la Tarea C lo cruza con las métricas). Commit y push.
10. Notificá a Gerardo (push) en una línea: tema + formato + que el guion está en el calendario.

## Tarea B: video (martes y viernes, varias veces al día)

1. Fecha = hoy (Costa Rica). Si ya existe un mp4 de esa fecha en el repo, terminá: ya se hizo.
2. Buscá la grabación de la fecha, en este orden:
   - **Video** (modo mixto): en el release `crudos` (`get_release_by_tag`), un archivo cuyo nombre empiece con la fecha.
   - **Audio**: en Drive `Voces`, un archivo cuyo nombre empiece con la fecha.
   Si no hay ninguno: en la última corrida del día (la de las 16:xx) avisale a Gerardo que falta la grabación y terminá; en las demás, terminá sin avisar.
3. Preparar el entorno (una vez por sesión):
   ```bash
   cd motor && npm ci && pip install --break-system-packages -q faster-whisper
   ```
   Chromium ya viene instalado en `/opt/pw-browsers/...` (ruta en `render.mjs`; si cambió, buscá `chrome` con `node -e "console.log(require('playwright').chromium.executablePath())"`).
4. **Audio:** bajá la voz con `download_file_content` (el resultado se guarda en un archivo JSON; decodificá `content` de base64) a `motor/public/voz.m4a`.
   **Video:** bajalo con `curl -sSL` fuera del repo y convertilo (los .MOV del iPhone vienen en HEVC, que Chromium no lee):
   ```bash
   ffmpeg -y -i <crudo> -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p -r 30 -an -movflags +faststart public/cara.mp4
   ffmpeg -y -i <crudo> -vn -c:a aac -b:a 192k public/voz.m4a
   ```
   `cara.mp4` está en `.gitignore`: el crudo nunca se sube al repo.
   Bajá una pista de `Musica` (rotá: no repitas la del video anterior) a `motor/musica.mp3`.
5. Copiá `guiones/<fecha>.json` a `motor/src/guion.json` (el `estilo` del guion decide el look). Si un tipo de escena no existe, agregalo en `Reel.tsx` usando solo los tokens de `brand.ts` (`T` = tema activo, `C` = colores fijos).
6. Transcribí y alineá:
   ```bash
   python3 transcribir.py public/voz.m4a out/palabras.json
   python3 tiempos.py out/palabras.json public/voz.m4a src/guion.json out/props.json
   ```
   Si lo que dijo agrega una herramienta o idea que no está en `claves`, agregala al guion antes de renderizar.
   **Video:** agregá `"camara": "cara.mp4"` a `out/props.json`. Modo mixto: cara a pantalla completa en la primera escena y en el `cta` (con la tarjeta de WhatsApp encima), y en el resto los gráficos con Gerardo en un recuadro vertical abajo a la derecha. Una escena puede fijar `"camara": "completa" | "burbuja" | "oculta"` en el guion. En la revisión de cuadros del paso 7, fijate que los textos no le tapen la cara.
7. Revisá antes del render completo: `node render.mjs out/f out/props.json --frames <un frame por escena, hacia el 60 % de cada una>` y mirá los cuadros: textos cortados, cosas encimadas y, sobre todo, **que lo que se ve corresponda a lo que se dice** en esa escena. Si alguna muestra un ejemplo de relleno (ver la lista de la Tarea A, paso 6), corregí el guion en `guiones/<fecha>.json` (y en `src/guion.json`) antes de renderizar.
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

## Tarea C: tendencias y resultados (el día 1 de cada mes)

1. **Resultados propios.** En Metricool (`getAnalyticsAvailableMetrics` y `getAnalyticsDataByMetrics`, blogId 7116505) sacá, para los reels del mes anterior en Instagram, Facebook, YouTube y TikTok: alcance, reproducciones, retención o tiempo de visualización, interacciones y guardados/compartidos. Cruzalos con `historial` de `estrategia.json` para ver qué **formato**, **estilo** y **gancho** rindió mejor y peor. Con pocos videos, decilo: es una señal, no una conclusión.
2. **Tendencias.** Investigá en la web (búsquedas en el mes en curso) qué está funcionando ahora en reels, Shorts y TikTok educativos de tecnología en español y en inglés: formatos nuevos, tipos de gancho, duración, ritmo, subtítulos, audio y cambios de algoritmo de Instagram, YouTube y TikTok. Preferí fuentes con datos (informes de Metricool, Hootsuite, Later, blogs oficiales de Meta, YouTube y TikTok). Anotá cada fuente.
3. **Ajustes automáticos** en `estrategia.json` (actualizá `actualizado`):
   - `peso` de cada formato: subí los que rindieron mejor, bajá los peores (entre 0.5 y 2; nunca dejes uno en 0).
   - `ganchos` y `reglas`: agregá los patrones nuevos que valgan la pena y quitá los que no funcionaron.
   - Si una tendencia pide un **formato nuevo** que se arma con los tipos de escena existentes, agregalo a `formatos`.
   - Si pide un **tipo de escena nuevo** (otro molde visual), programalo en `motor/src/Reel.tsx` con los tokens de marca, agregá un ejemplo a `motor/muestra-escenas.json`, corré `node muestra.mjs` y revisá las capturas antes de dejarlo. Máximo un molde nuevo por mes.
4. Si encontrás temas que están en tendencia y encajan con Cloud Station (cloud, software, IA), agregá hasta 4 ideas nuevas al calendario (estado `idea`, con la serie que corresponda y una nota "Tendencia <mes>").
5. Escribí `tendencias/AAAA-MM.md`: qué funcionó en tus videos (con números), qué está funcionando afuera, qué cambiaste y las fuentes. Commit y push.
6. Notificá a Gerardo (push) en una o dos líneas: el hallazgo más importante y qué cambió.
