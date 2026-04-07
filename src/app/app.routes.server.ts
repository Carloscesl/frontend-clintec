import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'login',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'register',
    renderMode: RenderMode.Prerender,
  },
  // Rutas protegidas — SOLO el cliente las renderiza
  // El servidor manda el shell vacío y el browser maneja el guard
  {
    path: 'admin',
    renderMode: RenderMode.Client,
  },
  {
    path: 'asesor',
    renderMode: RenderMode.Client,
  },
  {
    path: 'gerente',
    renderMode: RenderMode.Client,
  },
  // Todo lo demás también solo cliente
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
