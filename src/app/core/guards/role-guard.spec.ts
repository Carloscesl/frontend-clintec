import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  provideRouter,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { vi } from 'vitest';

import { roleGuard } from './role-guard';
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

// ── roleGuard ──────────────────────────────────────────────────────────────

describe('roleGuard', () => {
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

  // ── acceso permitido ─────────────────────────────────────────────────────

  it('debería permitir el acceso si el rol del usuario está entre los roles permitidos', () => {
    authServiceMock.obtenerRol.mockReturnValue('ADMINISTRADOR');
    const ruta = crearRuta({ roles: ['ADMINISTRADOR', 'GERENTE'] });

    const resultado = TestBed.runInInjectionContext(() => roleGuard(ruta, estadoMock));

    expect(resultado).toBe(true);
  });

  it('debería permitir el acceso cuando el usuario tiene exactamente el único rol permitido', () => {
    authServiceMock.obtenerRol.mockReturnValue('ASESOR');
    const ruta = crearRuta({ roles: ['ASESOR'] });

    const resultado = TestBed.runInInjectionContext(() => roleGuard(ruta, estadoMock));

    expect(resultado).toBe(true);
  });

  it('debería permitir el acceso a cualquier rol cuando la lista de roles permitidos incluye todos', () => {
    authServiceMock.obtenerRol.mockReturnValue('GERENTE');
    const ruta = crearRuta({ roles: ['ADMINISTRADOR', 'GERENTE', 'ASESOR'] });

    const resultado = TestBed.runInInjectionContext(() => roleGuard(ruta, estadoMock));

    expect(resultado).toBe(true);
  });

  // ── acceso denegado ──────────────────────────────────────────────────────

  it('debería denegar el acceso si el rol del usuario no está entre los roles permitidos', () => {
    authServiceMock.obtenerRol.mockReturnValue('ASESOR');
    const ruta = crearRuta({ roles: ['ADMINISTRADOR', 'GERENTE'] });

    const resultado = TestBed.runInInjectionContext(() => roleGuard(ruta, estadoMock));

    expect(resultado).toBe(false);
  });

  it('debería denegar el acceso si el usuario no tiene rol (obtenerRol retorna null)', () => {
    authServiceMock.obtenerRol.mockReturnValue(null);
    const ruta = crearRuta({ roles: ['ADMINISTRADOR'] });

    const resultado = TestBed.runInInjectionContext(() => roleGuard(ruta, estadoMock));

    expect(resultado).toBe(false);
  });

  it('debería denegar el acceso si la lista de roles permitidos está vacía', () => {
    authServiceMock.obtenerRol.mockReturnValue('ADMINISTRADOR');
    const ruta = crearRuta({ roles: [] });

    const resultado = TestBed.runInInjectionContext(() => roleGuard(ruta, estadoMock));

    expect(resultado).toBe(false);
  });

  it('debería denegar el acceso si la ruta no tiene la propiedad roles en data', () => {
    authServiceMock.obtenerRol.mockReturnValue('ADMINISTRADOR');
    const ruta = crearRuta({});

    const resultado = TestBed.runInInjectionContext(() => roleGuard(ruta, estadoMock));

    expect(resultado).toBe(false);
  });

  // ── redirección ──────────────────────────────────────────────────────────

  it('debería redirigir a /login si el rol no está permitido', () => {
    authServiceMock.obtenerRol.mockReturnValue('ASESOR');
    const navigateSpy = vi.spyOn(router, 'navigate');
    const ruta = crearRuta({ roles: ['ADMINISTRADOR'] });

    TestBed.runInInjectionContext(() => roleGuard(ruta, estadoMock));

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('debería redirigir a /login si el usuario no tiene rol', () => {
    authServiceMock.obtenerRol.mockReturnValue(null);
    const navigateSpy = vi.spyOn(router, 'navigate');
    const ruta = crearRuta({ roles: ['ADMINISTRADOR'] });

    TestBed.runInInjectionContext(() => roleGuard(ruta, estadoMock));

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('no debería redirigir si el rol del usuario está permitido', () => {
    authServiceMock.obtenerRol.mockReturnValue('ADMINISTRADOR');
    const navigateSpy = vi.spyOn(router, 'navigate');
    const ruta = crearRuta({ roles: ['ADMINISTRADOR'] });

    TestBed.runInInjectionContext(() => roleGuard(ruta, estadoMock));

    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
