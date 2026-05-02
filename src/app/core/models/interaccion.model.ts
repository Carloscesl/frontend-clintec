export interface InteraccionResponse {
  id: number;
  clienteId: number;
  usuarioId: number;
  oportunidadId: number;
  tipo: TipoInteraccion;
  nota: string;
  fecha: string;
  fechaActualizacion: string;
}

export interface InteraccionRequest {
  clienteId: number;
  usuarioId: number;
  oportunidadId: number;
  tipo: TipoInteraccion;
  nota: string;
}

export type TipoInteraccion = 'LLAMADA' | 'REUNION' | 'EMAIL' | 'VISITA' | 'WHATSAPP' | 'OTRO';
