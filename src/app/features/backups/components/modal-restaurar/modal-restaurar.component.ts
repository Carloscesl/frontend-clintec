import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BackupResponse } from '../../../../core/models/backup.model';

@Component({
  selector: 'app-modal-restaurar',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './modal-restaurar.component.html',
  styleUrl: './modal-restaurar.component.css',
})
export class ModalRestaurarComponent {
  private readonly translate = inject(TranslateService);

  // ── Inputs ──────────────────────────────────────────────
  backup = input.required<BackupResponse>();
  restaurando = input(false);

  // ── Outputs ─────────────────────────────────────────────
  confirmado = output<void>();
  cancelado = output<void>();

  // Palabra que se muestra al administrador (según el idioma activo)
  get palabra(): string {
    return this.translate.instant('BACKUPS.RESTORE_MODAL.CONFIRM_WORD');
  }

  // Se aceptan ambas palabras: así el botón no queda bloqueado si el texto mostrado y el esperado difieren de idioma
  private readonly PALABRAS_VALIDAS = ['RESTAURAR', 'RESTORE'];

  texto = signal('');

  // Método (no computed): se reevalúa siempre y no cachea el idioma
  puedeConfirmar(): boolean {
    const escrito = this.texto().trim().toUpperCase();
    return escrito === this.palabra.toUpperCase() || this.PALABRAS_VALIDAS.includes(escrito);
  }

  onInput(event: Event): void {
    this.texto.set((event.target as HTMLInputElement).value);
  }

  confirmar(): void {
    if (this.puedeConfirmar() && !this.restaurando()) {
      this.confirmado.emit();
    }
  }

  cerrar(): void {
    if (!this.restaurando()) {
      this.cancelado.emit();
    }
  }
}
