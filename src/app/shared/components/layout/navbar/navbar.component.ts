import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../../core/services/auth.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { LanguageService } from '../../../../core/services/language.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);
  private readonly languageService = inject(LanguageService);

  usuario = computed(() => this.authService.obtenerUsuario());
  rol = computed(() => this.authService.obtenerRol() ?? '');
  idiomaActual = computed(() => this.languageService.idioma().toUpperCase());

  iniciales = computed(() => {
    const nombre = this.usuario()?.username ?? '';
    return nombre.slice(0, 2).toUpperCase();
  });

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleIdioma(): void {
    this.languageService.toggleIdioma();
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
