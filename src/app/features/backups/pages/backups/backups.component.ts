import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BackupService } from '../../../../core/services/backup.service';
import { BackupResponse } from '../../../../core/models/backup.model';
import { ModalService } from '../../../../shared/services/modal.service';
import { ModalRestaurarComponent } from '../../components/modal-restaurar/modal-restaurar.component';

@Component({
  selector: 'app-backups',
  standalone: true,
  imports: [CommonModule, TranslatePipe, ModalRestaurarComponent],
  templateUrl: './backups.component.html',
  styleUrl: './backups.component.css',
})
export class BackupsComponent implements OnInit {
  private readonly backupService = inject(BackupService);
  private readonly modalService = inject(ModalService);
  private readonly translate = inject(TranslateService);

  backups = signal<BackupResponse[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  creando = signal(false);
  restaurando = signal(false);
  descargandoId = signal<number | null>(null);

  // Backup elegido para restaurar (null = modal cerrado)
  backupARestaurar = signal<BackupResponse | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);

    this.backupService.listar().subscribe({
      next: (data) => {
        this.backups.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.translate.instant('BACKUPS.ERROR_LOAD'));
        this.loading.set(false);
      },
    });
  }

  crearBackup(): void {
    this.creando.set(true);

    this.backupService.crear().subscribe({
      next: (backup) => {
        this.creando.set(false);
        this.modalService.show(
          this.translate.instant('BACKUPS.SUCCESS_CREATED', { file: backup.nombreArchivo }),
          'success',
        );
        this.cargar();
      },
      error: (err) => {
        this.creando.set(false);
        this.modalService.show(
          err.error?.mensaje ?? this.translate.instant('BACKUPS.ERROR_CREATE'),
          'error',
        );
      },
    });
  }

  // ── Restaurar ───────────────────────────────────────────
  abrirRestaurar(backup: BackupResponse): void {
    this.backupARestaurar.set(backup);
  }

  cancelarRestaurar(): void {
    this.backupARestaurar.set(null);
  }

  confirmarRestaurar(): void {
    const backup = this.backupARestaurar();
    if (!backup) return;

    this.restaurando.set(true);

    this.backupService.restaurar(backup.id).subscribe({
      next: (res) => {
        this.restaurando.set(false);
        this.backupARestaurar.set(null);
        this.modalService.show(
          this.translate.instant('BACKUPS.SUCCESS_RESTORED', { file: res.respaldoDeSeguridad }),
          'success',
        );
        this.cargar();
      },
      error: (err) => {
        this.restaurando.set(false);
        this.backupARestaurar.set(null);
        this.modalService.show(
          err.error?.mensaje ?? this.translate.instant('BACKUPS.ERROR_RESTORE'),
          'error',
        );
        this.cargar();
      },
    });
  }

  // ── Descargar ───────────────────────────────────────────
  descargar(backup: BackupResponse): void {
    this.descargandoId.set(backup.id);

    this.backupService.descargar(backup.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = backup.nombreArchivo;
        a.click();
        URL.revokeObjectURL(url);
        this.descargandoId.set(null);
      },
      error: () => {
        this.descargandoId.set(null);
        this.modalService.show(this.translate.instant('BACKUPS.ERROR_DOWNLOAD'), 'error');
      },
    });
  }

  // ── Utilidades de presentación ──────────────────────────
  formatearTamano(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
