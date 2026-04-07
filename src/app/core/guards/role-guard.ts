import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { inject } from '@angular/core';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Verificamos si el usuario está autenticado usando tu Signal
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  const rolesPermitidos: string[] = route.data['roles'] ?? [];
  const rolActual = authService.getRole();

  if (rolActual && rolesPermitidos.includes(rolActual)) {
    return true;
  }

  console.warn('Acceso denegado: Rol insuficiente');
  router.navigate(['/login']); // O a una página de "403 Forbidden"
  return false;
};
