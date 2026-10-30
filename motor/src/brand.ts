// Tokens del sistema de diseño Cloud Station + los 4 estilos de reel.
import '@fontsource/saira/600.css';
import '@fontsource/saira/700.css';
import '@fontsource/figtree/400.css';
import '@fontsource/figtree/600.css';
import '@fontsource/figtree/700.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';

// Colores fijos de marca (iguales en todos los estilos)
export const C = {
  azul: '#1e3a8a',
  naranja: '#ff8c00',
  noche: '#0b1533',
  onAccent: '#0f1b3d',
  ok: '#4ade80',
};

export const F = {
  display: '"Saira", sans-serif',
  body: '"Figtree", sans-serif',
  mono: '"JetBrains Mono", monospace',
};

export type Estilo = 'espacio' | 'terminal' | 'blueprint' | 'tarjetas';

type Tema = {
  ink: string; muted: string; card: string; line: string; brand: string; accentInk: string;
  ok: string; error: string; shadow: string; captionBg: string; captionInk: string;
  logo: string; titleFont: string; hi: string; escala: number; radius: number; codeBg: string; codeInk: string; dashed: boolean;
};

export const TEMAS: Record<Estilo, Tema> = {
  // azul noche con estrellas: ganchos, carrera, temas generales
  espacio: {ink: '#eef2ff', muted: '#a9b4d6', card: '#132157', line: '#26356e', brand: '#c7d2fe', accentInk: '#ffa53d', ok: '#4ade80', error: '#f87171',
    shadow: 'none', captionBg: 'rgba(11,21,51,0.82)', captionInk: '#eef2ff', logo: 'isotipo-blanco.png', titleFont: F.display, hi: '#ff8c00', escala: 1, radius: 28, codeBg: '#070d24', codeInk: '#eef2ff', dashed: false},
  // pantalla de terminal: DevOps, código, tutoriales
  terminal: {ink: '#e6edff', muted: '#8b97c2', card: '#0b1433', line: '#22316a', brand: '#c7d2fe', accentInk: '#ffa53d', ok: '#4ade80', error: '#f87171',
    shadow: 'none', captionBg: 'rgba(5,10,28,0.9)', captionInk: '#e6edff', logo: 'isotipo-blanco.png', titleFont: F.mono, hi: '#ff8c00', escala: 0.86, radius: 12, codeBg: '#050a1c', codeInk: '#e6edff', dashed: false},
  // plano técnico sobre azul de marca: arquitectura, diagramas
  blueprint: {ink: '#ffffff', muted: '#c7d2fe', card: 'rgba(11,21,51,0.38)', line: 'rgba(255,255,255,0.5)', brand: '#ffffff', accentInk: '#ffb366', ok: '#4ade80', error: '#fca5a5',
    shadow: 'none', captionBg: 'rgba(11,21,51,0.88)', captionInk: '#ffffff', logo: 'isotipo-blanco.png', titleFont: F.display, hi: '#ff8c00', escala: 1, radius: 6, codeBg: '#0b1533', codeInk: '#eef2ff', dashed: true},
  // editorial claro: rompe el feed oscuro, comparaciones, cifras
  tarjetas: {ink: '#0f1b3d', muted: '#4a5578', card: '#ffffff', line: '#dce1ef', brand: '#1e3a8a', accentInk: '#b45309', ok: '#15803d', error: '#b91c1c',
    shadow: '0 14px 36px rgba(30,58,138,0.14)', captionBg: 'rgba(15,27,61,0.92)', captionInk: '#ffffff', logo: 'isotipo-color.png', titleFont: F.display, hi: '#c25400', escala: 1, radius: 32, codeBg: '#0f1b3d', codeInk: '#eef2ff', dashed: false},
};

// Tema activo: lo fija <Reel> antes de dibujar (un render = un estilo)
export const T: Tema & {estilo: Estilo} = {...TEMAS.espacio, estilo: 'espacio'};
export const setEstilo = (e: Estilo) => Object.assign(T, TEMAS[e] ?? TEMAS.espacio, {estilo: TEMAS[e] ? e : 'espacio'});

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const TRANS = 12; // frames de transición entre escenas
