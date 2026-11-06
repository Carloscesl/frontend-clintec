// qualification/components/qualification-widget/qualification-widget.component.ts
import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { QualificationBadgeComponent } from '../qualification-badge/qualification-badge.component';
import { QualificationProgressBarComponent } from '../qualification-progress-bar/qualification-progress-bar.component';
import {
  QualificationClient,
  QualificationHistory,
  QUALIFICATION_CONFIG,
} from '../../../../core/models/calificacion.model';
import { CalificacionService } from '../../../../core/services/calificacion.service';

@Component({
  selector: 'app-qualification-widget',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    QualificationBadgeComponent,
    QualificationProgressBarComponent,
    TranslatePipe,
  ],
  templateUrl: './qualification-widget.component.html',
  styleUrls: ['./qualification-widget.component.css'],
})
export class QualificationWidgetComponent implements OnInit {
  @Input({ required: true }) clienteId!: number;
  @Input() puedeEditar = false; // true para ADMIN/GERENTE, false para ASESOR

  private readonly svc = inject(CalificacionService);
  private readonly translate = inject(TranslateService);

  calificacion = signal<QualificationClient | null>(null);
  historial = signal<QualificationHistory[]>([]);
  editando = signal(false);
  nuevoPuntaje = signal(0);
  readonly config = QUALIFICATION_CONFIG;

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.svc.findByClienteId(this.clienteId).subscribe({
      next: (q) => {
        if (q) {
          this.calificacion.set(q);
          this.nuevoPuntaje.set(q.puntaje);
        } else {
          this.calificacion.set(null);
        }
      },
      error: () => this.calificacion.set(null), // ← si 404 o error, no crashea
    });
    this.svc.historialPorCliente(this.clienteId).subscribe({
      next: (h) => this.historial.set(h.slice(0, 5)),
      error: () => this.historial.set([]),
    });
  }

  guardar() {
    this.svc.actualizarPuntaje(this.clienteId, this.nuevoPuntaje()).subscribe(() => {
      this.editando.set(false);
      this.cargar();
    });
  }

  motivoLabel(motivo: string): string {
    const map: Record<string, string> = {
      VENTA_CERRADA: 'QUALIFICATIONS.WIDGET.REASON_SALE',
      INACTIVIDAD_AUTOMATICA: 'QUALIFICATIONS.WIDGET.REASON_INACTIVITY',
    };
    if (map[motivo]) return this.translate.instant(map[motivo]);
    if (motivo.startsWith('INTERACCION_')) {
      const tipo = motivo.replace('INTERACCION_', '');
      const clave = `ENUMS.TIPO_INTERACCION.${tipo}`;
      const traducido = this.translate.instant(clave);
      // Si no existe la clave, instant devuelve la propia clave: se usa el texto original
      return '💬 ' + (traducido === clave ? tipo : traducido).toLowerCase();
    }
    if (motivo.startsWith('ETAPA_')) return this.translate.instant('QUALIFICATIONS.WIDGET.REASON_STAGE');
    return motivo;
  }
}
