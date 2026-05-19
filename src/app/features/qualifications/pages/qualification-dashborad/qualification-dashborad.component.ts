import { Component, inject, OnInit, signal } from '@angular/core';
import { CalificacionService } from '../../../../core/services/calificacion.service';
import {
  QUALIFICATION_CONFIG,
  QualificationClient,
  QualificationLevel,
} from '../../../../core/models/calificacion.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QualificationProgressBarComponent } from '../qualification-progress-bar/qualification-progress-bar.component';
import { QualificationBadgeComponent } from '../qualification-badge/qualification-badge.component';

@Component({
  selector: 'app-qualification-dashborad',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    QualificationProgressBarComponent,
    QualificationBadgeComponent,
  ],
  templateUrl: './qualification-dashborad.component.html',
  styleUrl: './qualification-dashborad.component.css',
})
export class QualificationDashboradComponent implements OnInit {
  private readonly svc = inject(CalificacionService);

  clientes = signal<QualificationClient[]>([]);
  distribucion = signal<Record<QualificationLevel, number> | null>(null);
  filtroActivo = signal<QualificationLevel | null>(null);
  editando = signal<{ clienteId: number; puntaje: number } | null>(null);
  loading = signal(true);

  readonly niveles: QualificationLevel[] = ['FRIO', 'TIBIO', 'CALIENTE', 'VIP'];
  readonly config = QUALIFICATION_CONFIG;

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading.set(true);
    this.svc.findAll().subscribe((data) => {
      this.clientes.set(data.sort((a, b) => b.puntaje - a.puntaje));
      this.loading.set(false);
    });
    this.svc.distribucion().subscribe((d) => this.distribucion.set(d.distribucion));
  }

  get clientesFiltrados(): QualificationClient[] {
    const filtro = this.filtroActivo();
    return filtro ? this.clientes().filter((c) => c.clasificacion === filtro) : this.clientes();
  }

  toggleFiltro(nivel: QualificationLevel) {
    this.filtroActivo.set(this.filtroActivo() === nivel ? null : nivel);
  }

  iniciarEdicion(c: QualificationClient) {
    this.editando.set({ clienteId: c.clienteId, puntaje: c.puntaje });
  }

  guardarPuntaje() {
    const e = this.editando();
    if (!e) return;
    this.svc.actualizarPuntaje(e.clienteId, e.puntaje).subscribe(() => {
      this.editando.set(null);
      this.cargarDatos();
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
