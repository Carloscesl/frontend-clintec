import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role-guard';

export const SALES_ROUTES: Routes = [
  {
    path: 'sales',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR', 'GERENTE'] },
    loadComponent: () =>
      import('./pages/sale-list/sale-list.component').then((m) => m.SaleListComponent),
  },
  {
    // Se llega desde el kanban con ?oportunidadId=X
    path: 'sales/registrar',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR', 'ASESOR'] },
    loadComponent: () =>
      import('./pages/sale-form/sale-form.component').then((m) => m.SaleFormComponent),
  },
  {
    path: 'sales/detalle/:id',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR', 'GERENTE', 'ASESOR'] },
    loadComponent: () =>
      import('./pages/sale-detail/sale-detail.component').then((m) => m.SaleDetailComponent),
  },
];
