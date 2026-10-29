import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, Audio} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import {fade} from '@remotion/transitions/fade';
import {C, F, FPS, TRANS} from './brand';
import {guion, Escena, SERIE, PILAR, WHATSAPP} from './guion';

export type ReelProps = {voz?: string; musica?: string; tiempos?: {inicio: number; fin: number; palabras?: {w: string; s: number; e: number}[]}[]};

// ---------- tiempos ----------
export const duraciones = (props: ReelProps) =>
  guion.map((e, i) => {
    const t = props.tiempos?.[i];
    const seg = t ? t.fin - t.inicio : e.seg;
    return Math.round(seg * FPS) + (i < guion.length - 1 ? TRANS : 0);
  });
export const totalFrames = (props: ReelProps) => {
  const d = duraciones(props);
  return d.reduce((a, b) => a + b, 0) - TRANS * (d.length - 1);
};
const inicios = (props: ReelProps) => {
  const d = duraciones(props);
  const s: number[] = [];
  let acc = 0;
  d.forEach((x) => { s.push(acc); acc += x - TRANS; });
  return s;
};

// ---------- utilidades ----------
const useIn = (delay = 0, damping = 14) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: {damping, mass: 0.7}});
};
const Star: React.FC<{x: number; y: number; s: number; delay?: number; color?: string}> = ({x, y, s, delay = 0, color = C.naranja}) => {
  const f = useCurrentFrame();
  const k = useIn(delay, 10);
  const tw = 1 + 0.08 * Math.sin((f + delay * 3) / 9);
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" style={{position: 'absolute', left: x, top: y, transform: `scale(${k * tw}) rotate(${(1 - k) * 90}deg)`}}>
      <path d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12 7-1 11-5 12-12z" fill={color} />
    </svg>
  );
};
const Chip: React.FC<{children: React.ReactNode; delay: number; solid?: boolean}> = ({children, delay, solid}) => {
  const k = useIn(delay);
  return (
    <span style={{display: 'inline-block', transform: `translateY(${(1 - k) * 40}px)`, opacity: k, font: `700 44px/1 ${F.body}`, padding: '18px 34px', borderRadius: 999,
      background: solid ? C.naranja : C.alt, color: solid ? C.onAccent : C.brandInk, border: `3px solid ${solid ? C.naranja : C.line}`}}>{children}</span>
  );
};
const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties; delay?: number}> = ({children, style, delay = 6}) => {
  const k = useIn(delay);
  return <div style={{background: C.alt, border: `3px solid ${C.line}`, borderRadius: 28, padding: 44, transform: `translateY(${(1 - k) * 80}px)`, opacity: k, ...style}}>{children}</div>;
};
const Typed: React.FC<{text: string; start: number; cps?: number}> = ({text, start, cps = 26}) => {
  const f = useCurrentFrame();
  const n = Math.max(0, Math.floor(((f - start) / FPS) * cps));
  const shown = text.slice(0, n);
  const cursor = n < text.length || Math.floor(f / 15) % 2 === 0;
  return <>{shown}<span style={{color: C.naranja, opacity: cursor ? 1 : 0}}>▍</span></>;
};

