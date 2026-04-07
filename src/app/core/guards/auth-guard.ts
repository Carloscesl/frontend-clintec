import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // En el servidor nunca bloquees — las rutas protegidas
  // ya tienen RenderMode.Client así que esto es solo por seguridad
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // En el browser sí validamos con localStorage disponible
  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
