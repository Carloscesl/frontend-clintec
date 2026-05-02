export interface CalificacionResponse {
  id: number;
  clienteId: number;
  puntaje: number;
  clasificacion: Clasificacion;
  ultimaActualizacion: string;
}

export interface CalificacionRequest {
  puntaje: number;
}

export type Clasificacion = 'FRIO' | 'TIBIO' | 'CALIENTE' | 'VIP';
