import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { OportunidadService } from '../../../../core/services/oportunidad.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { AuthService } from '../../../../core/services/auth.service';

import {
  EstadoOportunidad,
  EtapaOportunidad,
  OportunidadResponse,
  STAGE_RANGES,
} from '../../../../core/models/oportunidad.model';

import { ClienteResponse } from '../../../../core/models/cliente.model';

import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { ModalProbabilidadComponent } from '../../components/modal-probabilidad/modal-probabilidad.component';
import { QualificationClient } from '../../../../core/models/calificacion.model';
import { CalificacionService } from '../../../../core/services/calificacion.service';
import { QualificationBadgeComponent } from '../../../qualifications/pages/qualification-badge/qualification-badge.component';
import { ModalCierreComponent } from '../../components/modal-cierre/modal-cierre.component';

interface KanbanColumn {
  etapa: EtapaOportunidad;
  label: string;
  color: string;
  colorRgb: string;
  items: OportunidadResponse[];
}

@Component({
  selector: 'app-opportunity-asesor',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    ModalProbabilidadComponent,
    QualificationBadgeComponent,
    ModalCierreComponent,
  ],
  templateUrl: './opportunity-asesor.component.html',
  styleUrls: ['./opportunity-asesor.component.css'],
})
export class OpportunityAsesorComponent implements OnInit {
  private readonly serviceOportunidad = inject(OportunidadService);
  private readonly clienteService = inject(ClienteService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly qualificationSvc = inject(CalificacionService);
  private readonly calificaciones = signal<Map<number, QualificationClient>>(new Map());

  oportunidades = signal<OportunidadResponse[]>([]);
  clientes = signal<ClienteResponse[]>([]);
  nombreAsesor = signal('');

  modalCierreAbierto = signal(false);
  opCierre = signal<OportunidadResponse | null>(null);
  tipoCierre = signal<'CIERRE_GANADO' | 'CIERRE_PERDIDO' | null>(null);

  oportunidadesPendientesCierre = signal<Set<number>>(new Set());

  loading = signal(true);
  error = signal<string | null>(null);

  // ── MAPS ────────────────────────────────────────────────
  private clienteMap = new Map<number, ClienteResponse>();

  // ── KANBAN CONFIG ────────────────────────────────────────
  columnas: KanbanColumn[] = [
    {
      etapa: 'PROSPECCION',
      label: 'Prospección',
      color: '#3B82F6',
      colorRgb: '59,130,246',
      items: [],
    },
    {
      etapa: 'CALIFICACION',
      label: 'Calificación',
      color: '#A855F7',
      colorRgb: '168,85,247',
      items: [],
    },
    { etapa: 'PROPUESTA', label: 'Propuesta', color: '#06B6D4', colorRgb: '6,182,212', items: [] },
    {
      etapa: 'NEGOCIACION',
      label: 'Negociación',
      color: '#F59E0B',
      colorRgb: '245,158,11',
      items: [],
    },
    {
      etapa: 'CIERRE_GANADO',
      label: 'Cierre',
      color: '#10B981',
      colorRgb: '16,185,129',
      items: [],
    },
    {
      etapa: 'CIERRE_PERDIDO',
      label: 'Perdido',
      color: '#EF4444',
      colorRgb: '239,68,68',
      items: [],
    },
  ];

  get connectedLists(): string[] {
    return this.columnas.map((c) => c.etapa);
  }

  ngOnInit(): void {
    this.nombreAsesor.set(this.authService.obtenerUsuario()?.username || 'Asesor');
    this.cargar();
    this.cargarClientes();
    this.cargarCalificaciones();
  }

  // ── LOAD OPORTUNIDADES ──────────────────────────────────
  cargar(): void {
    this.loading.set(true);

    const asesorId = this.authService.obtenerUsuarioId();

    if (!asesorId) {
      this.error.set('Usuario no autenticado');
      this.loading.set(false);
      return;
    }

    this.serviceOportunidad.listarPorAsesor(asesorId).subscribe({
      next: (data) => {
        const activas = data.filter((o) => o.estado === 'ACTIVA');

        this.oportunidades.set(activas);

        this.reconstruirKanban();

        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar oportunidades');
        this.loading.set(false);
      },
    });
  }

  // ── KANBAN BUILDER ──────────────────────────────────────
  reconstruirKanban(): void {
    const data = this.oportunidades();

    this.columnas = this.columnas.map((col) => ({
      ...col,
      items: data.filter((o) => o.etapa === col.etapa),
    }));
  }

  // ── CLIENTES ─────────────────────────────────────────────
  cargarClientes(): void {
    this.clienteService.listar().subscribe({
      next: (data) => {
        this.clientes.set(data);
        this.clienteMap = new Map(data.map((c) => [c.id, c]));
      },
    });
  }

  cargarCalificaciones(): void {
    this.qualificationSvc.findAll().subscribe((data) => {
      const map = new Map(data.map((q) => [q.clienteId, q]));
      this.calificaciones.set(map);
    });
  }

  // ── DRAG & DROP ─────────────────────────────────────────
  onDrop(event: CdkDragDrop<OportunidadResponse[]>, columnaDestino: KanbanColumn): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    const oportunidad = event.previousContainer.data[event.previousIndex];

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );

    if (columnaDestino.etapa !== 'CIERRE_GANADO' && columnaDestino.etapa !== 'CIERRE_PERDIDO') {
      const pendientes = new Set(this.oportunidadesPendientesCierre());

      pendientes.delete(oportunidad.idOportunidad);

      this.oportunidadesPendientesCierre.set(pendientes);
    }

