import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ThemeService } from './theme.service';

// ── ThemeService ───────────────────────────────────────────────────────────

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    document.body.classList.remove('light-theme');
  });

  function crearServicio(): ThemeService {
    TestBed.configureTestingModule({ providers: [ThemeService] });
    return TestBed.inject(ThemeService);
  }

  // ── constructor ──────────────────────────────────────────────────────────

  describe('constructor', () => {
    it('debería inicializar con el tema "dark" si no hay tema guardado en localStorage', () => {
      service = crearServicio();

      expect(service.getTheme()).toBe('dark');
    });

    it('debería aplicar el tema guardado en localStorage al inicializar', () => {
      localStorage.setItem('theme', 'light');

      service = crearServicio();

      expect(service.getTheme()).toBe('light');
      expect(document.body.classList.contains('light-theme')).toBe(true);
    });

    it('debería aplicar el tema "dark" guardado en localStorage al inicializar', () => {
      localStorage.setItem('theme', 'dark');

      service = crearServicio();

      expect(service.getTheme()).toBe('dark');
      expect(document.body.classList.contains('light-theme')).toBe(false);
    });
  });

  // ── setTheme ─────────────────────────────────────────────────────────────

  describe('setTheme', () => {
    beforeEach(() => {
      service = crearServicio();
    });

    it('debería agregar la clase "light-theme" al body cuando el tema es "light"', () => {
      service.setTheme('light');

      expect(document.body.classList.contains('light-theme')).toBe(true);
    });

    it('debería remover la clase "light-theme" del body cuando el tema es "dark"', () => {
      document.body.classList.add('light-theme');

      service.setTheme('dark');

      expect(document.body.classList.contains('light-theme')).toBe(false);
    });

    it('debería guardar el tema en localStorage', () => {
      service.setTheme('light');

      expect(localStorage.getItem('theme')).toBe('light');
    });

    it('debería actualizar el tema interno al valor recibido', () => {
      service.setTheme('light');

      expect(service.getTheme()).toBe('light');
    });
  });

  // ── toggleTheme ──────────────────────────────────────────────────────────

  describe('toggleTheme', () => {
    beforeEach(() => {
      service = crearServicio();
    });

    it('debería cambiar de "dark" a "light" al hacer toggle', () => {
      expect(service.getTheme()).toBe('dark');

      service.toggleTheme();

      expect(service.getTheme()).toBe('light');
    });

    it('debería cambiar de "light" a "dark" al hacer toggle', () => {
      service.setTheme('light');

      service.toggleTheme();

      expect(service.getTheme()).toBe('dark');
    });

    it('debería agregar la clase "light-theme" al body al cambiar de dark a light', () => {
      service.toggleTheme();

      expect(document.body.classList.contains('light-theme')).toBe(true);
    });

    it('debería remover la clase "light-theme" del body al cambiar de light a dark', () => {
      service.setTheme('light');

      service.toggleTheme();

      expect(document.body.classList.contains('light-theme')).toBe(false);
    });
  });

  // ── getTheme ─────────────────────────────────────────────────────────────

  describe('getTheme', () => {
    beforeEach(() => {
      service = crearServicio();
    });

    it('debería retornar el tema actual', () => {
      expect(service.getTheme()).toBe('dark');
    });

    it('debería retornar el tema actualizado tras llamar a setTheme', () => {
      service.setTheme('light');

      expect(service.getTheme()).toBe('light');
    });
  });
});
