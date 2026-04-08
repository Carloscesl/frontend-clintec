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
        loadComponent: () =>
          import('./features/asesor/pages/asesor-dashboard/asesor-dashboard').then(
            (m) => m.AsesorDashboard,
          ),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR', 'ASESOR'] },
      },

      // ── GERENTE ────────────────────────────────────────────
      {
        path: 'gerente',
        loadComponent: () =>
          import('./features/gerente/pages/gerente-dashboard/gerente-dashboard').then(
            (m) => m.GerenteDashboard,
          ),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR', 'GERENTE'] },
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