    const updated = this.oportunidades().map((op) =>
      op.idOportunidad === oportunidad.idOportunidad
        ? {
            ...op,
            etapa: columnaDestino.etapa,
            probabilidad: STAGE_RANGES[columnaDestino.etapa].default,
          }
        : op,
    );

    this.oportunidades.set(updated);

    this.reconstruirKanban();

    // ✅ Si entra a cierre → abrir modal
    if (columnaDestino.etapa === 'CIERRE_GANADO' || columnaDestino.etapa === 'CIERRE_PERDIDO') {
      this.cambiarEtapa(oportunidad, columnaDestino.etapa);

      this.abrirModalCierre(oportunidad, columnaDestino.etapa);
    } else {
      this.cambiarEtapa(oportunidad, columnaDestino.etapa);
    }
  }

  // ── BACKEND UPDATE ──────────────────────────────────────
  private cambiarEtapa(op: OportunidadResponse, nuevaEtapa: EtapaOportunidad): void {
    this.serviceOportunidad.cambiarEtapa(op.idOportunidad, nuevaEtapa).subscribe({
      next: () => {},
      error: () => this.cargar(),
    });
  }

  // ── HELPERS ──────────────────────────────────────────────
  getClienteNombre(id: number): string {
    return this.clienteMap.get(id)?.nombreCliente ?? 'Cliente';
  }

  getClienteEmpresa(id: number): string {
    return this.clienteMap.get(id)?.empresa ?? '';
  }

  getCalificacion(clienteId: number): QualificationClient | undefined {
    return this.calificaciones().get(clienteId);
  }

  getIniciales(nombre: string): string {
    return nombre
      .split(' ')
      .slice(0, 2)
      .map((n) => n.charAt(0).toUpperCase())
      .join('');
  }

  irAeditar(id: number): void {
    this.router.navigate(['/opportunities/editar', id]);
  }

  modalAbierto = signal(false);
  opSeleccionada = signal<OportunidadResponse | null>(null);

  abrirModalProbabilidad(op: OportunidadResponse, event: Event): void {
    event.stopPropagation();
    this.opSeleccionada.set(op);
    this.modalAbierto.set(true);
  }

  onProbabilidadGuardada(nuevaProb: number): void {
    this.oportunidades.update((lista) =>
      lista.map((o) =>
        o.idOportunidad === this.opSeleccionada()?.idOportunidad
          ? { ...o, probabilidad: nuevaProb }
          : o,
      ),
    );
    this.reconstruirKanban();

    this.modalAbierto.set(false);
    this.opSeleccionada.set(null);
  }

  abrirModalCierre(op: OportunidadResponse, tipo: 'CIERRE_GANADO' | 'CIERRE_PERDIDO'): void {
    this.opCierre.set(op);
    this.tipoCierre.set(tipo);
    this.modalCierreAbierto.set(true);
  }

  // ── El usuario confirmó el cierre ───────────────────────
  onCierreConfirmado(estado: EstadoOportunidad): void {
    const op = this.opCierre();
    if (!op) return;

    // Llamar al backend según el estado
    const accion =
      estado === 'GANADA'
        ? this.serviceOportunidad.cerrarGanada(op.idOportunidad)
        : this.serviceOportunidad.cerrarPerdida(op.idOportunidad);

    accion.subscribe({
      next: () => {
        // Quitar de la lista de pendientes si estaba
        const pendientes = new Set(this.oportunidadesPendientesCierre());
        pendientes.delete(op.idOportunidad);
        this.oportunidadesPendientesCierre.set(pendientes);

        // Actualizar estado en memoria
        this.oportunidades.update((lista) =>
          lista.map((o) => (o.idOportunidad === op.idOportunidad ? { ...o, estado } : o)),
        );

        // Si GANADA → redirigir a registrar venta
        if (estado === 'GANADA') {
          this.router.navigate(['/sales/registrar'], {
            queryParams: { oportunidadId: op.idOportunidad },
          });
        }

        // Recargar kanban sin esa oportunidad (ya no es ACTIVA)
        this.cargar();
      },
      error: () => {
        this.error.set('Error al cerrar la oportunidad');
        this.cargar();
      },
    });

    this.cerrarModalCierre();
  }

  // ── El usuario canceló — guarda como pendiente ───────────
  onCierreCancelado(): void {
    const op = this.opCierre();
    if (!op) return;

    // Marca la oportunidad como pendiente de confirmar
    const pendientes = new Set(this.oportunidadesPendientesCierre());
    pendientes.add(op.idOportunidad);
    this.oportunidadesPendientesCierre.set(pendientes);

    this.cerrarModalCierre();
  }

  // ── Cierra el modal ──────────────────────────────────────
  cerrarModalCierre(): void {
    this.modalCierreAbierto.set(false);
    this.opCierre.set(null);
    this.tipoCierre.set(null);
  }

  // ── Verifica si una oportunidad tiene cierre pendiente ───
  tieneCierrePendiente(op: OportunidadResponse): boolean {
    return (
      op.estado === 'ACTIVA' && (op.etapa === 'CIERRE_GANADO' || op.etapa === 'CIERRE_PERDIDO')
    );
  }

  // ── Reabre el modal desde el botón de la card ────────────
  reabrirModalCierre(op: OportunidadResponse, event: Event): void {
    event.stopPropagation();
    const tipo = op.etapa === 'CIERRE_GANADO' ? 'CIERRE_GANADO' : 'CIERRE_PERDIDO';
    this.abrirModalCierre(op, tipo);
  }
}
