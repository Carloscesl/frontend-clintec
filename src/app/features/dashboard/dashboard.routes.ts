import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role-guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: 'dashboard/admin',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR'] },
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent,
      ),
  },
  {
    path: 'dashboard/asesor',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR', 'ASESOR'] },
    loadComponent: () =>
      import('./pages/asesor-dashboard/asesor-dashboard.component').then(
        (m) => m.AsesorDashboardComponent,
      ),
  },
  {
    path: 'dashboard/gerente',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR', 'GERENTE'] },
    loadComponent: () =>
      import('./pages/gerente-dashboard/gerente-dashboard.component').then(
        (m) => m.GerenteDashboardComponent,
      ),
  },
];
