import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role-guard';

export const OPPORTUNITIES_ROUTES: Routes = [
  {
    path: 'opportunities',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR', 'GERENTE', 'ASESOR'] },
    loadComponent: () =>
      import('./pages/opportunity-main/opportunity-main.component').then(
        (m) => m.OpportunityMainComponent,
      ),
  },
  {
    path: 'opportunities/crear',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR', 'GERENTE'] },
    loadComponent: () =>
      import('./pages/opportunity-form/opportunity-form.component').then(
        (m) => m.OpportunityFormComponent,
      ),
  },
  {
    path: 'opportunities/editar/:id',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR', 'GERENTE'] },
    loadComponent: () =>
      import('./pages/opportunity-form/opportunity-form.component').then(
        (m) => m.OpportunityFormComponent,
      ),
  },
];
