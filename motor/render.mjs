// Uso: node render.mjs <salida.mp4> [props.json] [--frames 30,200,...]
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const fi = process.argv.indexOf('--frames');
const [out = 'out/reel.mp4', propsFile] = process.argv.slice(2).filter((a, i, arr) => !a.startsWith('--') && arr[i - 1] !== '--frames');
const stills = fi > 0 ? process.argv[fi + 1].split(',').map(Number) : null;
const inputProps = propsFile ? JSON.parse(fs.readFileSync(propsFile, 'utf8')) : {};
const browserExecutable = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';

const serveUrl = await bundle({entryPoint: path.resolve('src/index.tsx')});
const composition = await selectComposition({serveUrl, id: 'Reel', inputProps, browserExecutable});
fs.mkdirSync(path.dirname(out), {recursive: true});
if (stills) {
  for (const frame of stills) {
    await renderStill({serveUrl, composition, frame, inputProps, browserExecutable, output: `${out}-${frame}.jpg`, imageFormat: 'jpeg', jpegQuality: 85});
  }
} else {
  const tmp = out.replace(/\.mp4$/, '.tmp.mp4');
  await renderMedia({serveUrl, composition, codec: 'h264', inputProps, browserExecutable, outputLocation: tmp, crf: 20, x264Preset: 'veryfast', concurrency: 2,
    onProgress: ({progress}) => { if (Math.round(progress * 100) % 20 === 0) process.stdout.write(`${Math.round(progress * 100)}% `); }});
  fs.renameSync(tmp, out);
}
console.log('\nlisto', composition.durationInFrames, 'frames');
