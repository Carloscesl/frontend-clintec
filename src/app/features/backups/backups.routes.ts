import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role-guard';

export const BACKUPS_ROUTES: Routes = [
  {
    path: 'backups',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR'] },
    loadComponent: () =>
      import('./pages/backups/backups.component').then((m) => m.BackupsComponent),
  },
];
