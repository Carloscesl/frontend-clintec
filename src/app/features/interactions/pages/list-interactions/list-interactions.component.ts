import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { InteraccionService } from '../../../../core/services/interaccion.service';
import { InteraccionResponse, TipoInteraccion } from '../../../../core/models/interaccion.model';
import { AuthService } from '../../../../core/services/auth.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ClienteResponse } from '../../../../core/models/cliente.model';
import { InteractionDetailModalComponent } from '../interaction-detail-modal/interaction-detail-modal.component';
import { InteractionFormComponent } from '../interaction-form/interaction-form.component';
import { UsuarioResponse } from '../../../../core/models/usuario.model';
import { UsuarioService } from '../../../../core/services/usuario.service';

@Component({
  selector: 'app-list-interactions',
  standalone: true,
  imports: [
    CommonModule,
    InteractionDetailModalComponent,
    InteractionFormComponent,
    TranslatePipe,
  ],
  templateUrl: './list-interactions.component.html',
  styleUrl: './list-interactions.component.css',
})
export class ListInteractionsComponent implements OnInit {
  private readonly interaccionService = inject(InteraccionService);
  private readonly authService = inject(AuthService);
  private readonly usuariosService = inject(UsuarioService);
  private readonly clienteService = inject(ClienteService);
  private readonly translate = inject(TranslateService);

  error = signal<string | null>(null);
  loading = signal(true);
  interacciones = signal<InteraccionResponse[]>([]);
  clientes = signal<ClienteResponse[]>([]);
  usuarios = signal<UsuarioResponse[]>([]);

  filtroTipo = signal<TipoInteraccion | 'TODOS'>('TODOS');

  // Estado del modal de detalle
  modalAbierto = signal(false);
  interaccionSeleccionada = signal<number | null>(null);

  // Estado del panel de creación
  panelCrearAbierto = signal(false);

  clienteMap = new Map<number, ClienteResponse>();

  private readonly rol = this.authService.obtenerRol() ?? '';
  private readonly usuarioId = this.authService.obtenerUsuarioId();
  esAsesor = this.rol === 'ASESOR';

  interaccionesFiltradas = computed(() => {
    const tipo = this.filtroTipo();
    if (tipo === 'TODOS') return this.interacciones();
    return this.interacciones().filter((i) => i.tipo === tipo);
  });

  tipos: { valor: TipoInteraccion | 'TODOS'; label: string; icon: string }[] = [
    { valor: 'TODOS', label: 'ENUMS.TIPO_INTERACCION.TODOS', icon: '◈' },
    { valor: 'LLAMADA', label: 'ENUMS.TIPO_INTERACCION.LLAMADA', icon: '📞' },
    { valor: 'REUNION', label: 'ENUMS.TIPO_INTERACCION.REUNION', icon: '🤝' },
    { valor: 'EMAIL', label: 'ENUMS.TIPO_INTERACCION.EMAIL', icon: '✉️' },
    { valor: 'VISITA', label: 'ENUMS.TIPO_INTERACCION.VISITA', icon: '🚗' },
    { valor: 'WHATSAPP', label: 'ENUMS.TIPO_INTERACCION.WHATSAPP', icon: '💬' },
    { valor: 'OTRO', label: 'ENUMS.TIPO_INTERACCION.OTRO', icon: '📌' },
  ];

  ngOnInit(): void {
    this.cargarClientes();
    this.cargar();
    if (!this.esAsesor) {
      this.cargarUsuarios();
    }
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);

    const peticion =
      this.esAsesor && this.usuarioId
        ? this.interaccionService.listarPorUsuario(this.usuarioId)
        : this.interaccionService.listar();

    peticion.subscribe({
      next: (data) => {
        const ordenadas = [...data].sort(
          (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
        );
        this.interacciones.set(ordenadas);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.translate.instant('INTERACTIONS.ERROR_LOAD'));
        this.loading.set(false);
      },
    });
  }

  cargarClientes(): void {
    this.clienteService.listar().subscribe({
      next: (data) => {
        this.clientes.set(data);
        this.clienteMap = new Map(data.map((c) => [c.id, c]));
      },
    });
  }

  cargarUsuarios(): void {
    this.usuariosService.listar().subscribe({
      next: (data) => {
        this.usuarios.set(data);
      },
    });
  }

  getClienteNombre(id: number): string {
    return (
      this.clienteMap.get(id)?.nombreCliente ?? this.translate.instant('CLIENTS.LIST.COL_CLIENT')
    );
  }

  getClienteEmpresa(id: number): string {
    return this.clienteMap.get(id)?.empresa ?? '';
  }

  getTipoConfig(tipo: TipoInteraccion) {
    const config: Record<TipoInteraccion, { icon: string; color: string; bg: string }> = {
      LLAMADA: { icon: '📞', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
      REUNION: { icon: '🤝', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
      EMAIL: { icon: '✉️', color: '#A855F7', bg: 'rgba(168,85,247,0.12)' },
      VISITA: { icon: '🚗', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
      WHATSAPP: { icon: '💬', color: '#00D4AA', bg: 'rgba(0,212,170,0.12)' },
      OTRO: { icon: '📌', color: '#94A3B8', bg: 'rgba(148,163,184,0.12)' },
    };
    return config[tipo];
  }

  irADetalle(id: number): void {
    this.interaccionSeleccionada.set(id);
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.interaccionSeleccionada.set(null);
  }

  irACrear(): void {
    this.panelCrearAbierto.set(true);
  }

  cerrarPanelCrear(): void {
    this.panelCrearAbierto.set(false);
  }

  onInteraccionCreada(): void {
    this.panelCrearAbierto.set(false);
    this.cargar(); // Recargar la lista
  }
}