// ---------- fondo y capas fijas ----------
const Fondo: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 85% 85%, rgba(30,58,138,0.55) 0, rgba(30,58,138,0) 55%), ${C.noche}`}}>
      <AbsoluteFill style={{backgroundImage: `radial-gradient(${C.line} 3px, transparent 3.5px)`, backgroundSize: '72px 72px', backgroundPosition: `36px ${(f * 0.4) % 72}px`, opacity: 0.55}} />
    </AbsoluteFill>
  );
};

const Header: React.FC<{props: ReelProps}> = ({props}) => {
  const f = useCurrentFrame();
  const s = inicios(props);
  const idx = s.filter((x) => f >= x - TRANS / 2).length - 1;
  const actual = guion[Math.max(0, idx)];
  const esCta = actual.tipo === 'cta';
  return (
    <div style={{position: 'absolute', top: 150, left: 72, right: 72, opacity: esCta ? 0 : 1}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Img src={staticFile('isotipo-blanco.png')} style={{width: 104}} />
        <span style={{font: `700 30px/1 ${F.body}`, letterSpacing: '0.08em', color: C.brandInk, padding: '14px 26px', borderRadius: 999, background: C.alt, border: `2px solid ${C.line}`}}>
          {SERIE} · <span style={{color: C.accentInk}}>{PILAR}</span>
        </span>
      </div>
      <div style={{display: 'flex', gap: 14, marginTop: 34}}>
        {[1, 2, 3, 4, 5].map((n) => {
          const done = (actual.numero ?? (actual.tipo === 'hook' ? 0 : 6)) >= n;
          return <div key={n} style={{flex: 1, height: 10, borderRadius: 5, background: done ? C.naranja : C.line}} />;
        })}
      </div>
    </div>
  );
};

// subtítulos por grupos de palabras; con transcripción usan los tiempos reales de cada palabra
const Subtitulos: React.FC<{props: ReelProps}> = ({props}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const s = inicios(props);
  const d = duraciones(props);
  let palabras: {w: string; s: number; e: number}[] = [];
  guion.forEach((e, i) => {
    const real = props.tiempos?.[i]?.palabras;
    if (real) { palabras = palabras.concat(real); return; }
    const ws = e.voz.split(' ');
    const a = s[i] / FPS + 0.2, b = (s[i] + d[i] - TRANS) / FPS - 0.3;
    const peso = ws.map((w) => w.length + 2), tot = peso.reduce((x, y) => x + y, 0);
    let acc = a;
    ws.forEach((w, j) => { const dur = ((b - a) * peso[j]) / tot; palabras.push({w, s: acc, e: acc + dur}); acc += dur; });
  });
  // agrupar: máx 4 palabras o corte en puntuación
  const grupos: typeof palabras[] = [];
  let g: typeof palabras = [];
  palabras.forEach((p) => { g.push(p); if (g.length >= 4 || /[.:,?]$/.test(p.w)) { grupos.push(g); g = []; } });
  if (g.length) grupos.push(g);
  const actual = grupos.find((gr) => t >= gr[0].s - 0.05 && t <= gr[gr.length - 1].e + 0.15);
  if (!actual) return null;
  const k = Math.min(1, (t - actual[0].s + 0.05) * 8);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1395, display: 'flex', justifyContent: 'center'}}>
      <div style={{font: `700 64px/1.15 ${F.body}`, textAlign: 'center', color: C.ink, background: 'rgba(11,21,51,0.82)', padding: '18px 34px', borderRadius: 24, transform: `scale(${0.92 + 0.08 * k})`}}>
        {actual.map((p, i) => (
          <span key={i} style={{color: t >= p.s ? (t <= p.e ? C.naranja : C.ink) : C.muted}}>{p.w}{i < actual.length - 1 ? ' ' : ''}</span>
        ))}
      </div>
    </div>
  );
};

// ---------- título de punto ----------
const Titulo: React.FC<{e: Escena}> = ({e}) => {
  const k = useIn(0);
  const k2 = useIn(5);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 36}}>
      {e.numero && (
        <div style={{width: 150, height: 150, flex: 'none', borderRadius: 75, background: C.naranja, color: C.onAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 96px/1 ${F.display}`, transform: `scale(${k})`}}>{e.numero}</div>
      )}
      <div style={{font: `700 84px/0.98 ${F.display}`, color: C.ink, opacity: k2, transform: `translateX(${(1 - k2) * 60}px)`, textWrap: 'balance' as any}}>{e.titulo}</div>
    </div>
  );
};
const Claves: React.FC<{e: Escena; delay: number}> = ({e, delay}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', gap: 18}}>{e.claves?.map((c, i) => <Chip key={c} delay={delay + i * 7}>{c}</Chip>)}</div>
);
const Zona: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{transform: `scale(${1 + Math.min(useCurrentFrame(), 360) * 0.00008})`}}><div style={{position: 'absolute', top: 340, left: 72, right: 72, height: 1020, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 64}}>{children}</div></AbsoluteFill>
);

// ---------- escenas ----------
const Hook: React.FC<{e: Escena}> = () => {
  const f = useCurrentFrame();
  const a = useIn(0), b = useIn(8, 9), c = useIn(22);
  return (
    <Zona>
      <div style={{marginTop: 40, font: `600 76px/1 ${F.display}`, color: C.brandInk, opacity: a, transform: `translateY(${(1 - a) * 40}px)`}}>Si volviera a tener</div>
      <div style={{position: 'relative', height: 560}}>
        <div style={{position: 'absolute', left: -20, top: -40, font: `700 620px/1 ${F.display}`, color: C.naranja, letterSpacing: '-0.04em', transform: `scale(${b})`, transformOrigin: 'left center'}}>18</div>
        <div style={{position: 'absolute', left: 700, top: 360, font: `700 96px/1 ${F.display}`, color: C.ink, opacity: c}}>años</div>
        <Star x={760} y={40} s={110} delay={14} />
        <Star x={900} y={200} s={64} delay={20} />
        <Star x={650} y={-20} s={50} delay={26} />
      </div>
      <div style={{font: `700 80px/1.02 ${F.display}`, color: C.ink, opacity: c, transform: `translateY(${(1 - c) * 50}px)`}}>
        esto es lo que estudiaría en <span style={{color: C.naranja}}>software</span>
      </div>
      <div style={{height: 8, width: interpolate(f, [30, 70], [0, 420], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)}), background: C.naranja, borderRadius: 4}} />
    </Zona>
  );
};

