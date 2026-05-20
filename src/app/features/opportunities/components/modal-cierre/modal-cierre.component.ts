import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadoOportunidad, OportunidadResponse } from '../../../../core/models/oportunidad.model';

@Component({
  selector: 'app-modal-cierre',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-cierre.component.html',
  styleUrl: './modal-cierre.component.css',
})
export class ModalCierreComponent {
  // ── Inputs ──────────────────────────────────────────────
  // La oportunidad que se está cerrando
  oportunidad = input.required<OportunidadResponse>();

  // Tipo de cierre: GANADO o PERDIDO
  tipoCierre = input.required<'CIERRE_GANADO' | 'CIERRE_PERDIDO'>();

  // ── Outputs — eventos que emite hacia el padre ──────────
  // Usuario confirmó el cierre
  confirmado = output<EstadoOportunidad>();

  // Usuario canceló — cerró el modal sin confirmar
  cancelado = output<void>();

  // ── Getters de utilidad ─────────────────────────────────
  get esGanado(): boolean {
    return this.tipoCierre() === 'CIERRE_GANADO';
  }

  get titulo(): string {
    return this.esGanado ? '🏆 Cierre Ganado' : '❌ Cierre Perdido';
  }

  get mensaje(): string {
    return this.esGanado
      ? '¿Confirmas que esta oportunidad fue cerrada exitosamente?'
      : '¿Confirmas que esta oportunidad fue cerrada sin éxito?';
  }

  get colorHeader(): string {
    return this.esGanado
      ? 'linear-gradient(135deg, #10b981, #059669)'
      : 'linear-gradient(135deg, #ef4444, #dc2626)';
  }

  // ── Acciones ────────────────────────────────────────────
  confirmar(): void {
    const estado: EstadoOportunidad = this.esGanado ? 'GANADA' : 'PERDIDA';
    this.confirmado.emit(estado);
  }

  cerrar(): void {
    this.cancelado.emit();
  }
}
