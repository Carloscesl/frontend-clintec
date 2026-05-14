import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { AlertaService } from '../../../../core/services/alerta.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { AlertaResponse, TipoAlerta } from '../../../../core/models/alerta.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-detail-modal-alerts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-modal-alerts.component.html',
  styleUrl: './detail-modal-alerts.component.css',
})
export class DetailModalAlertsComponent implements OnInit {
  alertaId = input.required<number>();
  cerrar = output<void>();

  private readonly authService = inject(AuthService);
  private readonly alertaService = inject(AlertaService);
  private readonly clienteService = inject(ClienteService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly rol = this.authService.obtenerRol() ?? '';

  esAsesor = this.rol === 'ASESOR';
  alerta = signal<AlertaResponse | null>(null);
  clienteNombre = signal('');
  usuarioNombre = signal('');
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.alertaId();
    if (id) this.cargar(id);
  }

  cargar(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.alertaService.buscarPorId(id).subscribe({
      next: (data) => {
        this.alerta.set(data);
        this.loading.set(false);
        this.cargarCliente(data.clienteId);
        this.cargarUsuario(data.usuarioId);
      },
      error: (err) => {
        this.error.set('Error al cargar la alerta');
        this.loading.set(false);
      },
    });
  }

  cargarCliente(clienteId: number): void {
    this.clienteService.buscarPorId(clienteId).subscribe({
      next: (data) => {
        this.clienteNombre.set(data.nombreCliente || 'Desconocido');
      },
      error: () => this.clienteNombre.set('Desconocido'),
    });
  }

  cargarUsuario(usuarioId: number): void {
    if (this.esAsesor) {
      const usuarioLogueado = this.authService.obtenerUsuario();
      this.usuarioNombre.set(usuarioLogueado?.username ?? 'Mi Usuario');
      return;
    }
    this.usuarioService.buscarPorId(usuarioId).subscribe({
      next: (data) => {
        this.usuarioNombre.set(data.nombre || 'Desconocido');
      },
      error: () => {
        this.usuarioNombre.set('Desconocido');
        console.warn('El usuario no tiene permisos para ver detalles de otros usuarios.');
      },
    });
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
}
