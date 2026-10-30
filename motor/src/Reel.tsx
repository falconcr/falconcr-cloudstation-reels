import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, Audio, random} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import {fade} from '@remotion/transitions/fade';
import {wipe} from '@remotion/transitions/wipe';
import {C, F, FPS, TRANS, T, setEstilo, Estilo} from './brand';
import {guion as guionBase, Escena, SERIE, PILAR, WHATSAPP, ESTILO} from './guion';

type Palabra = {w: string; s: number; e: number};
export type ReelProps = {voz?: string; estilo?: Estilo; escenas?: Escena[]; tiempos?: {inicio: number; fin: number; palabras?: Palabra[]}[]};

const escenasDe = (p: ReelProps) => p.escenas ?? guionBase;

// ---------- tiempos ----------
export const duraciones = (props: ReelProps) => {
  const g = escenasDe(props);
  return g.map((e, i) => {
    const t = props.tiempos?.[i];
    const seg = t ? t.fin - t.inicio : e.seg;
    return Math.round(seg * FPS) + (i < g.length - 1 ? TRANS : 0);
  });
};
export const totalFrames = (props: ReelProps) => {
  const d = duraciones(props);
  return d.reduce((a, b) => a + b, 0) - TRANS * (d.length - 1);
};
const inicios = (props: ReelProps) => {
  const s: number[] = [];
  let acc = 0;
  duraciones(props).forEach((x) => { s.push(acc); acc += x - TRANS; });
  return s;
};

// ---------- utilidades ----------
const useIn = (delay = 0, damping = 14) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: {damping, mass: 0.7}});
};
// "*palabra*" se pinta en naranja
const Rich: React.FC<{t: string; color?: string}> = ({t, color = T.hi}) => (
  <>{t.split(/(\*[^*]+\*)/).map((p, i) => (p.startsWith('*') ? <span key={i} style={{color}}>{p.slice(1, -1)}</span> : <React.Fragment key={i}>{p}</React.Fragment>))}</>
);
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
const borde = (c = T.line, w = 3) => `${w}px ${T.dashed ? 'dashed' : 'solid'} ${c}`;
const Chip: React.FC<{children: React.ReactNode; delay: number; solid?: boolean}> = ({children, delay, solid}) => {
  const k = useIn(delay);
  return (
    <span style={{display: 'inline-block', transform: `translateY(${(1 - k) * 40}px)`, opacity: k, font: `700 44px/1 ${F.body}`, padding: '18px 34px', borderRadius: 999,
      background: solid ? C.naranja : T.card, color: solid ? C.onAccent : T.brand, border: solid ? `3px solid ${C.naranja}` : borde(), boxShadow: T.shadow}}>{children}</span>
  );
};
const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties; delay?: number; color?: string}> = ({children, style, delay = 6, color}) => {
  const k = useIn(delay);
  return <div style={{background: T.card, border: borde(color ?? T.line), borderRadius: T.radius, padding: 44, boxShadow: T.shadow, transform: `translateY(${(1 - k) * 80}px)`, opacity: k, ...style}}>{children}</div>;
};
const Typed: React.FC<{text: string; start: number; cps?: number}> = ({text, start, cps = 26}) => {
  const f = useCurrentFrame();
  const n = Math.max(0, Math.floor(((f - start) / FPS) * cps));
  const cursor = n < text.length || Math.floor(f / 15) % 2 === 0;
  return <>{text.slice(0, n)}<span style={{color: C.naranja, opacity: cursor ? 1 : 0}}>▍</span></>;
};