const Codigo: React.FC<{e: Escena}> = ({e}) => (
  <Zona>
    <Titulo e={e} />
    <Card style={{font: `500 40px/1.6 ${F.mono}`, color: C.ink, minHeight: 360}}>
      <div style={{color: C.muted, marginBottom: 12}}># resolver un problema real</div>
      <div style={{whiteSpace: 'pre'}}><Typed start={20} text={'def promedio(notas):\n    total = sum(notas)\n    return total / len(notas)\n\nprint(promedio([8, 9, 10]))'} /></div>
    </Card>
    <Claves e={e} delay={40} />
  </Zona>
);

const Terminal: React.FC<{e: Escena}> = ({e}) => {
  const f = useCurrentFrame();
  const lines = ['git init', 'git add .', 'git commit -m "primer proyecto"', 'git push origin main'];
  return (
    <Zona>
      <Titulo e={e} />
      <Card style={{padding: 0, overflow: 'hidden', background: '#070d24'}}>
        <div style={{display: 'flex', gap: 14, padding: '24px 32px', borderBottom: `3px solid ${C.line}`}}>
          {[C.naranja, C.brandInk, C.line].map((c, i) => <div key={i} style={{width: 24, height: 24, borderRadius: 12, background: c}} />)}
          <span style={{marginLeft: 18, font: `500 30px/24px ${F.mono}`, color: C.muted}}>gerardo@cloudstation: ~</span>
        </div>
        <div style={{padding: 40, font: `500 42px/1.7 ${F.mono}`, color: C.ink}}>
          {lines.map((l, i) => {
            const st = 18 + i * 26;
            if (f < st) return null;
            return <div key={i}><span style={{color: C.ok}}>$ </span>{f < st + 24 ? <Typed start={st} text={l} cps={32} /> : l}</div>;
          })}
        </div>
      </Card>
      <Claves e={e} delay={60} />
    </Zona>
  );
};

