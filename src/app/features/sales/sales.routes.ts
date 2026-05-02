import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role-guard';

export const SALES_ROUTES: Routes = [
  {
    path: 'sales',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR'] },
    loadComponent: () => import('./pages/sales/sales.component').then((m) => m.SalesComponent),
  },
];
