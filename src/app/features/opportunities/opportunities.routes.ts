import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role-guard';

export const OPPORTUNITIES_ROUTES: Routes = [
  {
    path: 'opportunities',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR', 'GERENTE', 'ASESOR'] },
    loadComponent: () =>
      import('./pages/opportunity/opportunity-shell.component').then(
        (m) => m.OpportunityShellComponent,
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
    data: { roles: ['ADMINISTRADOR', 'GERENTE', 'ASESOR'] },
    loadComponent: () =>
      import('./pages/opportunity-form/opportunity-form.component').then(
        (m) => m.OpportunityFormComponent,
      ),
  },
  {
    path: 'opportunities/probabilidad/:id',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR', 'GERENTE', 'ASESOR'] },
    loadComponent: () =>
      import('./components/modal-probabilidad/modal-probabilidad.component').then(
        (m) => m.ModalProbabilidadComponent,
      ),
  },
];
