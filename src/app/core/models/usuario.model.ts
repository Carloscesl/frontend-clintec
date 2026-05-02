export interface UsuarioResponse {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
  fechaCreacion: string;
}

export interface UsuarioRequest {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
}

export interface UsuarioUpdateRequest {
  nombre: string;
  email: string;
  password?: string;
  rol: Rol;
}

export type Rol = 'ADMINISTRADOR' | 'ASESOR' | 'GERENTE';
