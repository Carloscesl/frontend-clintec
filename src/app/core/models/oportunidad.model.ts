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
  | 'PROSPECCIÓN'
  | 'CALIFICACIÓN'
  | 'PROPUESTA'
  | 'NEGOCIACIÓN'
  | 'CIERRE_GANADO'
  | 'CIERRE_PERDIDO';

export type EstadoOportunidad = 'ACTIVA' | 'INACTIVA' | 'GANADA' | 'PERDIDA';
