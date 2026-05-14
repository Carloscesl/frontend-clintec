import { Component, OnInit, inject, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InteraccionService } from '../../../../core/services/interaccion.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { InteraccionResponse, TipoInteraccion } from '../../../../core/models/interaccion.model';

@Component({
  selector: 'app-interaction-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './interaction-detail-modal.component.html',
  styleUrl: './interaction-detail-modal.component.css',
})
export class InteractionDetailModalComponent implements OnInit {
  // Input: ID de la interacción a mostrar
  interaccionId = input.required<number>();

  // Output: evento para cerrar el modal
  cerrar = output<void>();

  private service = inject(InteraccionService);
  private clienteServ = inject(ClienteService);

  interaccion = signal<InteraccionResponse | null>(null);
  clienteNombre = signal('');
  clienteEmpresa = signal('');
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
      },
      error: () => {
        this.error.set('No se encontró la interacción');
        this.loading.set(false);
      },
    });
  }

  cargarCliente(id: number): void {
    this.clienteServ.buscarPorId(id).subscribe({
      next: (c) => {
        console.log('Cliente cargado:', c); // Para debug
        this.clienteNombre.set(c.nombreCliente || 'Sin nombre');
        // Prueba diferentes posibles nombres de propiedad
        this.clienteEmpresa.set(c.empresa || 'Sin empresa');
      },
      error: (err) => {
        console.error('Error al cargar cliente:', err);
        this.clienteNombre.set('Cliente desconocido');
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
