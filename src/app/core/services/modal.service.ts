import { Injectable, signal } from '@angular/core';

export interface ModalConfig {
  tipo: 'exito' | 'error';
  titulo: string;
  mensaje: string;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  modal = signal<ModalConfig | null>(null);

  exito(titulo: string, mensaje: string) {
    this.modal.set({ tipo: 'exito', titulo, mensaje });
  }

  error(titulo: string, mensaje: string) {
    this.modal.set({ tipo: 'error', titulo, mensaje });
  }

  cerrar() {
    this.modal.set(null);
  }
}
