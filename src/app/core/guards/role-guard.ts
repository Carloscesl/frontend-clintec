import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const rolesPermitidos: string[] = route.data['roles'] ?? [];

  const rolUsuario = authService.obtenerRol();

  if (rolUsuario && rolesPermitidos.includes(rolUsuario)) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
