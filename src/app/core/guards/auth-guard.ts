import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('clintec_token');

  // Se verificca si exite un token en el localStorage, si existe se permite el acceso a la ruta protegida
  if (token) {
    return true;
  }

  // Si no hay token, se redirige al usuario a la página de login y se bloquea el acceso a la ruta protegida
  router.navigate(['/login']);
  return false;
};
