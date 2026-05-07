import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);

  usuario = computed(() => this.authService.obtenerUsuario());
  rol = computed(() => this.authService.obtenerRol() ?? '');

  iniciales = computed(() => {
    const nombre = this.usuario()?.username ?? '';
    return nombre.slice(0, 2).toUpperCase();
  });

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
