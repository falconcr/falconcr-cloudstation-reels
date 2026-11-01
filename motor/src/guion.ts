// El guion de cada reel vive en src/guion.json (lo escribe la tarea de guiones).
// Cada escena recibe sus tiempos reales desde la transcripción de la nota de voz.
import data from './guion.json';
import type {Estilo} from './brand';

export type Escena = {
  id: string;
  // lista: hook, puntos, codigo, terminal, web, nube, ia, proyectos · mito/realidad · error/solucion · linea · versus · cifra · checklist · pregunta · cta
  tipo: string;
  numero?: number;
  titulo: string;           // *palabra* = resaltada en naranja
  texto?: string;           // bajada corta
  grande?: string;          // hook: número o palabra gigante
  claves?: string[];
  items?: string[];         // checklist; pregunta: opciones A, B…
  veredicto?: string;       // mito: FALSO / MITO / VERDAD
  hora?: string;            // linea: "VIE 18:04"
  valor?: string;           // cifra: "8 h 45 min"
  a?: {nombre: string; puntos: string[]};  // versus
  b?: {nombre: string; puntos: string[]};
  voz: string;
  seg: number;
};

const d = data as any;
export const SERIE: string = d.serie;
export const PILAR: string = d.pilar;
export const ESTILO: Estilo = d.estilo ?? 'espacio';
export const FORMATO: string = d.formato ?? 'lista';
export const guion: Escena[] = d.escenas as Escena[];
export const WHATSAPP = '+506 8339 3375';
