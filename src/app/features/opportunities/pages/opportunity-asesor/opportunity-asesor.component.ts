import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { OportunidadService } from '../../../../core/services/oportunidad.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { AuthService } from '../../../../core/services/auth.service';

import { EtapaOportunidad, OportunidadResponse } from '../../../../core/models/oportunidad.model';

import { ClienteResponse } from '../../../../core/models/cliente.model';

import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { ModalProbabilidadComponent } from '../modal-probabilidad/modal-probabilidad.component';

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
  imports: [CommonModule, DragDropModule, ModalProbabilidadComponent],
  templateUrl: './opportunity-asesor.component.html',
  styleUrls: ['./opportunity-asesor.component.css'],
})
export class OpportunityAsesorComponent implements OnInit {
  private readonly serviceOportunidad = inject(OportunidadService);
  private readonly clienteService = inject(ClienteService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  oportunidades = signal<OportunidadResponse[]>([]);
  clientes = signal<ClienteResponse[]>([]);
  nombreAsesor = signal('');

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

    const updated = this.oportunidades().map((op) =>
      op.idOportunidad === oportunidad.idOportunidad ? { ...op, etapa: columnaDestino.etapa } : op,
    );

    this.oportunidades.set(updated);

    this.cambiarEtapa(oportunidad, columnaDestino.etapa);
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
}
