export interface QualificationClient {
  id: number;
  clienteId: number;
  puntaje: number;
  clasificacion: QualificationLevel;
  ultimaActualizacion: string;
}

export interface QualificationHistory {
  id: number;
  clienteId: number;
  puntajeAnterior: number;
  puntajeNuevo: number;
  motivo: string;
  fecha: string;
}

export interface QualificationDistribucion {
  distribucion: Record<QualificationLevel, number>;
}

export type QualificationLevel = 'FRIO' | 'TIBIO' | 'CALIENTE' | 'VIP';

export const QUALIFICATION_CONFIG: Record<
  QualificationLevel,
  {
    label: string;
    color: string;
    bg: string;
    icon: string;
    min: number;
    max: number;
  }
> = {
  FRIO: {
    label: 'Frío',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.12)',
    icon: '❄️',
    min: 0,
    max: 25,
  },

  TIBIO: {
    label: 'Tibio',
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.12)',
    icon: '🌤️',
    min: 26,
    max: 50,
  },

  CALIENTE: {
    label: 'Caliente',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.12)',
    icon: '🔥',
    min: 51,
    max: 75,
  },

  VIP: {
    label: 'VIP',
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.12)',
    icon: '👑',
    min: 76,
    max: 100,
  },
};
