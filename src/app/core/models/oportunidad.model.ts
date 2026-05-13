export interface OportunidadResponse {
  idOportunidad: number;
  clienteId: number;
  asesorId: number;
  descripcion: string;
  valorEstimado: number;
  probabilidad: number;
  etapa: EtapaOportunidad;
  estado: EstadoOportunidad;
  esPotencial: boolean;
  fechaCierreEstimada: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface OportunidadRequest {
  clienteId: number;
  asesorId: number;
  descripcion: string;
  valorEstimado: number;
  fechaCierreEstimada: string;
}

export interface LookupItem {
  id: number;
  nombre: string;
}

export type EtapaOportunidad =
  | 'PROSPECCION'
  | 'CALIFICACION'
  | 'PROPUESTA'
  | 'NEGOCIACION'
  | 'CIERRE_GANADO'
  | 'CIERRE_PERDIDO';

export const STAGE_RANGES: Record<EtapaOportunidad, { min: number; max: number; default: number }> =
  {
    PROSPECCION: { min: 5, max: 20, default: 10 },
    CALIFICACION: { min: 21, max: 40, default: 30 },
    PROPUESTA: { min: 41, max: 60, default: 50 },
    NEGOCIACION: { min: 61, max: 85, default: 75 },
    CIERRE_GANADO: { min: 100, max: 100, default: 100 },
    CIERRE_PERDIDO: { min: 0, max: 0, default: 0 },
  };

export type EstadoOportunidad = 'ACTIVA' | 'INACTIVA' | 'GANADA' | 'PERDIDA';
