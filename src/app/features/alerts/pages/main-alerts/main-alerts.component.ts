import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AlertaResponse, EstadoAlerta, TipoAlerta } from '../../../../core/models/alerta.model';
import { AlertaService } from '../../../../core/services/alerta.service';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { ClienteResponse } from '../../../../core/models/cliente.model';
import { UsuarioResponse } from '../../../../core/models/usuario.model';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { DetailModalAlertsComponent } from '../detail-modal-alerts/detail-modal-alerts.component';
import { CalificacionService } from '../../../../core/services/calificacion.service'; // ✅
import { QualificationBadgeComponent } from '../../../qualifications/pages/qualification-badge/qualification-badge.component';
import { QualificationClient } from '../../../../core/models/calificacion.model';

@Component({
  selector: 'app-main-alerts',
  standalone: true,
  imports: [CommonModule, DetailModalAlertsComponent, QualificationBadgeComponent], // ✅
  templateUrl: './main-alerts.component.html',
  styleUrl: './main-alerts.component.css',
})
export class MainAlertsComponent implements OnInit {
  private readonly alertaService = inject(AlertaService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly clienteService = inject(ClienteService);
  private readonly authService = inject(AuthService);
  private readonly qualificationSvc = inject(CalificacionService);

  private readonly calificaciones = signal<Map<number, QualificationClient>>(new Map());

  error = signal<string | null>(null);
  loading = signal(true);

  alertas = signal<AlertaResponse[]>([]);
  usuarios = signal<UsuarioResponse[]>([]);
  clientes = signal<ClienteResponse[]>([]);

  modalAbierto = signal(false);
  alertaSeleccionada = signal<number | null>(null);

  private readonly rol = this.authService.obtenerRol() ?? '';
  private readonly usuarioId = this.authService.obtenerUsuarioId();
  esAsesor = this.rol === 'ASESOR';

  filtroTipo = signal<TipoAlerta | 'TODOS'>('TODOS');
  filtroEstado = signal<EstadoAlerta | 'TODOS'>('TODOS');

  alertasFiltradas = computed(() => {
    let resultado = this.alertas();
    const tipo = this.filtroTipo();
    if (tipo !== 'TODOS') resultado = resultado.filter((a) => a.tipo === tipo);
    const estado = this.filtroEstado();
    if (estado !== 'TODOS') resultado = resultado.filter((a) => a.estado === estado);
    return resultado;
  });

  tipos: { valor: TipoAlerta | 'TODOS'; label: string; icon: string }[] = [
    { valor: 'TODOS', label: 'Todos', icon: '◈' },
    { valor: 'INACTIVIDAD', label: 'Inactividad', icon: '⏳' },
    { valor: 'VENCIMIENTO', label: 'Vencimiento', icon: '⚠️' },
    { valor: 'SEGUIMIENTO', label: 'Seguimiento', icon: '🔍' },
    { valor: 'OPORTUNIDAD', label: 'Oportunidad', icon: '💡' },
  ];

  estados: { valor: EstadoAlerta | 'TODOS'; label: string }[] = [
    { valor: 'TODOS', label: 'Todos los estados' },
    { valor: 'PENDIENTE', label: 'Pendiente' },
    { valor: 'VISTA', label: 'Vista' },
    { valor: 'RESUELTA', label: 'Resuelta' },
    { valor: 'VENCIDA', label: 'Vencida' },
  ];

  ngOnInit(): void {
    this.cargarAlertas();
    this.cargarClientes();
    this.cargarCalificaciones();
    if (this.rol === 'ADMINISTRADOR') this.cargarUsuarios();
  }

  cargarCalificaciones(): void {
    this.qualificationSvc.findAll().subscribe((data) => {
      const map = new Map(data.map((q) => [q.clienteId, q]));
      this.calificaciones.set(map);
    });
  }

  cargarAlertas(): void {
    this.loading.set(true);
    this.error.set(null);
    const peticion =
      this.esAsesor && this.usuarioId
        ? this.alertaService.porUsuario(this.usuarioId)
        : this.alertaService.listar();

    peticion.subscribe({
      next: (alertas) => {
        this.alertas.set(
          [...alertas].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
        );
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar alertas:', err);
        this.error.set('Error al cargar alertas');
        this.loading.set(false);
      },
    });
  }

  cargarUsuarios(): void {
    this.usuarioService.listar().subscribe({
      next: (usuarios) => this.usuarios.set(usuarios),
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.error.set('Error al cargar usuarios');
      },
    });
  }

  cargarClientes(): void {
    this.clienteService.listar().subscribe({
      next: (clientes) => this.clientes.set(clientes),
      error: (err) => {
        console.error('Error al cargar clientes:', err);
        this.error.set('Error al cargar clientes');
      },
    });
  }

  getClienteNombre(clienteId: number): string {
    return this.clientes().find((c) => c.id === clienteId)?.nombreCliente ?? 'Desconocido';
  }

  getUsuarioNombre(usuarioId: number): string {
    if (this.esAsesor) return this.authService.obtenerUsuario()?.username ?? 'Mi Usuario';
    return this.usuarios().find((u) => u.id === usuarioId)?.nombre ?? 'Asesor Asignado';
  }

  // ✅ Tipo de retorno corregido: QualificationClient no CalificacionService
  getCalificacion(clienteId: number): QualificationClient | undefined {
    return this.calificaciones().get(clienteId);
  }

  getTipoConfig(tipo: TipoAlerta) {
    const config: Record<TipoAlerta, { icon: string; color: string; bg: string }> = {
      INACTIVIDAD: { icon: '⏳', color: '#856404', bg: '#fff3cd' },
      VENCIMIENTO: { icon: '⚠️', color: '#721c24', bg: '#f8d7da' },
      SEGUIMIENTO: { icon: '🔍', color: '#0c5460', bg: '#d1ecf1' },
      OPORTUNIDAD: { icon: '💡', color: '#155724', bg: '#d4edda' },
    };
    return config[tipo];
  }

  marcarVista(id: number) {
    this.alertaService.marcarVista(id).subscribe({
      next: () => this.cargarAlertas(),
      error: () => this.error.set('Error al marcar alerta como vista'),
    });
  }

  resolver(id: number) {
    this.alertaService.resolver(id).subscribe({
      next: () => this.cargarAlertas(),
      error: () => this.error.set('Error al resolver alerta'),
    });
  }

  irADetalle(id: number): void {
    this.alertaSeleccionada.set(id);
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.alertaSeleccionada.set(null);
  }
}
