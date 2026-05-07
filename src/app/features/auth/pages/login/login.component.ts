import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { ModalService } from '../../../../shared/services/modal.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;

  cargando = false;
  error = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly modalService: ModalService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  campo(nombre: string) {
    return this.loginForm.get(nombre);
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.error = '';

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.authService.guardarSesion(response);
        this.redirigirSegunRol(response.roles[0]);
      },
      error: (err) => {
        this.cargando = false;
        this.modalService.show(
          'Error al iniciar sesión: ' + (err.error?.message || 'Error desconocido'),
          'error',
        );
      },
    });
  }

  private redirigirSegunRol(rol: string): void {
    const rolLimpio = rol.replace('ROLE_', '');
    switch (rolLimpio) {
      case 'ADMINISTRADOR':
        this.router.navigate(['/dashboard/admin']);
        break;
      case 'GERENTE':
        this.router.navigate(['/dashboard/gerente']);
        break;
      case 'ASESOR':
        this.router.navigate(['/dashboard/asesor']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }
}
