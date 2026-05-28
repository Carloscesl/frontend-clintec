import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpRequest,
  HttpHandlerFn,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { vi } from 'vitest';

import { authInterceptor } from './auth-interceptor';
import { AuthService } from '../services/auth.service';

// ── Mocks ──────────────────────────────────────────────────────────────────

const authServiceMock = {
  obtenerToken: vi.fn(),
};

// ── Helpers ────────────────────────────────────────────────────────────────

function configurarTestBed(platformId: string = 'browser') {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([authInterceptor])),
      provideHttpClientTesting(),
      { provide: AuthService, useValue: authServiceMock },
      { provide: PLATFORM_ID, useValue: platformId },
    ],
  });
}

// ── Suite ──────────────────────────────────────────────────────────────────

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => vi.clearAllMocks());

  afterEach(() => httpMock?.verify());

  // ── Rutas públicas ────────────────────────────────────────────────────────

  describe('rutas públicas (sin token)', () => {
    beforeEach(() => {
      configurarTestBed();
      httpClient = TestBed.inject(HttpClient);
      httpMock = TestBed.inject(HttpTestingController);
    });

    it('no debería agregar el header Authorization en /auth/login', () => {
      authServiceMock.obtenerToken.mockReturnValue('fake-token');

      httpClient.post('/auth/login', {}).subscribe();

      const req = httpMock.expectOne('/auth/login');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });

    it('no debería agregar el header Authorization en /auth/register', () => {
      authServiceMock.obtenerToken.mockReturnValue('fake-token');

      httpClient.post('/auth/register', {}).subscribe();

      const req = httpMock.expectOne('/auth/register');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });
  });

  // ── Plataforma servidor ───────────────────────────────────────────────────

  describe('plataforma servidor (SSR)', () => {
    beforeEach(() => {
      configurarTestBed('server');
      httpClient = TestBed.inject(HttpClient);
      httpMock = TestBed.inject(HttpTestingController);
    });

    it('no debería agregar el header Authorization cuando se ejecuta en el servidor', () => {
      authServiceMock.obtenerToken.mockReturnValue('fake-token');

      httpClient.get('/api/datos').subscribe();

      const req = httpMock.expectOne('/api/datos');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });
  });

  // ── Con token ─────────────────────────────────────────────────────────────

  describe('con token disponible', () => {
    beforeEach(() => {
      configurarTestBed();
      httpClient = TestBed.inject(HttpClient);
      httpMock = TestBed.inject(HttpTestingController);
    });

    it('debería agregar el header Authorization con el token', () => {
      authServiceMock.obtenerToken.mockReturnValue('fake-token');

      httpClient.get('/api/datos').subscribe();

      const req = httpMock.expectOne('/api/datos');
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
      req.flush({});
    });

    it('no debería mutar la solicitud original', () => {
      authServiceMock.obtenerToken.mockReturnValue('fake-token');

      httpClient.get('/api/datos').subscribe();

      const req = httpMock.expectOne('/api/datos');
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
      req.flush({});
    });

    it('debería agregar el token en solicitudes POST', () => {
      authServiceMock.obtenerToken.mockReturnValue('fake-token');

      httpClient.post('/api/recursos', { nombre: 'test' }).subscribe();

      const req = httpMock.expectOne('/api/recursos');
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
      req.flush({});
    });

    it('debería agregar el token en solicitudes PUT', () => {
      authServiceMock.obtenerToken.mockReturnValue('fake-token');

      httpClient.put('/api/recursos/1', { nombre: 'test' }).subscribe();

      const req = httpMock.expectOne('/api/recursos/1');
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
      req.flush({});
    });

    it('debería agregar el token en solicitudes DELETE', () => {
      authServiceMock.obtenerToken.mockReturnValue('fake-token');

      httpClient.delete('/api/recursos/1').subscribe();

      const req = httpMock.expectOne('/api/recursos/1');
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
      req.flush({});
    });
  });

  // ── Sin token ─────────────────────────────────────────────────────────────

  describe('sin token disponible', () => {
    beforeEach(() => {
      configurarTestBed();
      httpClient = TestBed.inject(HttpClient);
      httpMock = TestBed.inject(HttpTestingController);
    });

    it('no debería agregar el header Authorization si el token es null', () => {
      authServiceMock.obtenerToken.mockReturnValue(null);

      httpClient.get('/api/datos').subscribe();

      const req = httpMock.expectOne('/api/datos');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });

    it('no debería agregar el header Authorization si el token es cadena vacía', () => {
      authServiceMock.obtenerToken.mockReturnValue('');

      httpClient.get('/api/datos').subscribe();

      const req = httpMock.expectOne('/api/datos');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });
  });
});