// ---------- fondos por estilo ----------
const Fondo: React.FC = () => {
  const f = useCurrentFrame();
  if (T.estilo === 'terminal')
    return (
      <AbsoluteFill style={{background: '#050a1c'}}>
        <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0 2px, transparent 2px 6px)'}} />
        <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, rgba(30,58,138,0.35) 0, rgba(5,10,28,0) 65%)'}} />
        <div style={{position: 'absolute', left: 72, bottom: 120, font: `500 28px/1 ${F.mono}`, color: '#3b4a85'}}>~/cloudstation $ <span style={{opacity: Math.floor(f / 15) % 2}}>▍</span></div>
      </AbsoluteFill>
    );
  if (T.estilo === 'blueprint')
    return (
      <AbsoluteFill style={{background: C.azul}}>
        <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.07) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.07) 2px, transparent 2px)', backgroundSize: '45px 45px'}} />
        <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.13) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.13) 2px, transparent 2px)', backgroundSize: '225px 225px'}} />
        <div style={{position: 'absolute', right: 72, bottom: 110, border: '3px solid rgba(255,255,255,0.5)', padding: '14px 22px', font: `500 24px/1.4 ${F.mono}`, color: 'rgba(255,255,255,0.7)'}}>CLOUD STATION<br />LÁM. {String(1 + (Math.floor(f / 300) % 9)).padStart(2, '0')} · ESC 1:1</div>
      </AbsoluteFill>
    );
  if (T.estilo === 'tarjetas')
    return (
      <AbsoluteFill style={{background: '#f3f5fb'}}>
        <div style={{position: 'absolute', width: 760, height: 760, right: -260, top: -180, borderRadius: 380, background: '#e3e8f7'}} />
        <div style={{position: 'absolute', width: 520, height: 150, left: -120, bottom: 300, borderRadius: 75, background: '#ffe6c7'}} />
      </AbsoluteFill>
    );
  // espacio
  const stars = Array.from({length: 70}, (_, i) => {
    const x = random(`x${i}`) * 1080, y = random(`y${i}`) * 1920, s = 2 + random(`s${i}`) * 4;
    const o = 0.35 + 0.65 * Math.abs(Math.sin((f + i * 17) / (25 + i % 7 * 6)));
    return <div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: s, background: '#ffffff', opacity: o * 0.7}} />;
  });
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 85% 85%, rgba(30,58,138,0.6) 0, rgba(30,58,138,0) 55%), ${C.noche}`}}>
      {stars}
    </AbsoluteFill>
  );
};

// ---------- capas fijas ----------
const Header: React.FC<{props: ReelProps}> = ({props}) => {
  const f = useCurrentFrame();
  const g = escenasDe(props);
  const s = inicios(props);
  const idx = Math.max(0, s.filter((x) => f >= x - TRANS / 2).length - 1);
  const actual = g[idx];
  const numerados = g.filter((e) => e.numero).length;
  const seg = numerados || g.length - 1;
  const avance = numerados ? (actual.numero ?? (idx === 0 ? 0 : idx >= g.length - 2 ? seg : 0)) : idx;
  return (
    <div style={{position: 'absolute', top: 150, left: 72, right: 72, opacity: actual.tipo === 'cta' ? 0 : 1}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Img src={staticFile(T.logo)} style={{width: 104}} />
        <span style={{font: `700 30px/1 ${F.body}`, letterSpacing: '0.08em', color: T.brand, padding: '14px 26px', borderRadius: 999, background: T.card, border: borde(T.line, 2), boxShadow: T.shadow}}>
          {SERIE} · <span style={{color: T.accentInk}}>{PILAR}</span>
        </span>
      </div>
      <div style={{display: 'flex', gap: 14, marginTop: 34}}>
        {Array.from({length: seg}, (_, i) => <div key={i} style={{flex: 1, height: 10, borderRadius: 5, background: avance > i ? C.naranja : T.line}} />)}
      </div>
    </div>
  );
};

const Subtitulos: React.FC<{props: ReelProps}> = ({props}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const g = escenasDe(props);
  const s = inicios(props);
  const d = duraciones(props);
  let palabras: Palabra[] = [];
  g.forEach((e, i) => {
    const real = props.tiempos?.[i]?.palabras;
    if (real) { palabras = palabras.concat(real); return; }
    const ws = e.voz.split(' ');
    const a = s[i] / FPS + 0.2, b = (s[i] + d[i] - TRANS) / FPS - 0.3;
    const peso = ws.map((w) => w.length + 2), tot = peso.reduce((x, y) => x + y, 0);
    let acc = a;
    ws.forEach((w, j) => { const dur = ((b - a) * peso[j]) / tot; palabras.push({w, s: acc, e: acc + dur}); acc += dur; });
  });
  const grupos: Palabra[][] = [];
  let gr: Palabra[] = [];
  palabras.forEach((p) => { gr.push(p); if (gr.length >= 4 || /[.:,?!]$/.test(p.w)) { grupos.push(gr); gr = []; } });
  if (gr.length) grupos.push(gr);
  const actual = grupos.find((x) => t >= x[0].s - 0.05 && t <= x[x.length - 1].e + 0.15);
  if (!actual) return null;
  const k = Math.min(1, (t - actual[0].s + 0.05) * 8);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1395, display: 'flex', justifyContent: 'center'}}>
      <div style={{font: `700 64px/1.15 ${F.body}`, textAlign: 'center', color: T.captionInk, background: T.captionBg, padding: '18px 34px', borderRadius: 24, transform: `scale(${0.92 + 0.08 * k})`}}>
        {actual.map((p, i) => (
          <span key={i} style={{color: t >= p.s ? (t <= p.e ? C.naranja : T.captionInk) : 'rgba(200,210,240,0.75)'}}>{p.w}{i < actual.length - 1 ? ' ' : ''}</span>
        ))}
      </div>
    </div>
  );
};

// ---------- piezas comunes ----------
const Titulo: React.FC<{e: Escena; size?: number}> = ({e, size = 84}) => {
  const k = useIn(0), k2 = useIn(5);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 36}}>
      {e.numero && (
        <div style={{width: 150, height: 150, flex: 'none', borderRadius: T.estilo === 'terminal' ? 20 : 75, background: C.naranja, color: C.onAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 96px/1 ${T.titleFont}`, transform: `scale(${k})`}}>{e.numero}</div>
      )}
      <div style={{font: `700 ${Math.round(size * T.escala)}px/1 ${T.titleFont}`, color: T.ink, opacity: k2, transform: `translateX(${(1 - k2) * 60}px)`, textWrap: 'balance' as any}}><Rich t={e.titulo} /></div>
    </div>
  );
};
const Texto: React.FC<{t?: string; delay?: number}> = ({t, delay = 14}) => {
  const k = useIn(delay);
  if (!t) return null;
  return <div style={{font: `400 46px/1.35 ${F.body}`, color: T.muted, opacity: k, transform: `translateY(${(1 - k) * 30}px)`}}><Rich t={t} color={T.accentInk} /></div>;
};
const Claves: React.FC<{e: Escena; delay: number}> = ({e, delay}) =>
  e.claves?.length ? <div style={{display: 'flex', flexWrap: 'wrap', gap: 18}}>{e.claves.map((c, i) => <Chip key={c} delay={delay + i * 7}>{c}</Chip>)}</div> : null;
