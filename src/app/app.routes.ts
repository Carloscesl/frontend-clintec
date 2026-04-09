import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role-guard';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  // --- Redirección raíz ---
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // --- Rutas públicas ---
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },

  // --- Rutas protegidas ---
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout').then((m) => m.Layout),
    canActivate: [authGuard],
    children: [
      // Ruta por defecto dentro del layout
      { path: '', redirectTo: 'admin', pathMatch: 'full' },

      // ── ADMIN ──────────────────────────────────────────────
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR'] },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/admin/pages/admin-dashboard/admin-dashboard').then(
                (m) => m.AdminDashboard,
              ),
          },
          // Lista de usuarios
          {
            path: 'usuarios',
            loadComponent: () =>
              import('./features/admin/usuarios/pages/lista-usuario/lista-usuario').then(
                (m) => m.ListaUsuario,
              ),
          },
          // Formulario para crear usuario
          {
            path: 'usuarios/nuevo',
            loadComponent: () =>
              import('./features/admin/usuarios/pages/form-usuario/form-usuario').then(
                (m) => m.FormUsuario,
              ),
          },
          // Formulario para editar usuario (mismo componente, distinto modo)
          {
            path: 'usuarios/editar/:id',
            loadComponent: () =>
              import('./features/admin/usuarios/pages/form-usuario/form-usuario').then(
                (m) => m.FormUsuario,
              ),
          },
        ],
      },

      // ── ASESOR ─────────────────────────────────────────────
      {
        path: 'asesor',
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR', 'ASESOR'] },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/asesor/pages/asesor-dashboard/asesor-dashboard').then(
                (m) => m.AsesorDashboard,
              ),
          },
          {
            path: 'clientes',
            loadComponent: () =>
              import('./features/asesor/clientes/pages/lista-clientes/lista-clientes').then(
                (m) => m.ListaClientes,
              ),
          },
          {
            path: 'clientes/nuevo',
            loadComponent: () =>
              import('./features/asesor/clientes/pages/form-clientes/form-clientes').then(
                (m) => m.FormClientes,
              ),
          },
          {
            path: 'clientes/editar/:id',
            loadComponent: () =>
              import('./features/asesor/clientes/pages/form-clientes/form-clientes').then(
                (m) => m.FormClientes,
              ),
          },
        ],
      },

      // ── GERENTE ────────────────────────────────────────────
      {
        path: 'gerente',
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR', 'GERENTE'] },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/gerente/pages/gerente-dashboard/gerente-dashboard').then(
                (m) => m.GerenteDashboard,
              ),
          },
          {
            path: 'clientes',
            loadComponent: () =>
              import('./features/asesor/clientes/pages/lista-clientes/lista-clientes').then(
                (m) => m.ListaClientes,
              ),
          },
          {
            path: 'clientes/nuevo',
            loadComponent: () =>
              import('./features/asesor/clientes/pages/form-clientes/form-clientes').then(
                (m) => m.FormClientes,
              ),
          },
          {
            path: 'clientes/editar/:id',
            loadComponent: () =>
              import('./features/asesor/clientes/pages/form-clientes/form-clientes').then(
                (m) => m.FormClientes,
              ),
          },
        ],
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
