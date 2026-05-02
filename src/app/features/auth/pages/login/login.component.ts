import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';

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
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
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
        this.error = err.error?.message || 'Error al iniciar sesión';
      },
    });
  }

  private redirigirSegunRol(rol: string): void {
    switch (rol) {
      case 'ADMINISTRADOR':
        this.router.navigate(['/dashboard']);
        break;
      case 'GERENTE':
        this.router.navigate(['/dashboard']);
        break;
      case 'ASESOR':
        this.router.navigate(['/dashboard']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }
}
