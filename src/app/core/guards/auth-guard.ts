import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // 1. SI ESTÁ EN EL SERVIDOR: No bloquees nada.
  // Esto evita el mensaje en la terminal y el parpadeo inicial.
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // 2. SI ESTÁ EN EL NAVEGADOR: Aquí sí validamos en serio.
  const user = authService.currentUser();
  if (user && user.token) {
    return true;
  }

  // Si realmente no hay sesión en el navegador, al login.
  console.warn('Acceso denegado en el navegador: Redirigiendo a login');
  router.navigate(['/login']);
  return false;
};
