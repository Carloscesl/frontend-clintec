import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  provideRouter,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { vi } from 'vitest';

import { authGuard } from './auth-guard';
import { AuthService } from '../services/auth.service';

// ── Componente dummy para rutas stub ───────────────────────────────────────

@Component({ template: '', standalone: true })
class DummyComponent {}

// ── Mocks ──────────────────────────────────────────────────────────────────

const authServiceMock = {
  estaAutenticado: vi.fn(),
  obtenerRol: vi.fn(),
};

// ── Helpers ────────────────────────────────────────────────────────────────

function crearRuta(data: Record<string, unknown> = {}): ActivatedRouteSnapshot {
  const ruta = new ActivatedRouteSnapshot();
  Object.defineProperty(ruta, 'data', { get: () => data });
  return ruta;
}

const estadoMock = {} as RouterStateSnapshot;

// ── authGuard ──────────────────────────────────────────────────────────────

describe('authGuard', () => {
  let router: Router;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'login', component: DummyComponent },
          { path: '**', component: DummyComponent },
        ]),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  it('debería permitir el acceso si el usuario está autenticado', () => {
    authServiceMock.estaAutenticado.mockReturnValue(true);

    const resultado = TestBed.runInInjectionContext(() => authGuard(crearRuta(), estadoMock));

    expect(resultado).toBe(true);
  });

  it('debería denegar el acceso si el usuario no está autenticado', () => {
    authServiceMock.estaAutenticado.mockReturnValue(false);

    const resultado = TestBed.runInInjectionContext(() => authGuard(crearRuta(), estadoMock));

    expect(resultado).toBe(false);
  });

  it('debería redirigir a /login si el usuario no está autenticado', () => {
    authServiceMock.estaAutenticado.mockReturnValue(false);
    const navigateSpy = vi.spyOn(router, 'navigate');

    TestBed.runInInjectionContext(() => authGuard(crearRuta(), estadoMock));

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('no debería redirigir si el usuario está autenticado', () => {
    authServiceMock.estaAutenticado.mockReturnValue(true);
    const navigateSpy = vi.spyOn(router, 'navigate');

    TestBed.runInInjectionContext(() => authGuard(crearRuta(), estadoMock));

    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