const Zona: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{transform: `scale(${1 + Math.min(useCurrentFrame(), 360) * 0.00008})`}}>
    <div style={{position: 'absolute', top: 340, left: 72, right: 72, height: 1020, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 64}}>{children}</div>
  </AbsoluteFill>
);
const Sello: React.FC<{txt: string; color: string; delay: number; rot?: number}> = ({txt, color, delay, rot = -8}) => {
  const k = useIn(delay, 8);
  return <div style={{display: 'inline-block', font: `700 72px/1 ${T.titleFont}`, letterSpacing: '0.06em', color, border: `8px solid ${color}`, borderRadius: 18, padding: '18px 34px', transform: `scale(${2.2 - 1.2 * k}) rotate(${rot}deg)`, opacity: Math.min(1, k * 2)}}>{txt}</div>;
};
const Icono: React.FC<{ok: boolean; size?: number}> = ({ok, size = 120}) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={{flex: 'none'}}>
    <circle cx={60} cy={60} r={54} fill={ok ? T.ok : T.error} />
    {ok ? <path d="M34 62 l18 18 l36 -40" fill="none" stroke={C.onAccent} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
      : <path d="M40 40 L80 80 M80 40 L40 80" stroke="#ffffff" strokeWidth={13} strokeLinecap="round" />}
  </svg>
);

