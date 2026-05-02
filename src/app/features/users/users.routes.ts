import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role-guard';

export const USERS_ROUTES: Routes = [
  {
    path: 'users',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR'] },
    loadComponent: () => import('./pages/users/users.component').then((m) => m.UsersComponent),
  },

  {
    path: 'users/create',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR'] },
    loadComponent: () =>
      import('./pages/user-form/user-form.component').then((m) => m.UserFormComponent),
  },

  {
    path: 'users/edit/:id',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR'] },
    loadComponent: () =>
      import('./pages/user-form/user-form.component').then((m) => m.UserFormComponent),
  },
];
