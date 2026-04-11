export type CalendarPostStatus = 'pendiente' | 'generado' | 'publicado' | 'fallido';

export type CalendarPostType = 'POST' | 'STORY' | 'CARRUSEL' | 'REEL';

export interface CalendarPost {
  id: string;                    // UUID generado en frontend
  dia: string;                   // formato YYYY-MM-DD
  tipo: CalendarPostType;
  producto: string;              // 'MAIN' | 'STUDIO' | 'FOOD' | 'CAT'
  objetivo: string;
  titulo: string;
  subtitulo: string;
  caption: string;
  hashtags: string;              // string separado por comas o espacios
  estado: CalendarPostStatus;
  buffer_id?: string;            // ID de Buffer si fue publicado
  slides?: number;               // cantidad de slides si es CARRUSEL
  notas?: string;
}

export interface CalendarState {
  posts: CalendarPost[];
  lastSync: string | null;       // ISO timestamp
}
