import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);

  nombreUser = signal('');
  email = signal('');
  password = signal('');

  onRegister() {
    const newUser = {
      nombreUser: this.nombreUser(),
      email: this.email(),
      password: this.password(),
    };
    this.authService.register(newUser).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error al registrar:', err);
      },
    });
  }
}
