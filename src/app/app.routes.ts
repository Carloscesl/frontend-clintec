import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  // Ruta raíz
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Auth — carga sus propias rutas
  {
    path: '',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // Rutas protegidas dentro del layout
  {
    path: '',
    loadComponent: () =>
      import('./shared/components/layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    canActivate: [authGuard],
    children: [
      // Cada feature carga sus propias rutas
      {
        path: '',
        loadChildren: () => import('./features/users/users.routes').then((m) => m.USERS_ROUTES),
      },
      {
        path: '',
        loadChildren: () =>
          import('./features/clients/clients.routes').then((m) => m.CLIENTS_ROUTES),
      },
      {
        path: '',
        loadChildren: () =>
          import('./features/opportunities/opportunities.routes').then(
            (m) => m.OPPORTUNITIES_ROUTES,
          ),
      },
      {
        path: '',
        loadChildren: () => import('./features/sales/sales.routes').then((m) => m.SALES_ROUTES),
      },
      {
        path: '',
        loadChildren: () =>
          import('./features/interactions/interactions.routes').then((m) => m.INTERACTIONS_ROUTES),
      },
      {
        path: '',
        loadChildren: () => import('./features/alerts/alerts.routes').then((m) => m.ALERTS_ROUTES),
      },
      {
        path: '',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
