export interface ClientesResponse {
  id: number;
  nombreCliente: string;
  empresa: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaRegistro: string;
}

export interface ClientesRequest {
  nombreCliente: string;
  empresa: string;
  email: string;
  telefono: string;
  direccion: string;
}
