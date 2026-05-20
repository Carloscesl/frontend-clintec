// qualification/components/qualification-priority-panel/qualification-priority-panel.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QualificationBadgeComponent } from '../qualification-badge/qualification-badge.component';
import { QualificationProgressBarComponent } from '../qualification-progress-bar/qualification-progress-bar.component';
import {
  QualificationClient,
  QUALIFICATION_CONFIG,
} from '../../../../core/models/calificacion.model';
import { CalificacionService } from '../../../../core/services/calificacion.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { forkJoin, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-qualification-priority-panel',
  standalone: true,
  imports: [CommonModule, QualificationBadgeComponent, QualificationProgressBarComponent],
  templateUrl: './qualification-priority-panel.component.html',
  styleUrls: ['./qualification-priority-panel.component.css'],
})
export class QualificationPriorityPanelComponent implements OnInit {
  private readonly svc = inject(CalificacionService);
  private readonly clienteservice = inject(ClienteService);
  top5 = signal<QualificationClient[]>([]);
  readonly config = QUALIFICATION_CONFIG;

  ngOnInit(): void {
    this.svc
      .findTopN(5)
      .pipe(
        switchMap((calificaciones) => {
          if (!calificaciones.length) {
            return of([]);
          }

          const requests = calificaciones.map((item) =>
            this.clienteservice.buscarPorId(item.clienteId).pipe(
              map((cliente) => ({
                ...item,
                clienteNombre: cliente?.nombreCliente || 'Sin nombre',
                clienteEmpresa: cliente?.empresa || '',
                clienteIniciales: this.iniciales(cliente?.nombreCliente),
              })),
            ),
          );

          return forkJoin(requests);
        }),
      )
      .subscribe({
        next: (data) => {
          this.top5.set(data);
        },
        error: (err) => {
          console.error('Error cargando clientes:', err);
        },
      });
  }

  iniciales(nombre?: string): string {
    if (!nombre) return '?';

    return nombre
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }
}
