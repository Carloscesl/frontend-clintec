import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { roleGuard } from './core/guards/role-guard';
import { authGuard } from './core/guards/auth-guard';
import { Layout } from './shared/components/layout/layout';
export const routes: Routes = [
  // --- Redirecciones ---
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  // --- Rutas públicas ---
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'register',
    component: Register,
  },

  // -- Rutas protegidas por roles --

  // Ruta para el Administrador
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin-module').then((m) => m.AdminModule),
        canActivate: [roleGuard], // 👈 El authGuard ya está en el padre, no hace falta repetirlo aquí
        data: { roles: ['ADMINISTRADOR'] },
      },
      {
        path: 'asesor',
        loadChildren: () => import('./features/asesor/asesor-module').then((m) => m.AsesorModule),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR', 'ASESOR'] },
      },
      {
        path: 'gerente',
        loadChildren: () =>
          import('./features/gerente/gerente-module').then((m) => m.GerenteModule),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR', 'GERENTE'] },
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