const Web: React.FC<{e: Escena}> = ({e}) => {
  const f = useCurrentFrame();
  const nodes = [{x: 0, t: 'Navegador'}, {x: 330, t: 'API'}, {x: 660, t: 'Base de datos'}];
  const p = interpolate(f % 70, [0, 35, 70], [0, 1, 0]);
  const px = 135 + p * 660;
  return (
    <Zona>
      <Titulo e={e} />
      <div style={{position: 'relative', height: 420}}>
        <svg width={936} height={420} style={{position: 'absolute'}}>
          <line x1={135} y1={150} x2={795} y2={150} stroke={C.line} strokeWidth={8} strokeLinecap="round" strokeDasharray="4 22" />
          <circle cx={px} cy={150} r={20} fill={C.naranja} opacity={f > 30 ? 1 : 0} />
        </svg>
        {nodes.map((n, i) => (
          <Node key={i} x={n.x} label={n.t} delay={8 + i * 8} i={i} />
        ))}
        <span style={{position: 'absolute', left: 300, top: 96, transform: 'translateX(-50%)', font: `700 32px/1 ${F.mono}`, color: C.accentInk}}>HTTP</span>
        <span style={{position: 'absolute', left: 630, top: 96, transform: 'translateX(-50%)', font: `700 32px/1 ${F.mono}`, color: C.accentInk}}>SQL</span>
      </div>
      <Claves e={e} delay={44} />
    </Zona>
  );
};
const Node: React.FC<{x: number; label: string; delay: number; i: number}> = ({x, label, delay, i}) => {
  const k = useIn(delay);
  const g = {stroke: C.ink, strokeWidth: 8, fill: 'none', strokeLinecap: 'round' as const};
  return (
    <div style={{position: 'absolute', left: x, top: 40, width: 270, textAlign: 'center', transform: `scale(${k})`}}>
      <div style={{width: 220, height: 220, margin: '0 auto', borderRadius: 40, background: C.alt, border: `4px solid ${i === 1 ? C.naranja : C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width={120} height={120} viewBox="0 0 120 120">
          {i === 0 && <><rect x={10} y={20} width={100} height={80} rx={14} {...g} /><line x1={10} y1={44} x2={110} y2={44} {...g} /><circle cx={28} cy={32} r={3} fill={C.naranja} /></>}
          {i === 1 && <text x={60} y={80} textAnchor="middle" style={{font: `700 64px ${F.mono}`}} fill={C.naranja}>{'{ }'}</text>}
          {i === 2 && <><ellipse cx={60} cy={28} rx={40} ry={14} {...g} /><path d="M20 28v64c0 8 18 14 40 14s40-6 40-14V28" {...g} /><path d="M20 60c0 8 18 14 40 14s40-6 40-14" {...g} /></>}
        </svg>
      </div>
      <div style={{marginTop: 22, font: `600 36px/1.1 ${F.body}`, color: C.muted}}>{label}</div>
    </div>
  );
};

const Nube: React.FC<{e: Escena}> = ({e}) => {
  const f = useCurrentFrame();
  const g = {stroke: C.ink, strokeWidth: 12, fill: 'none', strokeLinecap: 'round' as const};
  const ok = useIn(70);
  return (
    <Zona>
      <Titulo e={e} />
      <div style={{position: 'relative', height: 440}}>
        <svg width={936} height={440} style={{position: 'absolute'}}>
          <path d="M300 300 a90 90 0 0 1 60 -170 a120 120 0 0 1 220 -10 a90 90 0 0 1 80 180 z" {...g} stroke={C.brandInk} opacity={useIn(4)} />
          {[0, 1, 2].map((i) => {
            const y = interpolate(f, [16 + i * 12, 46 + i * 12], [460, 190], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.4))});
            const x = 370 + i * 105;
            return (
              <g key={i} transform={`translate(${x},${y})`}>
                <rect width={90} height={70} rx={12} fill={i === 1 ? C.naranja : C.azul} stroke={i === 1 ? C.naranja : C.brandInk} strokeWidth={4} />
                {[22, 45, 68].map((lx) => <line key={lx} x1={lx} y1={14} x2={lx} y2={56} stroke={i === 1 ? C.onAccent : C.brandInk} strokeWidth={4} strokeLinecap="round" />)}
              </g>
            );
          })}
        </svg>
        <div style={{position: 'absolute', right: 20, bottom: 10, font: `700 40px/1 ${F.body}`, color: C.onAccent, background: C.ok, padding: '16px 28px', borderRadius: 999, transform: `scale(${ok})`}}>✓ en producción</div>
      </div>
      <Claves e={e} delay={40} />
    </Zona>
  );
};

const IA: React.FC<{e: Escena}> = ({e}) => {
  const a = useIn(10), b = useIn(40), c = useIn(110, 9);
  return (
    <Zona>
      <Titulo e={e} />
      <div style={{display: 'flex', flexDirection: 'column', gap: 28}}>
        <div style={{alignSelf: 'flex-end', maxWidth: 720, font: `600 40px/1.3 ${F.body}`, color: C.onAccent, background: C.naranja, padding: '26px 34px', borderRadius: '32px 32px 8px 32px', opacity: a, transform: `translateY(${(1 - a) * 40}px)`}}>
          Haceme una función que valide un correo
        </div>
        <div style={{alignSelf: 'flex-start', width: 800, background: C.alt, border: `3px solid ${C.line}`, padding: '28px 34px', borderRadius: '32px 32px 32px 8px', font: `500 34px/1.55 ${F.mono}`, color: C.ink, opacity: b, transform: `translateY(${(1 - b) * 40}px)`, position: 'relative'}}>
          <div style={{whiteSpace: 'pre'}}><Typed start={46} cps={40} text={'import re\ndef es_correo(t):\n  return re.match(r".+@.+\\..+", t)'} /></div>
          <div style={{position: 'absolute', right: -24, bottom: -40, font: `700 38px/1 ${F.body}`, color: C.onAccent, background: C.ok, padding: '16px 26px', borderRadius: 999, transform: `scale(${c}) rotate(-4deg)`}}>✓ entendé cada línea</div>
        </div>
      </div>
      <div style={{marginTop: 30}}><Claves e={e} delay={70} /></div>
    </Zona>
  );
};

const Proyectos: React.FC<{e: Escena}> = ({e}) => {
  const f = useCurrentFrame();
  return (
    <Zona>
      <div style={{font: `600 52px/1 ${F.display}`, color: C.accentInk, opacity: useIn(0)}}>Y lo que más me hubiera ayudado</div>
      {e.claves!.map((c, i) => {
        const st = 14 + i * 22;
        const k = useIn(st);
        const check = interpolate(f, [st + 18, st + 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return (
          <div key={c} style={{display: 'flex', alignItems: 'center', gap: 40, background: C.alt, border: `3px solid ${check > 0.5 ? C.naranja : C.line}`, borderRadius: 32, padding: '48px 44px', opacity: k, transform: `translateX(${(1 - k) * -100}px)`}}>
            <svg width={110} height={110} viewBox="0 0 110 110" style={{flex: 'none'}}>
              <rect x={6} y={6} width={98} height={98} rx={26} fill={check > 0.5 ? C.naranja : 'none'} stroke={C.naranja} strokeWidth={8} />
              <path d="M30 57 l17 17 l34 -36" fill="none" stroke={C.onAccent} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={90} strokeDashoffset={90 * (1 - check)} />
            </svg>
            <span style={{font: `700 80px/1 ${F.display}`, color: C.ink}}>{c}</span>
          </div>
        );
      })}
      <div style={{position: 'relative', height: 120}}><Star x={760} y={10} s={90} delay={60} /><Star x={880} y={70} s={50} delay={66} /></div>
    </Zona>
  );
};

const Cta: React.FC<{e: Escena}> = () => {
  const a = useIn(0), b = useIn(10), c = useIn(22), d = useIn(34);
  return (
    <AbsoluteFill style={{background: C.azul}}>
      <div style={{position: 'absolute', top: 220, left: 72, right: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 60, textAlign: 'center'}}>
        <Img src={staticFile('logo-horizontal-blanco.png')} style={{width: 760, opacity: a, transform: `scale(${0.9 + 0.1 * a})`}} />
        <div style={{font: `700 92px/1 ${F.display}`, color: '#fff', opacity: b, transform: `translateY(${(1 - b) * 40}px)`}}>Cursos de cloud, software e <span style={{color: C.naranja}}>IA</span></div>
        <div style={{background: C.naranja, color: C.onAccent, borderRadius: 32, padding: '40px 56px', opacity: c, transform: `scale(${c})`}}>
          <div style={{font: `700 40px/1 ${F.body}`}}>Escribinos por WhatsApp</div>
          <div style={{font: `700 84px/1.1 ${F.display}`, marginTop: 14}}>{WHATSAPP}</div>
        </div>
        <div style={{font: `500 40px/1.4 ${F.mono}`, color: '#fff', opacity: d}}>@cloudstation.sh · @gelopfalcon<br />cloudstation.sh</div>
      </div>
      <Star x={110} y={1180} s={80} delay={30} />
      <Star x={900} y={1100} s={60} delay={38} />
    </AbsoluteFill>
  );
};

// Escena genérica para temas nuevos: título + claves + una estrella grande
const Puntos: React.FC<{e: Escena}> = ({e}) => (
  <Zona>
    <Titulo e={e} />
    <div style={{position: 'relative', height: 300}}><Star x={330} y={20} s={240} delay={10} /><Star x={620} y={180} s={90} delay={18} /></div>
    <Claves e={e} delay={24} />
  </Zona>
);

const MAPA: Record<string, React.FC<{e: Escena}>> = {puntos: Puntos, hook: Hook, codigo: Codigo, terminal: Terminal, web: Web, nube: Nube, ia: IA, proyectos: Proyectos, cta: Cta};

export const Reel: React.FC<ReelProps> = (props) => {
  const d = duraciones(props);
  return (
    <AbsoluteFill style={{fontFamily: F.body}}>
      <Fondo />
      <TransitionSeries>
        {guion.flatMap((e, i) => {
          const Comp = MAPA[e.tipo] ?? Puntos;
          const out = [<TransitionSeries.Sequence key={e.id} durationInFrames={d[i]}><Comp e={e} /></TransitionSeries.Sequence>];
          if (i < guion.length - 1)
            out.push(<TransitionSeries.Transition key={e.id + 't'} presentation={i === guion.length - 2 ? fade() : slide({direction: 'from-right'})} timing={linearTiming({durationInFrames: TRANS})} />);
          return out;
        })}
      </TransitionSeries>
      <Header props={props} />
      <Subtitulos props={props} />
      {props.voz && <Audio src={staticFile(props.voz)} />}
      {props.musica && <Audio src={staticFile(props.musica)} volume={(f) => (props.voz ? 0.12 : 0.35) * Math.min(1, f / 30)} />}
    </AbsoluteFill>
  );
};
