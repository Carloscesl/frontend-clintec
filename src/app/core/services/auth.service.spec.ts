import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { AuthService } from './auth.service';
import { LoginRequest, RegisterRequest, TokenResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';

// ── Fixtures ───────────────────────────────────────────────────────────────

const URL = `${environment.apiUrl}/auth`;

const tokenResponseMock: TokenResponse = {
  id: 1,
  token: 'fake-jwt-token',
  roles: ['ROLE_ADMINISTRADOR'],
  username: 'Usuario Test',
  email: 'test@test.com',
};

const loginRequestMock: LoginRequest = {
  email: 'test@test.com',
  password: 'password123',
};

const registerRequestMock: RegisterRequest = {
  nombreUser: 'Usuario Test',
  email: 'test@test.com',
  password: 'password123',
};

// ── Suite ──────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // ── login ─────────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('debería hacer POST a /auth/login y retornar el token', () => {
      service.login(loginRequestMock).subscribe((res) => {
        expect(res).toEqual(tokenResponseMock);
      });

      const req = httpMock.expectOne(`${URL}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginRequestMock);
      req.flush(tokenResponseMock);
    });
  });

  // ── register ──────────────────────────────────────────────────────────────

  describe('register()', () => {
    it('debería hacer POST a /auth/register y retornar el token', () => {
      service.register(registerRequestMock).subscribe((res) => {
        expect(res).toEqual(tokenResponseMock);
      });

      const req = httpMock.expectOne(`${URL}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerRequestMock);
      req.flush(tokenResponseMock);
    });
  });

  // ── guardarSesion ─────────────────────────────────────────────────────────

  describe('guardarSesion()', () => {
    it('debería guardar el token en localStorage', () => {
      service.guardarSesion(tokenResponseMock);
      expect(localStorage.getItem('clintec_token')).toBe('fake-jwt-token');
    });

    it('debería guardar el usuario completo en localStorage', () => {
      service.guardarSesion(tokenResponseMock);
      expect(localStorage.getItem('clintec_user')).toBe(JSON.stringify(tokenResponseMock));
    });
  });

  // ── obtenerToken ──────────────────────────────────────────────────────────

  describe('obtenerToken()', () => {
    it('debería retornar el token si existe en localStorage', () => {
      localStorage.setItem('clintec_token', 'fake-jwt-token');
      expect(service.obtenerToken()).toBe('fake-jwt-token');
    });

    it('debería retornar null si no hay token en localStorage', () => {
      expect(service.obtenerToken()).toBeNull();
    });
  });

  // ── obtenerUsuario ────────────────────────────────────────────────────────

  describe('obtenerUsuario()', () => {
    it('debería retornar el usuario parseado desde localStorage', () => {
      localStorage.setItem('clintec_user', JSON.stringify(tokenResponseMock));
      expect(service.obtenerUsuario()).toEqual(tokenResponseMock);
    });

    it('debería retornar null si no hay usuario en localStorage', () => {
      expect(service.obtenerUsuario()).toBeNull();
    });
  });

  // ── obtenerUsuarioId ──────────────────────────────────────────────────────

  describe('obtenerUsuarioId()', () => {
    it('debería retornar el id del usuario si está en sesión', () => {
      localStorage.setItem('clintec_user', JSON.stringify(tokenResponseMock));
      expect(service.obtenerUsuarioId()).toBe(1);
    });

    it('debería retornar null si no hay usuario en sesión', () => {
      expect(service.obtenerUsuarioId()).toBeNull();
    });
  });

  // ── obtenerRol ────────────────────────────────────────────────────────────

  describe('obtenerRol()', () => {
    it('debería retornar el primer rol del usuario', () => {
      localStorage.setItem('clintec_user', JSON.stringify(tokenResponseMock));
      expect(service.obtenerRol()).toBe('ROLE_ADMINISTRADOR');
    });

    it('debería retornar null si no hay usuario en sesión', () => {
      expect(service.obtenerRol()).toBeNull();
    });

    it('debería retornar null si el usuario no tiene roles', () => {
      const sinRoles = { ...tokenResponseMock, roles: [] };
      localStorage.setItem('clintec_user', JSON.stringify(sinRoles));
      expect(service.obtenerRol()).toBeNull();
    });
  });

  // ── estaAutenticado ───────────────────────────────────────────────────────

  describe('estaAutenticado()', () => {
    it('debería retornar true si hay token en localStorage', () => {
      localStorage.setItem('clintec_token', 'fake-jwt-token');
      expect(service.estaAutenticado()).toBe(true);
    });

    it('debería retornar false si no hay token en localStorage', () => {
      expect(service.estaAutenticado()).toBe(false);
    });
  });

  // ── cerrarSesion ──────────────────────────────────────────────────────────

  describe('cerrarSesion()', () => {
    it('debería eliminar el token de localStorage', () => {
      localStorage.setItem('clintec_token', 'fake-jwt-token');
      service.cerrarSesion();
      expect(localStorage.getItem('clintec_token')).toBeNull();
    });

    it('debería eliminar el usuario de localStorage', () => {
      localStorage.setItem('clintec_user', JSON.stringify(tokenResponseMock));
      service.cerrarSesion();
      expect(localStorage.getItem('clintec_user')).toBeNull();
    });

    it('debería dejar estaAutenticado en false tras cerrar sesión', () => {
      localStorage.setItem('clintec_token', 'fake-jwt-token');
      service.cerrarSesion();
      expect(service.estaAutenticado()).toBe(false);
    });
  });
});
