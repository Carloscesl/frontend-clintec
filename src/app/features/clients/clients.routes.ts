import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role-guard';

export const CLIENTS_ROUTES: Routes = [
  {
    path: 'clients',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR', 'GERENTE', 'ASESOR'] },
    loadComponent: () =>
      import('./pages/client-list/client-list.component').then((m) => m.ClientListComponent),
  },
  {
    path: 'clients/crear',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR', 'GERENTE'] },
    loadComponent: () =>
      import('./pages/client-form/client-form.component').then((m) => m.ClientFormComponent),
  },
  {
    path: 'clients/editar/:id',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR', 'GERENTE'] },
    loadComponent: () =>
      import('./pages/client-form/client-form.component').then((m) => m.ClientFormComponent),
  },
  {
    path: 'clients/detalle/:id',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR', 'GERENTE', 'ASESOR'] },
    loadComponent: () =>
      import('./pages/client-detail/client-detail.component').then((m) => m.ClientDetailComponent),
  },
];
