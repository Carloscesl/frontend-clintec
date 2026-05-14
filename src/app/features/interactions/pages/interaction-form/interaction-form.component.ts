import { Component, OnInit, computed, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { InteraccionService } from '../../../../core/services/interaccion.service';
import { OportunidadService } from '../../../../core/services/oportunidad.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TipoInteraccion } from '../../../../core/models/interaccion.model';
import { ClienteResponse } from '../../../../core/models/cliente.model';
import { OportunidadResponse } from '../../../../core/models/oportunidad.model';

@Component({
  selector: 'app-interaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './interaction-form.component.html',
  styleUrl: './interaction-form.component.css',
})
export class InteractionFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InteraccionService);
  private readonly clienteServ = inject(ClienteService);
  private readonly opServ = inject(OportunidadService);
  private readonly authService = inject(AuthService);

  // Outputs para comunicación con el componente padre
  cerrar = output<void>();
  guardado = output<void>();

  clientes = signal<ClienteResponse[]>([]);
  oportunidades = signal<OportunidadResponse[]>([]);
  guardando = signal(false);
  error = signal<string | null>(null);

  private readonly usuarioId = this.authService.obtenerUsuarioId()!;

  tipos: { valor: TipoInteraccion; label: string; icon: string }[] = [
    { valor: 'LLAMADA', label: 'Llamada', icon: '📞' },
    { valor: 'REUNION', label: 'Reunión', icon: '🤝' },
    { valor: 'EMAIL', label: 'Email', icon: '✉️' },
    { valor: 'VISITA', label: 'Visita', icon: '🚗' },
    { valor: 'WHATSAPP', label: 'WhatsApp', icon: '💬' },
    { valor: 'OTRO', label: 'Otro', icon: '📌' },
  ];

  form = this.fb.group({
    clienteId: [null as number | null, Validators.required],
    oportunidadId: [null as number | null, Validators.required],
    tipo: ['' as TipoInteraccion | '', Validators.required],
    nota: ['', [Validators.required, Validators.minLength(5)]],
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.cargarClientes();
    this.opServ.listarPorAsesor(this.usuarioId).subscribe({
      next: (data) => this.oportunidades.set(data.filter((o) => o.estado === 'ACTIVA')),
    });
  }

  clientesFiltrados = computed(() => {
    const listaClientes = this.clientes();
    const listaOps = this.oportunidades();

    const idsDeMisClientes = listaOps
      .filter((op) => Number(op.asesorId) === Number(this.usuarioId))
      .map((op) => op.clienteId);

    return listaClientes.filter((cliente) => idsDeMisClientes.includes(cliente.id));
  });

  cargarClientes(): void {
    this.clienteServ.listar().subscribe({
      next: (data) => this.clientes.set(data),
    });
  }

  onClienteChange(idCliente: number): void {
    this.f['oportunidadId'].setValue(null);
    this.opServ.buscarPorCliente(idCliente).subscribe({
      next: (data) => this.oportunidades.set(data.filter((o) => o.estado === 'ACTIVA')),
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    this.service
      .crear({
        clienteId: this.form.value.clienteId!,
        usuarioId: this.usuarioId,
        oportunidadId: this.form.value.oportunidadId!,
        tipo: this.form.value.tipo as TipoInteraccion,
        nota: this.form.value.nota!,
      })
      .subscribe({
        next: () => {
          this.guardado.emit(); // Notificar éxito
          this.form.reset();
        },
        error: (err) => {
          this.error.set(err.error?.message ?? 'Error al registrar la interacción');
          this.guardando.set(false);
        },
      });
  }

  cancelar(): void {
    this.cerrar.emit();
  }
}
