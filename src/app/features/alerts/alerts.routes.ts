import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role-guard';

export const ALERTS_ROUTES: Routes = [
  {
    path: 'alerts',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR', 'ASESOR', 'GERENTE'] },
    loadComponent: () =>
      import('./pages/main-alerts/main-alerts.component').then((m) => m.MainAlertsComponent),
  },
];
