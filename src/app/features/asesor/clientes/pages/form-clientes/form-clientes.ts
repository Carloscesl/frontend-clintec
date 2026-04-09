import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientesService } from '../../../../../core/services/clientes-service';
import { ClientesRequest } from '../../../../../core/models/clientes.model';
import { ModalService } from '../../../../../core/services/modal.service';
@Component({
  selector: 'app-form-clientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-clientes.html',
  styleUrl: './form-clientes.css',
})
export class FormClientes implements OnInit {
  private fb = inject(FormBuilder);
  private clientesService = inject(ClientesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private modalService = inject(ModalService);

  guardando = signal(false);
  error = signal('');
  clienteId = signal<number | null>(null);
  esEdicion = signal(false);

  form = this.fb.group({
    nombreCliente: ['', [Validators.required, Validators.minLength(2)]],
    empresa: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required]],
    direccion: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.clienteId.set(+idParam);
      this.esEdicion.set(true);
      this.cargarCliente(+idParam);
    }
  }

  cargarCliente(id: number): void {
    this.clientesService.BuscarPorId(id).subscribe({
      next: (cliente) => {
        this.form.patchValue({
          nombreCliente: cliente.nombreCliente,
          empresa: cliente.empresa,
          email: cliente.email,
          telefono: cliente.telefono,
          direccion: cliente.direccion,
        });
      },
      error: () => this.error.set('No se pudo cargar el cliente.'),
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set('');

    const dto: ClientesRequest = {
      nombreCliente: this.form.value.nombreCliente!,
      empresa: this.form.value.empresa!,
      email: this.form.value.email!,
      telefono: this.form.value.telefono!,
      direccion: this.form.value.direccion!,
    };

    const rutaBase = this.router.url.includes('gerente') ? '/gerente' : '/asesor';

    const accion$ = this.esEdicion()
      ? this.clientesService.ActualizarCliente(this.clienteId()!, dto)
      : this.clientesService.CrearCliente(dto);

    accion$.subscribe({
      next: () => {
        this.guardando.set(false);
        this.modalService.exito(
          this.esEdicion() ? '¡Cliente actualizado!' : '¡Cliente creado!',
          this.esEdicion()
            ? 'Los datos del cliente se guardaron correctamente.'
            : 'El cliente fue registrado exitosamente.',
        );
        setTimeout(() => {
          this.modalService.cerrar();
          this.router.navigate([`${rutaBase}/clientes`]);
        }, 2000);
      },
      error: () => {
        this.guardando.set(false);
        this.modalService.error(
          'Error al guardar',
          'No se pudo guardar el cliente. Intenta de nuevo.',
        );
      },
    });
  }

  tieneError(campo: string, validacion: string): boolean {
    const control: AbstractControl | null = this.form.get(campo);
    return !!(control?.hasError(validacion) && control?.touched);
  }

  cancelar(): void {
    const base = this.router.url.includes('gerente') ? '/gerente' : '/asesor';
    this.router.navigate([`${base}/clientes`]);
  }
}
