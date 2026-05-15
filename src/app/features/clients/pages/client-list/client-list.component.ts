import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

// Servicios
import { ClienteService } from '../../../../core/services/cliente.service';
import { AuthService } from '../../../../core/services/auth.service';
import { OportunidadService } from '../../../../core/services/oportunidad.service';

// Modelos
import { ClienteResponse } from '../../../../core/models/cliente.model';
import { OportunidadResponse } from '../../../../core/models/oportunidad.model';
import { QualificationClient } from '../../../../core/models/calificacion.model';
import { CalificacionService } from '../../../../core/services/calificacion.service';
import { QualificationBadgeComponent } from '../../../qualifications/pages/qualification-badge/qualification-badge.component';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, QualificationBadgeComponent],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css',
})
export class ClientListComponent implements OnInit {
  private readonly clienteService = inject(ClienteService);
  private readonly oportunidadService = inject(OportunidadService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly qualificationSvc = inject(CalificacionService);

  private readonly clientes = signal<ClienteResponse[]>([]);
  private readonly oportunidades = signal<OportunidadResponse[]>([]);
  private readonly calificaciones = signal<Map<number, QualificationClient>>(new Map());

  loading = signal(true);
  error = signal<string | null>(null);

  private readonly usuarioLogueado = this.authService.obtenerUsuario();
  private readonly rol = this.usuarioLogueado?.roles?.[0] ?? '';
  private readonly usuarioId = this.usuarioLogueado?.id;

  puedeCrear = ['ADMINISTRADOR', 'GERENTE'].includes(this.rol);
  puedeEditar = ['ADMINISTRADOR', 'GERENTE'].includes(this.rol);

  clientesFiltrados = computed(() => {
    const listaClientes = this.clientes();
    const listaOps = this.oportunidades();

    if (this.rol === 'ASESOR') {
      const idsDeMisClientes = listaOps
        .filter((op) => Number(op.asesorId) === Number(this.usuarioId))
        .map((op) => op.clienteId);

      return listaClientes.filter((cliente) => idsDeMisClientes.includes(cliente.id));
    }
    return listaClientes;
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      clientes: this.clienteService.listar(),
      oportunidades: this.oportunidadService.listar(),
      calificaciones: this.qualificationSvc.findAll(),
    }).subscribe({
      next: ({ clientes, oportunidades, calificaciones }) => {
        this.clientes.set(clientes);
        this.oportunidades.set(oportunidades);
        const map = new Map(calificaciones.map((q) => [q.clienteId, q]));
        this.calificaciones.set(map);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al sincronizar datos de clientes y oportunidades');
        this.loading.set(false);
      },
    });
  }

  getCalificacion(clienteId: number): QualificationClient | undefined {
    return this.calificaciones().get(clienteId);
  }

  // --- Métodos de navegación ---
  irACrear(): void {
    this.router.navigate(['/clients/crear']);
  }

  irAEditar(id: number): void {
    this.router.navigate(['/clients/editar', id]);
  }

  irADetalle(id: number): void {
    this.router.navigate(['/clients/detalle', id]);
  }
}
