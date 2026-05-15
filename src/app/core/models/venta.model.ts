export interface VentaResponse {
  idVenta: number;
  idOportunidad: number;
  idAsesor: number;
  valorVenta: number;
  paymentMethod: MetodoPago;
  notas: string;
  fechaVenta: string;
  fechaActualizacion: string;
}

export interface VentaRequest {
  idOportunidad: number;
  idAsesor: number;
  valorVenta: number;
  paymentMethod: MetodoPago;
  notas: string;
}

export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA_CREDITO' | 'TARJETA_DEBITO';
