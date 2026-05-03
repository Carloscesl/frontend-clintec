import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteService } from '../../../../core/services/cliente.service';
import { ClienteRequest } from '../../../../core/models/cliente.model';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.css',
})
export class ClientFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clienteService = inject(ClienteService);

  modoEdicion = signal(false);
  clienteId = signal<number | null>(null);
  guardando = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    nombreCliente: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', Validators.required],
    empresa: [''],
    direccion: [''],
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.modoEdicion.set(true);
      this.clienteId.set(Number(id));
      this.cargarCliente(Number(id));
    }
  }

  cargarCliente(id: number): void {
    this.clienteService.buscarPorId(id).subscribe({
      next: (c) => {
        this.form.patchValue({
          nombreCliente: c.nombreCliente,
          email: c.email,
          telefono: c.telefono,
          empresa: c.empresa,
          direccion: c.direccion,
        });
      },
      error: () => this.error.set('No se pudo cargar el cliente'),
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    const val = this.form.value as ClienteRequest;

    const operacion = this.modoEdicion()
      ? this.clienteService.actualizar(this.clienteId()!, val)
      : this.clienteService.crear(val);

    operacion.subscribe({
      next: () => this.router.navigate(['/clients']),
      error: (err) => {
        this.error.set(err.error?.message ?? 'Error al guardar');
        this.guardando.set(false);
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/clients']);
  }
}
