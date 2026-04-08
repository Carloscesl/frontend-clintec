// Mapea lo que devuelve el backend en UsuarioResponseDTO
export interface UsuarioResponse {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMINISTRADOR' | 'GERENTE' | 'ASESOR';
  activo: boolean;
}

// Mapea lo que espera el backend en UsuarioRequestDTO
export interface UsuarioRequest {
  nombre: string;
  email: string;
  password?: string; // Solo requerido al crear
  rol: 'ADMINISTRADOR' | 'GERENTE' | 'ASESOR';
}

export interface UsuarioUpdateRequest {
  nombre: string;
  email: string;
  password?: string; // opcional en edición
  rol: 'ADMINISTRADOR' | 'GERENTE' | 'ASESOR';
}
