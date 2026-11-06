export type TipoBackup = 'MANUAL' | 'PRE_RESTAURACION';

export interface BackupResponse {
  id: number;
  nombreArchivo: string;
  tamanoBytes: number;
  tipo: TipoBackup;
  fechaCreacion: string;
  creadoPorNombre: string;
  creadoPorEmail: string;
}

export interface BackupRestoreResponse {
  restauradoDesde: string;
  respaldoDeSeguridad: string;
  fecha: string;
}
