import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  public authService = inject(AuthService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  errorMessage = signal('');

  ngOnInit() {
    // 🛡️ Si ya hay un usuario en el Signal (recuperado del storage)
    const user = this.authService.currentUser();
    if (user) {
      console.log('Sesión activa detectada, redirigiendo...');
      this.redirigirSegunRol();
    }
  }

  // Extraemos la lógica de redirección a un método aparte para reutilizarlo
  private redirigirSegunRol() {
    const userRole = this.authService.getRole();
    switch (userRole) {
      case 'ADMINISTRADOR':
        this.router.navigate(['/admin']);
        break;
      case 'GERENTE':
        this.router.navigate(['/gerente']);
        break;
      case 'ASESOR':
        this.router.navigate(['/asesor']);
        break;
    }
  }

  onLogin() {
    const credenciales = { email: this.email(), password: this.password() };
    this.authService.login(credenciales).subscribe({
      next: () => this.redirigirSegunRol(), // Usamos el nuevo método
      error: (err) => this.errorMessage.set('Credenciales inválidas.'),
    });
  }
}