// ---------- escenas: gancho ----------
const Hook: React.FC<{e: Escena}> = ({e}) => {
  const f = useCurrentFrame();
  const a = useIn(0), b = useIn(8, 9), c = useIn(22);
  if (e.grande)
    return (
      <Zona>
        <div style={{marginTop: 40, font: `600 76px/1 ${T.titleFont}`, color: T.brand, opacity: a}}>{e.texto}</div>
        <div style={{position: 'relative', height: 560}}>
          <div style={{position: 'absolute', left: -20, top: -40, font: `700 620px/1 ${F.display}`, color: C.naranja, letterSpacing: '-0.04em', transform: `scale(${b})`, transformOrigin: 'left center'}}>{e.grande}</div>
          <Star x={760} y={40} s={110} delay={14} /><Star x={900} y={200} s={64} delay={20} /><Star x={650} y={-20} s={50} delay={26} />
        </div>
        <div style={{font: `700 ${Math.round(80 * T.escala)}px/1.02 ${T.titleFont}`, color: T.ink, opacity: c, transform: `translateY(${(1 - c) * 50}px)`}}><Rich t={e.titulo} /></div>
      </Zona>
    );
  return (
    <Zona>
      <div style={{font: `700 ${Math.round(128 * T.escala)}px/0.98 ${T.titleFont}`, color: T.ink, opacity: a, transform: `translateY(${(1 - a) * 60}px)`, textWrap: 'balance' as any}}><Rich t={e.titulo} /></div>
      <div style={{height: 10, width: interpolate(f, [18, 50], [0, 460], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)}), background: C.naranja, borderRadius: 5}} />
      <Texto t={e.texto} delay={20} />
      <div style={{position: 'relative', height: 140}}><Star x={780} y={0} s={120} delay={26} /><Star x={700} y={90} s={50} delay={32} /></div>
    </Zona>
  );
};

