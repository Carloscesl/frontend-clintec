import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role-guard';

export const INTERACTIONS_ROUTES: Routes = [
  {
    path: 'interactions',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR', 'ASESOR', 'GERENTE'] },
    loadComponent: () =>
      import('./pages/list-interactions/list-interactions.component').then(
        (m) => m.ListInteractionsComponent,
      ),
  },
];
