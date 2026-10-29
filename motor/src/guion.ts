// El guion de cada reel vive en src/guion.json (lo escribe la tarea de guiones).
// Cada escena recibe sus tiempos reales desde la transcripción de la nota de voz.
import data from './guion.json';

export type Escena = {
  id: string;
  tipo: 'hook' | 'codigo' | 'terminal' | 'web' | 'nube' | 'ia' | 'proyectos' | 'cta' | string;
  numero?: number;
  titulo: string;
  claves?: string[];
  voz: string;
  seg: number;
};

export const SERIE: string = data.serie;
export const PILAR: string = data.pilar;
export const guion: Escena[] = data.escenas as Escena[];
export const WHATSAPP = '+506 8339 3375';
