import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { inject } from '@angular/core';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Verificamos si el usuario está autenticado usando tu Signal
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // 2. Obtenemos los roles permitidos para esta ruta desde la configuración
  // (Esto lo definiremos en el app-routing)
  const expectedRoles = route.data['roles'] as Array<string>;
  const userRole = authService.getRole();

  // 3. Verificamos si el rol del usuario coincide con los permitidos
  if (userRole && expectedRoles.includes(userRole)) {
    return true;
  }

  // 4. Si el rol no coincide (ej: VENDEDOR tratando de entrar a Admin), redirigimos
  console.warn('Acceso denegado: Rol insuficiente');
  router.navigate(['/login']); // O a una página de "403 Forbidden"
  return false;
};