// ---------- formato lista ----------
const Puntos: React.FC<{e: Escena}> = ({e}) => (
  <Zona>
    <Titulo e={e} />
    <Texto t={e.texto} />
    <Claves e={e} delay={24} />
  </Zona>
);
const Codigo: React.FC<{e: Escena}> = ({e}) => (
  <Zona>
    <Titulo e={e} />
    <Card style={{font: `500 40px/1.6 ${F.mono}`, color: T.codeInk, background: T.codeBg, minHeight: 360}}>
      <div style={{color: '#8b97c2', marginBottom: 12}}># resolver un problema real</div>
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
      <Card style={{padding: 0, overflow: 'hidden', background: T.codeBg}}>
        <div style={{display: 'flex', gap: 14, padding: '24px 32px', borderBottom: '3px solid #22316a'}}>
          {[C.naranja, '#c7d2fe', '#26356e'].map((c, i) => <div key={i} style={{width: 24, height: 24, borderRadius: 12, background: c}} />)}
          <span style={{marginLeft: 18, font: `500 30px/24px ${F.mono}`, color: '#8b97c2'}}>gerardo@cloudstation: ~</span>
        </div>
        <div style={{padding: 40, font: `500 42px/1.7 ${F.mono}`, color: T.codeInk}}>
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
const Node: React.FC<{x: number; label: string; delay: number; i: number}> = ({x, label, delay, i}) => {
  const k = useIn(delay);
  const g = {stroke: T.ink, strokeWidth: 8, fill: 'none', strokeLinecap: 'round' as const};
  return (
    <div style={{position: 'absolute', left: x, top: 40, width: 270, textAlign: 'center', transform: `scale(${k})`}}>
      <div style={{width: 220, height: 220, margin: '0 auto', borderRadius: T.radius + 12, background: T.card, border: borde(i === 1 ? C.naranja : T.line, 4), boxShadow: T.shadow, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width={120} height={120} viewBox="0 0 120 120">
          {i === 0 && <><rect x={10} y={20} width={100} height={80} rx={14} {...g} /><line x1={10} y1={44} x2={110} y2={44} {...g} /><circle cx={28} cy={32} r={3} fill={C.naranja} /></>}
          {i === 1 && <text x={60} y={80} textAnchor="middle" style={{font: `700 64px ${F.mono}`}} fill={C.naranja}>{'{ }'}</text>}
          {i === 2 && <><ellipse cx={60} cy={28} rx={40} ry={14} {...g} /><path d="M20 28v64c0 8 18 14 40 14s40-6 40-14V28" {...g} /><path d="M20 60c0 8 18 14 40 14s40-6 40-14" {...g} /></>}
        </svg>
      </div>
      <div style={{marginTop: 22, font: `600 36px/1.1 ${F.body}`, color: T.muted}}>{label}</div>
    </div>
  );
};
const Web: React.FC<{e: Escena}> = ({e}) => {
  const f = useCurrentFrame();
  const p = interpolate(f % 70, [0, 35, 70], [0, 1, 0]);
  return (
    <Zona>
      <Titulo e={e} />
      <div style={{position: 'relative', height: 420}}>
        <svg width={936} height={420} style={{position: 'absolute'}}>
          <line x1={135} y1={150} x2={795} y2={150} stroke={T.line} strokeWidth={8} strokeLinecap="round" strokeDasharray="4 22" />
          <circle cx={135 + p * 660} cy={150} r={20} fill={C.naranja} opacity={f > 30 ? 1 : 0} />
        </svg>
        {['Navegador', 'API', 'Base de datos'].map((t, i) => <Node key={i} x={i * 330} label={t} delay={8 + i * 8} i={i} />)}
        <span style={{position: 'absolute', left: 300, top: 96, transform: 'translateX(-50%)', font: `700 32px/1 ${F.mono}`, color: T.accentInk}}>HTTP</span>
        <span style={{position: 'absolute', left: 630, top: 96, transform: 'translateX(-50%)', font: `700 32px/1 ${F.mono}`, color: T.accentInk}}>SQL</span>
      </div>
      <Claves e={e} delay={44} />
    </Zona>
  );
};
const Nube: React.FC<{e: Escena}> = ({e}) => {
  const f = useCurrentFrame();
  const ok = useIn(70), nube = useIn(4);
  return (
    <Zona>
      <Titulo e={e} />
      <div style={{position: 'relative', height: 440}}>
        <svg width={936} height={440} style={{position: 'absolute'}}>
          <path d="M300 300 a90 90 0 0 1 60 -170 a120 120 0 0 1 220 -10 a90 90 0 0 1 80 180 z" stroke={T.brand} strokeWidth={12} fill="none" strokeLinecap="round" opacity={nube} />
          {[0, 1, 2].map((i) => {
            const y = interpolate(f, [16 + i * 12, 46 + i * 12], [460, 190], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.4))});
            return (
              <g key={i} transform={`translate(${370 + i * 105},${y})`}>
                <rect width={90} height={70} rx={12} fill={i === 1 ? C.naranja : C.azul} stroke={i === 1 ? C.naranja : '#c7d2fe'} strokeWidth={4} />
                {[22, 45, 68].map((lx) => <line key={lx} x1={lx} y1={14} x2={lx} y2={56} stroke={i === 1 ? C.onAccent : '#c7d2fe'} strokeWidth={4} strokeLinecap="round" />)}
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
        <div style={{alignSelf: 'flex-end', maxWidth: 720, font: `600 40px/1.3 ${F.body}`, color: C.onAccent, background: C.naranja, padding: '26px 34px', borderRadius: '32px 32px 8px 32px', opacity: a, transform: `translateY(${(1 - a) * 40}px)`}}>Haceme una función que valide un correo</div>
        <div style={{alignSelf: 'flex-start', width: 800, background: T.codeBg, border: borde(), padding: '28px 34px', borderRadius: '32px 32px 32px 8px', font: `500 34px/1.55 ${F.mono}`, color: T.codeInk, opacity: b, transform: `translateY(${(1 - b) * 40}px)`, position: 'relative'}}>
          <div style={{whiteSpace: 'pre'}}><Typed start={46} cps={40} text={'import re\ndef es_correo(t):\n  return re.match(r".+@.+\\..+", t)'} /></div>
          <div style={{position: 'absolute', right: -24, bottom: -40, font: `700 38px/1 ${F.body}`, color: C.onAccent, background: C.ok, padding: '16px 26px', borderRadius: 999, transform: `scale(${c}) rotate(-4deg)`}}>✓ entendé cada línea</div>
        </div>
      </div>
      <div style={{marginTop: 30}}><Claves e={e} delay={70} /></div>
    </Zona>
  );
};

// ---------- formato checklist (y "lo que más me ayudó") ----------
const Checklist: React.FC<{e: Escena}> = ({e}) => {
  const f = useCurrentFrame();
  const items = e.items ?? e.claves ?? [];
  const tam = items.length > 3 ? 56 : 76;
  return (
    <Zona>
      <div style={{font: `700 ${Math.round(64 * T.escala)}px/1.05 ${T.titleFont}`, color: T.ink}}><Rich t={e.titulo} /></div>
      <div style={{display: 'flex', flexDirection: 'column', gap: items.length > 3 ? 24 : 40}}>
        {items.map((c, i) => {
          const st = 14 + i * 22;
          const check = interpolate(f, [st + 18, st + 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const k = interpolate(f, [st, st + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
          return (
            <div key={c} style={{display: 'flex', alignItems: 'center', gap: 36, background: T.card, border: borde(check > 0.5 ? C.naranja : T.line), borderRadius: T.radius, boxShadow: T.shadow, padding: items.length > 3 ? '30px 36px' : '48px 44px', opacity: k, transform: `translateX(${(1 - k) * -100}px)`}}>
              <svg width={96} height={96} viewBox="0 0 110 110" style={{flex: 'none'}}>
                <rect x={6} y={6} width={98} height={98} rx={26} fill={check > 0.5 ? C.naranja : 'none'} stroke={C.naranja} strokeWidth={8} />
                <path d="M30 57 l17 17 l34 -36" fill="none" stroke={C.onAccent} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={90} strokeDashoffset={90 * (1 - check)} />
              </svg>
              <span style={{font: `700 ${tam}px/1.05 ${T.titleFont}`, color: T.ink}}>{c}</span>
            </div>
          );
        })}
      </div>
    </Zona>
  );
};

// ---------- formato mito vs. realidad ----------
const Mito: React.FC<{e: Escena}> = ({e}) => (
  <Zona>
    <div style={{font: `700 40px/1 ${F.body}`, letterSpacing: '0.1em', color: T.muted}}>LO QUE TODOS DICEN</div>
    <Card delay={4} style={{padding: '60px 52px'}}>
      <div style={{font: `700 ${Math.round(76 * T.escala)}px/1.05 ${T.titleFont}`, color: T.ink}}>“<Rich t={e.titulo} />”</div>
    </Card>
    <div style={{display: 'flex', justifyContent: 'flex-end', paddingRight: 40}}><Sello txt={e.veredicto ?? 'FALSO'} color={/VERDAD|CIERTO/i.test(e.veredicto ?? '') ? T.ok : T.error} delay={34} /></div>
  </Zona>
);
const Realidad: React.FC<{e: Escena}> = ({e}) => (
  <Zona>
    <div style={{display: 'flex', alignItems: 'center', gap: 30}}><Icono ok /><div style={{font: `700 48px/1 ${F.body}`, letterSpacing: '0.1em', color: T.ok}}>{e.tipo === 'solucion' ? 'LA SOLUCIÓN' : 'LA REALIDAD'}</div></div>
    <div style={{font: `700 ${Math.round(84 * T.escala)}px/1.02 ${T.titleFont}`, color: T.ink}}><Rich t={e.titulo} /></div>
    <Texto t={e.texto} />
    <Claves e={e} delay={30} />
  </Zona>
);
// ---------- formato error → solución ----------
const ErrorEsc: React.FC<{e: Escena}> = ({e}) => {
  const f = useCurrentFrame();
  const shake = f > 10 && f < 26 ? Math.sin(f * 2.4) * 10 : 0;
  return (
    <Zona>
      <div style={{display: 'flex', alignItems: 'center', gap: 30, transform: `translateX(${shake}px)`}}><Icono ok={false} /><div style={{font: `700 48px/1 ${F.body}`, letterSpacing: '0.1em', color: T.error}}>EL ERROR</div></div>
      <Card color={T.error} delay={6} style={{padding: '56px 52px'}}>
        <div style={{font: `700 ${Math.round(80 * T.escala)}px/1.02 ${T.titleFont}`, color: T.ink}}><Rich t={e.titulo} /></div>
      </Card>
      <Texto t={e.texto} delay={20} />
    </Zona>
  );
};

// ---------- formato historia (línea de tiempo) ----------
const Linea: React.FC<{e: Escena}> = ({e}) => {
  const f = useCurrentFrame();
  const k = useIn(4);
  const h = interpolate(f, [0, 40], [0, 760], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <Zona>
      <div style={{display: 'flex', gap: 56}}>
        <div style={{position: 'relative', width: 40, flex: 'none'}}>
          <div style={{position: 'absolute', left: 16, top: 30, width: 8, height: h, background: T.line, borderRadius: 4}} />
          <div style={{position: 'absolute', left: 0, top: 10, width: 40, height: 40, borderRadius: 20, background: C.naranja, transform: `scale(${k})`, boxShadow: `0 0 0 ${8 + 6 * Math.sin(f / 6)}px rgba(255,140,0,0.25)`}} />
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 40}}>
          <div style={{font: `700 120px/1 ${F.mono}`, color: T.hi, opacity: k}}>{e.hora}</div>
          <div style={{font: `700 ${Math.round(80 * T.escala)}px/1.04 ${T.titleFont}`, color: T.ink}}><Rich t={e.titulo} /></div>
          <Texto t={e.texto} delay={18} />
        </div>
      </div>
    </Zona>
  );
};

// ---------- formato A vs. B ----------
const Versus: React.FC<{e: Escena}> = ({e}) => {
  const vs = useIn(16, 8);
  const col = (lado: {nombre: string; puntos: string[]} | undefined, i: number) => {
    const k = useIn(4 + i * 6);
    return (
      <div style={{flex: 1, minWidth: 0, background: i === 0 ? T.card : (T.estilo === 'blueprint' ? C.noche : C.azul), border: borde(i === 0 ? T.line : (T.estilo === 'blueprint' ? C.noche : C.azul)), borderRadius: T.radius, boxShadow: T.shadow, padding: '44px 34px', transform: `translateY(${(1 - k) * 100}px)`, opacity: k}}>
        <div style={{font: `700 ${Math.round(54 * T.escala)}px/1 ${T.titleFont}`, color: i === 0 ? T.ink : '#ffffff', marginBottom: 34}}>{lado?.nombre}</div>
        {lado?.puntos.map((p, j) => {
          const kk = useIn(26 + j * 10 + i * 4);
          return <div key={j} style={{font: `600 38px/1.25 ${F.body}`, color: i === 0 ? T.muted : '#c7d2fe', padding: '18px 0', borderTop: `2px solid ${i === 0 ? T.line : 'rgba(255,255,255,0.25)'}`, opacity: kk}}>{p}</div>;
        })}
      </div>
    );
  };
  return (
    <Zona>
      <div style={{font: `700 ${Math.round(64 * T.escala)}px/1.05 ${T.titleFont}`, color: T.ink}}><Rich t={e.titulo} /></div>
      <div style={{position: 'relative', display: 'flex', gap: 28}}>
        {col(e.a, 0)}{col(e.b, 1)}
        <div style={{position: 'absolute', left: '50%', top: '50%', width: 120, height: 120, marginLeft: -60, marginTop: -60, borderRadius: 65, background: C.naranja, color: C.onAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 50px/1 ${F.display}`, boxShadow: '0 0 0 10px rgba(0,0,0,0.12)', transform: `scale(${vs})`}}>VS</div>
      </div>
    </Zona>
  );
};

// ---------- formato cifra que impacta ----------
const Cifra: React.FC<{e: Escena}> = ({e}) => {
  const f = useCurrentFrame();
  const v = e.valor ?? '';
  const m = v.match(/^([\d.,]+)(.*)$/);
  let mostrado = v;
  if (m) {
    const n = parseFloat(m[1].replace(',', '.'));
    const dec = (m[1].split(/[.,]/)[1] ?? '').length;
    const p = interpolate(f, [6, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
    mostrado = (n * p).toFixed(dec).replace('.', m[1].includes(',') ? ',' : '.') + m[2];
  }
  const k = useIn(2, 10);
  const largo = v.length > 6;
  return (
    <Zona>
      <div style={{font: `700 52px/1.1 ${F.body}`, color: T.muted}}><Rich t={e.texto ?? ''} color={T.accentInk} /></div>
      <div style={{font: `700 ${largo ? 210 : 330}px/0.95 ${F.display}`, color: T.hi, letterSpacing: '-0.03em', transform: `scale(${0.8 + 0.2 * k})`, transformOrigin: 'left center', fontVariantNumeric: 'tabular-nums'}}>{mostrado}</div>
      <div style={{font: `700 ${Math.round(76 * T.escala)}px/1.04 ${T.titleFont}`, color: T.ink}}><Rich t={e.titulo} /></div>
      <div style={{position: 'relative', height: 80}}><Star x={820} y={0} s={80} delay={44} /></div>
    </Zona>
  );
};

// ---------- cierre ----------
const Cta: React.FC<{e: Escena}> = ({e}) => {
  const a = useIn(0), b = useIn(10), c = useIn(22), d = useIn(34);
  return (
    <AbsoluteFill style={{background: C.azul}}>
      <div style={{position: 'absolute', top: 220, left: 72, right: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 60, textAlign: 'center'}}>
        <Img src={staticFile('logo-horizontal-blanco.png')} style={{width: 760, opacity: a, transform: `scale(${0.9 + 0.1 * a})`}} />
        <div style={{font: `700 92px/1 ${F.display}`, color: '#fff', opacity: b, transform: `translateY(${(1 - b) * 40}px)`}}><Rich t={e.titulo || 'Cursos de cloud, software e *IA*'} color={C.naranja} /></div>
        <div style={{background: C.naranja, color: C.onAccent, borderRadius: 32, padding: '40px 56px', opacity: c, transform: `scale(${c})`}}>
          <div style={{font: `700 40px/1 ${F.body}`}}>Escribinos por WhatsApp</div>
          <div style={{font: `700 84px/1.1 ${F.display}`, marginTop: 14}}>{WHATSAPP}</div>
        </div>
        <div style={{font: `500 40px/1.4 ${F.mono}`, color: '#fff', opacity: d}}>@cloudstation.sh · @gelopfalcon<br />cloudstation.sh</div>
      </div>
      <Star x={110} y={1180} s={80} delay={30} /><Star x={900} y={1100} s={60} delay={38} />
    </AbsoluteFill>
  );
};

const MAPA: Record<string, React.FC<{e: Escena}>> = {
  hook: Hook, puntos: Puntos, codigo: Codigo, terminal: Terminal, web: Web, nube: Nube, ia: IA,
  proyectos: Checklist, checklist: Checklist, mito: Mito, realidad: Realidad, solucion: Realidad, error: ErrorEsc,
  linea: Linea, versus: Versus, cifra: Cifra, cta: Cta,
};
const TRANSICION = {espacio: () => slide({direction: 'from-right'}), terminal: () => wipe({direction: 'from-left'}), blueprint: () => slide({direction: 'from-bottom'}), tarjetas: () => slide({direction: 'from-right'})};

export const Reel: React.FC<ReelProps> = (props) => {
  setEstilo(props.estilo ?? ESTILO);
  const g = escenasDe(props);
  const d = duraciones(props);
  return (
    <AbsoluteFill style={{fontFamily: F.body}}>
      <Fondo />
      <TransitionSeries>
        {g.flatMap((e, i) => {
          const Comp = MAPA[e.tipo] ?? Puntos;
          const out = [<TransitionSeries.Sequence key={e.id} durationInFrames={d[i]}><Comp e={e} /></TransitionSeries.Sequence>];
          if (i < g.length - 1)
            out.push(<TransitionSeries.Transition key={e.id + 't'} presentation={(i === g.length - 2 ? fade() : TRANSICION[T.estilo]()) as any} timing={linearTiming({durationInFrames: TRANS})} />);
          return out;
        })}
      </TransitionSeries>
      <Header props={props} />
      <Subtitulos props={props} />
      {props.voz && <Audio src={staticFile(props.voz)} />}
    </AbsoluteFill>
  );
};
