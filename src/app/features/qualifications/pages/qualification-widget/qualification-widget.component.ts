// qualification/components/qualification-widget/qualification-widget.component.ts
import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  ],
  templateUrl: './qualification-widget.component.html',
  styleUrls: ['./qualification-widget.component.css'],
})
export class QualificationWidgetComponent implements OnInit {
  @Input({ required: true }) clienteId!: number;
  @Input() puedeEditar = false; // true para ADMIN/GERENTE, false para ASESOR

  private readonly svc = inject(CalificacionService);

  calificacion = signal<QualificationClient | null>(null);
  historial = signal<QualificationHistory[]>([]);
  editando = signal(false);
  nuevoPuntaje = signal(0);
  readonly config = QUALIFICATION_CONFIG;

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.svc.findByClienteId(this.clienteId).subscribe((q) => {
      this.calificacion.set(q);
      this.nuevoPuntaje.set(q.puntaje);
    });
    this.svc
      .historialPorCliente(this.clienteId)
      .subscribe((h) => this.historial.set(h.slice(0, 5)));
  }

  guardar() {
    this.svc.actualizarPuntaje(this.clienteId, this.nuevoPuntaje()).subscribe(() => {
      this.editando.set(false);
      this.cargar();
    });
  }

  motivoLabel(motivo: string): string {
    const map: Record<string, string> = {
      VENTA_CERRADA: '🏆 Venta cerrada',
      INACTIVIDAD_AUTOMATICA: '⏰ Inactividad',
    };
    if (map[motivo]) return map[motivo];
    if (motivo.startsWith('INTERACCION_'))
      return '💬 ' + motivo.replace('INTERACCION_', '').toLowerCase();
    if (motivo.startsWith('ETAPA_')) return '📈 Avance de etapa';
    return motivo;
  }
}
