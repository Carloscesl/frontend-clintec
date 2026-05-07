import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OportunidadService } from '../../../../core/services/oportunidad.service';
import { LookupItem, OportunidadRequest } from '../../../../core/models/oportunidad.model';
import { ModalService } from '../../../../shared/services/modal.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { UsuarioService } from '../../../../core/services/usuario.service';

@Component({
  selector: 'app-opportunity-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './opportunity-form.component.html',
  styleUrl: './opportunity-form.component.css',
})
export class OpportunityFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly oportunidadService = inject(OportunidadService);
  private readonly modalService = inject(ModalService);

  private readonly clienteService = inject(ClienteService);
  private readonly usuarioService = inject(UsuarioService);

  ListaClientes = signal<LookupItem[]>([]);
  ListaUsuarios = signal<LookupItem[]>([]);

  modoEdicion = signal(false);
  oportunidadId = signal<number | null>(null);
  guardando = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    clienteId: [0, [Validators.required, Validators.min(1)]],

    asesorId: [0, [Validators.required, Validators.min(1)]],

    descripcion: ['', [Validators.required, Validators.minLength(10)]],

    valorEstimado: [0, [Validators.required, Validators.min(0)]],

    fechaCierreEstimada: ['', Validators.required],
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarAsesores();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.modoEdicion.set(true);
      this.oportunidadId.set(Number(id));
      this.cargarOportunidad(Number(id));
    }
  }

  cargarClientes(): void {
    this.clienteService.listar().subscribe({
      next: (data) => {
        this.ListaClientes.set(
          data.map((c) => ({
            id: c.id,
            nombre: c.nombreCliente,
          })),
        );
      },
    });
  }

  cargarAsesores(): void {
    this.usuarioService.listarPorRol('ASESOR').subscribe({
      next: (data) => {
        const soloAsesores = data.map((u) => ({
          id: u.id,
          nombre: u.nombre,
        }));
        this.ListaUsuarios.set(soloAsesores);
      },
    });
  }

  cargarOportunidad(id: number): void {
    this.oportunidadService.buscarPorId(id).subscribe({
      next: (o) => {
        this.form.patchValue({
          clienteId: Number(o.clienteId),
          asesorId: Number(o.asesorId),
          descripcion: o.descripcion,
          valorEstimado: o.valorEstimado,
          fechaCierreEstimada: o.fechaCierreEstimada.split('T')[0],
        });
        if (this.modoEdicion()) {
          this.form.get('clienteId')?.disable();
        }
      },
      error: () => this.error.set('No se pudo cargar la oportunidad'),
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set(null);

    const dto = this.form.getRawValue() as OportunidadRequest;

    const operacion = this.modoEdicion()
      ? this.oportunidadService.actualizar(this.oportunidadId()!, dto)
      : this.oportunidadService.crear(dto);

    operacion.subscribe({
      next: () => {
        const mensaje = this.modoEdicion() ? 'Actualizada' : 'Creada';
        this.modalService.show(`Oportunidad ${mensaje} con éxito`, 'success');
        this.router.navigate(['/opportunities']);
      },
      error: (err) => {
        this.guardando.set(false);
        console.log('Detalles del error:', err.error.detalles);
        this.modalService.show('Error al procesar la solicitud', 'error');
        console.error(err);
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/opportunities']);
  }
}
