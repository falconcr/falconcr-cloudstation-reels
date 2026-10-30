// Renderiza un cuadro de cada escena de muestra en cada estilo
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs'; import path from 'node:path';
const browserExecutable = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const escenas = JSON.parse(fs.readFileSync('muestra-escenas.json', 'utf8'));
const estilos = (process.argv[2] ?? 'espacio,terminal,blueprint,tarjetas').split(',');
const serveUrl = await bundle({entryPoint: path.resolve('src/index.tsx')});
fs.mkdirSync('out/muestra', {recursive: true});
for (const estilo of estilos) {
  const inputProps = {estilo, escenas};
  const composition = await selectComposition({serveUrl, id: 'Reel', inputProps, browserExecutable});
  for (let i = 0; i < escenas.length; i++) {
    await renderStill({serveUrl, composition, frame: i * 120 + 80, inputProps, browserExecutable, output: `out/muestra/${estilo}-${String(i).padStart(2, '0')}-${escenas[i].id}.jpg`, imageFormat: 'jpeg', jpegQuality: 82});
  }
  console.log('listo', estilo);
}
