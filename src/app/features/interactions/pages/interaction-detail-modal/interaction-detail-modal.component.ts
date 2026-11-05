import { Component, OnInit, inject, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { InteraccionService } from '../../../../core/services/interaccion.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { InteraccionResponse, TipoInteraccion } from '../../../../core/models/interaccion.model';
import { AuthService } from '../../../../core/services/auth.service';
import { UsuarioService } from '../../../../core/services/usuario.service';

@Component({
  selector: 'app-interaction-detail-modal',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './interaction-detail-modal.component.html',
  styleUrl: './interaction-detail-modal.component.css',
})
export class InteractionDetailModalComponent implements OnInit {
  // Input: ID de la interacción a mostrar
  interaccionId = input.required<number>();

  // Output: evento para cerrar el modal
  cerrar = output<void>();

  private readonly authService = inject(AuthService);

  private readonly service = inject(InteraccionService);
  private readonly clienteServ = inject(ClienteService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly translate = inject(TranslateService);
  private readonly rol = this.authService.obtenerRol() ?? '';
  noEsAsesor = this.rol !== 'ASESOR';

  interaccion = signal<InteraccionResponse | null>(null);
  clienteNombre = signal('');
  clienteEmpresa = signal('');
  usuarioNombre = signal('');
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.interaccionId();
    if (id) this.cargar(id);
  }

  cargar(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.service.buscarPorId(id).subscribe({
      next: (data) => {
        this.interaccion.set(data);
        this.loading.set(false);
        this.cargarCliente(data.clienteId);
        this.cargarUsuario(data.usuarioId);
      },
      error: () => {
        this.error.set(this.translate.instant('INTERACTIONS.DETAIL.ERROR_NOT_FOUND'));
        this.loading.set(false);
      },
    });
  }

  cargarUsuario(id: number): void {
    if (this.rol === 'ASESOR') {
      const usuarioLogueado = this.authService.obtenerUsuario();
      this.usuarioNombre.set(
        usuarioLogueado?.username ?? this.translate.instant('INTERACTIONS.DETAIL.MY_USER'),
      );
      return;
    }
    this.usuarioService.buscarPorId(id).subscribe({
      next: (u) => {
        this.usuarioNombre.set(u.nombre || this.translate.instant('INTERACTIONS.DETAIL.NO_NAME'));
      },
      error: () => {
        this.usuarioNombre.set(this.translate.instant('INTERACTIONS.DETAIL.UNKNOWN_USER'));
      },
    });
  }

  cargarCliente(id: number): void {
    this.clienteServ.buscarPorId(id).subscribe({
      next: (c) => {
        console.log('Cliente cargado:', c); // Para debug
        this.clienteNombre.set(
          c.nombreCliente || this.translate.instant('INTERACTIONS.DETAIL.NO_NAME'),
        );
        // Si no tiene empresa se muestra el texto traducido "Sin empresa"
        this.clienteEmpresa.set(c.empresa || this.translate.instant('INTERACTIONS.DETAIL.NO_COMPANY'));
      },
      error: (err) => {
        console.error('Error al cargar cliente:', err);
        this.clienteNombre.set(this.translate.instant('INTERACTIONS.DETAIL.UNKNOWN_CLIENT'));
        this.clienteEmpresa.set('');
      },
    });
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
}
