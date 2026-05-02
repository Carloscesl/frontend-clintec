export interface ClienteResponse {
  idCliente: number;
  nombreCliente: string;
  empresa: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaRegistro: string;
}

export interface ClienteRequest {
  nombreCliente: string;
  empresa: string;
  email: string;
  telefono: string;
  direccion: string;
}
