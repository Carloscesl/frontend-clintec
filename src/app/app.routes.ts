import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role-guard';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  // --- Redirección raíz ---
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // --- Rutas públicas --- solo loadComponent, sin component
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },

  // --- Rutas protegidas ---
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout').then((m) => m.Layout),
    canActivate: [authGuard],
    children: [
      // Ruta por defecto dentro del layout
      { path: '', redirectTo: 'admin', pathMatch: 'full' },
      {
        path: 'admin',
        loadComponent: () =>
          import('./features/admin/pages/admin-dashboard/admin-dashboard').then(
            (m) => m.AdminDashboard,
          ),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR'] },
      },
      {
        path: 'asesor',
        loadComponent: () =>
          import('./features/asesor/pages/asesor-dashboard/asesor-dashboard').then(
            (m) => m.AsesorDashboard,
          ),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR', 'ASESOR'] },
      },
      {
        path: 'gerente',
        loadComponent: () =>
          import('./features/gerente/pages/gerente-dashboard/gerente-dashboard').then(
            (m) => m.GerenteDashboard,
          ),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR', 'GERENTE'] },
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
