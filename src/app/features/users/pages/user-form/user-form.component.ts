import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { Rol } from '../../../../core/models/usuario.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css',
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usuarioService = inject(UsuarioService);

  modoEdicion = signal(false);
  usuarioId = signal<number | null>(null);
  guardando = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rol: ['', Validators.required],
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.modoEdicion.set(true);
      this.usuarioId.set(Number(id));
      this.f['password'].clearValidators();
      this.f['password'].updateValueAndValidity();

      this.cargarUsuario(Number(id));
    }
  }

  cargarUsuario(id: number): void {
    this.usuarioService.buscarPorId(id).subscribe({
      next: (usuario) => {
        this.form.patchValue({
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
        });
      },
      error: () => this.error.set('No se pudo cargar el usuario'),
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set(null);
    const val = this.form.value;

    if (this.modoEdicion()) {
      this.usuarioService
        .actualizar(this.usuarioId()!, {
          nombre: val.nombre!,
          email: val.email!,
          rol: val.rol as Rol,
          ...(val.password ? { password: val.password } : {}),
        })
        .subscribe({
          next: () => this.router.navigate(['/users']),
          error: (err) => {
            this.error.set(err.error?.message ?? 'Error al actualizar');
            this.guardando.set(false);
          },
        });
    } else {
      // CREAR
      this.usuarioService
        .crear({
          nombre: val.nombre!,
          email: val.email!,
          password: val.password!,
          rol: val.rol as Rol,
        })
        .subscribe({
          next: () => this.router.navigate(['/users']),
          error: (err) => {
            this.error.set(err.error?.message ?? 'Error al crear usuario');
            this.guardando.set(false);
          },
        });
    }
  }

  cancelar(): void {
    this.router.navigate(['/users']);
  }
}
