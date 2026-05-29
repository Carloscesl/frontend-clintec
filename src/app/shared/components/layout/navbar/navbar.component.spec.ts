import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideRouter, Router } from '@angular/router';

import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../../../core/services/auth.service';
import { ThemeService } from '../../../../core/services/theme.service';

// ── Mocks ──────────────────────────────────────────────────────────────────

const authServiceMock = {
  obtenerUsuario: vi.fn(),
  obtenerRol: vi.fn(),
  cerrarSesion: vi.fn(),
};

const themeServiceMock = {
  toggleTheme: vi.fn(),
};

// ── Helper: crea el componente con valores específicos ─────────────────────

async function crearComponente(usuario: unknown, rol: string | null) {
  authServiceMock.obtenerUsuario.mockReturnValue(usuario);
  authServiceMock.obtenerRol.mockReturnValue(rol);

  await TestBed.configureTestingModule({
    imports: [NavbarComponent],
    providers: [
      provideRouter([]),
      { provide: AuthService, useValue: authServiceMock },
      { provide: ThemeService, useValue: themeServiceMock },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(NavbarComponent);
  const component = fixture.componentInstance;
  const router = TestBed.inject(Router);

  vi.spyOn(router, 'navigate').mockResolvedValue(true);

  fixture.detectChanges();
  return { fixture, component, router };
}

// ── Suite ──────────────────────────────────────────────────────────────────

describe('NavbarComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
  });

  // ── Creación ─────────────────────────────────────────────────────────────

  it('debería crearse', async () => {
    const { component } = await crearComponente({ username: 'carlos' }, 'ADMINISTRADOR');
    expect(component).toBeTruthy();
  });

  // ── iniciales() ───────────────────────────────────────────────────────────

  describe('iniciales()', () => {
    it('debería retornar las primeras 2 letras del username en mayúsculas', async () => {
      const { component } = await crearComponente({ username: 'carlos' }, 'ADMINISTRADOR');
      expect(component.iniciales()).toBe('CA');
    });

    it('debería retornar vacío si no hay usuario', async () => {
      const { component } = await crearComponente(null, 'ADMINISTRADOR');
      expect(component.iniciales()).toBe('');
    });

    it('debería manejar username de 1 letra', async () => {
      const { component } = await crearComponente({ username: 'a' }, 'ADMINISTRADOR');
      expect(component.iniciales()).toBe('A');
    });
  });

  // ── rol() ─────────────────────────────────────────────────────────────────

  describe('rol()', () => {
    it('debería retornar el rol del authService', async () => {
      const { component } = await crearComponente({ username: 'carlos' }, 'ADMINISTRADOR');
      expect(component.rol()).toBe('ADMINISTRADOR');
    });

    it('debería retornar cadena vacía si el rol es null', async () => {
      const { component } = await crearComponente({ username: 'carlos' }, null);
      expect(component.rol()).toBe('');
    });
  });

  // ── toggleTheme() ─────────────────────────────────────────────────────────

  describe('toggleTheme()', () => {
    it('debería llamar a themeService.toggleTheme()', async () => {
      const { component } = await crearComponente({ username: 'carlos' }, 'ADMINISTRADOR');
      component.toggleTheme();
      expect(themeServiceMock.toggleTheme).toHaveBeenCalled();
    });
  });

  // ── cerrarSesion() ────────────────────────────────────────────────────────

  describe('cerrarSesion()', () => {
    it('debería llamar a authService.cerrarSesion()', async () => {
      const { component } = await crearComponente({ username: 'carlos' }, 'ADMINISTRADOR');
      component.cerrarSesion();
      expect(authServiceMock.cerrarSesion).toHaveBeenCalled();
    });

    it('debería navegar a /login', async () => {
      const { component, router } = await crearComponente({ username: 'carlos' }, 'ADMINISTRADOR');
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      component.cerrarSesion();
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });
  });
});
