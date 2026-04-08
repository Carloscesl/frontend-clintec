import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuariosService } from '../../../../../core/services/usuarios-service';
import { UsuarioRequest, UsuarioUpdateRequest } from '../../../../../core/models/usuario.model';
import { ModalService } from '../../../../../core/services/modal.service';

@Component({
  selector: 'app-form-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-usuario.html',
  styleUrl: './form-usuario.css',
})
export class FormUsuario implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuariosService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private modalService = inject(ModalService);

  guardando = signal(false);
  error = signal('');
  usuarioId = signal<number | null>(null);
  esEdicion = signal(false);

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    rol: ['ASESOR' as 'ADMINISTRADOR' | 'GERENTE' | 'ASESOR', Validators.required],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.usuarioId.set(+idParam);
      this.esEdicion.set(true);
      // Password opcional en edición, solo valida minlength si escribe algo
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
      this.cargarUsuario(+idParam);
    } else {
      // Password obligatorio en creación
      this.form.get('password')?.addValidators([Validators.required, Validators.minLength(6)]);
      this.form.get('password')?.updateValueAndValidity();
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
      error: () => {
        this.error.set('No se pudo cargar el usuario.');
      },
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set('');

    const formValue = this.form.value;

    if (this.esEdicion()) {
      const dto: UsuarioUpdateRequest = {
        nombre: formValue.nombre!,
        email: formValue.email!,
        rol: formValue.rol as 'ADMINISTRADOR' | 'GERENTE' | 'ASESOR',
        ...(formValue.password ? { password: formValue.password } : {}),
      };

      this.usuarioService.actualizar(this.usuarioId()!, dto).subscribe({
        next: () => {
          this.guardando.set(false);
          this.modalService.exito(
            '¡Usuario actualizado!',
            'Los datos del usuario se guardaron correctamente.',
          );
          setTimeout(() => {
            this.modalService.cerrar();
            this.router.navigate(['/admin/usuarios']);
          }, 2000);
        },
        error: () => {
          this.guardando.set(false);
          this.modalService.error(
            'Error al actualizar',
            'No se pudieron guardar los cambios. Intenta de nuevo.',
          );
        },
      });
    } else {
      const dto: UsuarioRequest = {
        nombre: formValue.nombre!,
        email: formValue.email!,
        password: formValue.password!,
        rol: formValue.rol as 'ADMINISTRADOR' | 'GERENTE' | 'ASESOR',
      };

      this.usuarioService.crear(dto).subscribe({
        next: () => {
          this.guardando.set(false);
          this.modalService.exito(
            '¡Usuario creado!',
            'El nuevo usuario fue registrado exitosamente.',
          );
          setTimeout(() => {
            this.modalService.cerrar();
            this.router.navigate(['/admin/usuarios']);
          }, 2000);
        },
        error: () => {
          this.guardando.set(false);
          this.modalService.error(
            'Error al crear',
            'No se pudo registrar el usuario. Intenta de nuevo.',
          );
        },
      });
    }
  }

  tieneError(campo: string, validacion: string): boolean {
    const control: AbstractControl | null = this.form.get(campo);
    return !!(control?.hasError(validacion) && control?.touched);
  }

  cancelar(): void {
    this.router.navigate(['/admin/usuarios']);
  }
}
