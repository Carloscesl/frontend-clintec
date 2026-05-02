export interface AlertaResponse {
  id: number;
  clienteId: number;
  usuarioId: number;
  descripcion: string;
  tipo: TipoAlerta;
  estado: EstadoAlerta;
  fechaVencimiento: string;
  fecha: string;
  fechaActualizacion: string;
}

export type TipoAlerta = 'INACTIVIDAD' | 'VENCIMIENTO' | 'SEGUIMIENTO' | 'OPORTUNIDAD';

export type EstadoAlerta = 'PENDIENTE' | 'VISTA' | 'RESUELTA' | 'VENCIDA';
