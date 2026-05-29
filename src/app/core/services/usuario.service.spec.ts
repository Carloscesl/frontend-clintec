import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { vi } from 'vitest';

import { UsuarioService } from './usuario.service';
import {
  Rol,
  UsuarioRequest,
  UsuarioResponse,
  UsuarioUpdateRequest,
} from '../models/usuario.model';
import { environment } from '../../../environments/environment';

// ── Fixtures ───────────────────────────────────────────────────────────────

const usuarioMock: UsuarioResponse = {
  id: 1,
  nombre: 'Juan Pérez',
  email: 'juan@empresa.com',
  rol: 'ASESOR',
  activo: true,
  fechaCreacion: '2025-01-01',
};

const usuariosMock: UsuarioResponse[] = [
  usuarioMock,
  { ...usuarioMock, id: 2, nombre: 'María López', email: 'maria@empresa.com', rol: 'GERENTE' },
];

const usuarioRequestMock: UsuarioRequest = {
  nombre: 'Juan Pérez',
  email: 'juan@empresa.com',
  password: 'secreto123',
  rol: 'ASESOR',
};

const usuarioUpdateRequestMock: UsuarioUpdateRequest = {
  nombre: 'Juan Actualizado',
  email: 'juan@empresa.com',
  rol: 'ASESOR',
};

const BASE_URL = `${environment.apiUrl}/usuarios`;

// ── UsuarioService ─────────────────────────────────────────────────────────

describe('UsuarioService', () => {
  let service: UsuarioService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [UsuarioService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UsuarioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── listar ───────────────────────────────────────────────────────────────

  describe('listar', () => {
    it('debería realizar un GET a /usuarios y retornar todos los usuarios', () => {
      let resultado: UsuarioResponse[] | undefined;

      service.listar().subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(BASE_URL);
      expect(req.request.method).toBe('GET');
      req.flush(usuariosMock);

      expect(resultado).toEqual(usuariosMock);
    });

    it('debería retornar un arreglo vacío cuando no hay usuarios', () => {
      let resultado: UsuarioResponse[] | undefined;

      service.listar().subscribe((data) => (resultado = data));

      httpMock.expectOne(BASE_URL).flush([]);

      expect(resultado).toEqual([]);
    });
  });

  // ── listarPorRol ─────────────────────────────────────────────────────────

  describe('listarPorRol', () => {
    it('debería realizar un GET a /usuarios/filtrar con el rol como query param', () => {
      const rol: Rol = 'ASESOR';
      let resultado: UsuarioResponse[] | undefined;

      service.listarPorRol(rol).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/filtrar?rol=${rol}`);
      expect(req.request.method).toBe('GET');
      req.flush([usuarioMock]);

      expect(resultado).toEqual([usuarioMock]);
    });
  });

  // ── buscarPorId ──────────────────────────────────────────────────────────

  describe('buscarPorId', () => {
    it('debería realizar un GET a /usuarios/id/:id y retornar el usuario', () => {
      let resultado: UsuarioResponse | undefined;

      service.buscarPorId(1).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/id/1`);
      expect(req.request.method).toBe('GET');
      req.flush(usuarioMock);

      expect(resultado).toEqual(usuarioMock);
    });
  });

  // ── buscarPorEmail ───────────────────────────────────────────────────────

  describe('buscarPorEmail', () => {
    it('debería realizar un GET a /usuarios/email/:email y retornar el usuario', () => {
      let resultado: UsuarioResponse | undefined;

      service.buscarPorEmail('juan@empresa.com').subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/email/juan@empresa.com`);
      expect(req.request.method).toBe('GET');
      req.flush(usuarioMock);

      expect(resultado).toEqual(usuarioMock);
    });
  });

  // ── crear ────────────────────────────────────────────────────────────────

  describe('crear', () => {
    it('debería realizar un POST a /usuarios con el DTO y retornar el usuario creado', () => {
      let resultado: UsuarioResponse | undefined;

      service.crear(usuarioRequestMock).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(BASE_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(usuarioRequestMock);
      req.flush(usuarioMock);

      expect(resultado).toEqual(usuarioMock);
    });
  });

  // ── actualizar ───────────────────────────────────────────────────────────

  describe('actualizar', () => {
    it('debería realizar un PUT a /usuarios/:id con el DTO y retornar el usuario actualizado', () => {
      const usuarioActualizado: UsuarioResponse = { ...usuarioMock, nombre: 'Juan Actualizado' };
      let resultado: UsuarioResponse | undefined;

      service.actualizar(1, usuarioUpdateRequestMock).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(usuarioUpdateRequestMock);
      req.flush(usuarioActualizado);

      expect(resultado).toEqual(usuarioActualizado);
    });
  });

  // ── activar ──────────────────────────────────────────────────────────────

  describe('activar', () => {
    it('debería realizar un PATCH a /usuarios/:email/activar', () => {
      service.activar('juan@empresa.com').subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/juan@empresa.com/activar`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({});
      req.flush(null);
    });
  });

  // ── desactivar ───────────────────────────────────────────────────────────

  describe('desactivar', () => {
    it('debería realizar un PATCH a /usuarios/:email/desactivar', () => {
      service.desactivar('juan@empresa.com').subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/juan@empresa.com/desactivar`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({});
      req.flush(null);
    });
  });

  // ── totalUsuarios ────────────────────────────────────────────────────────

  describe('totalUsuarios', () => {
    it('debería realizar un GET a /usuarios/total y retornar el total', () => {
      let resultado: number | undefined;

      service.totalUsuarios().subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/total`);
      expect(req.request.method).toBe('GET');
      req.flush(42);

      expect(resultado).toBe(42);
    });
  });

  // ── totalUsuariosAsesores ────────────────────────────────────────────────

  describe('totalUsuariosAsesores', () => {
    it('debería realizar un GET a /usuarios/total-por-rol/:rol y retornar el total', () => {
      const rol: Rol = 'ASESOR';
      let resultado: number | undefined;

      service.totalUsuariosAsesores(rol).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/total-por-rol/${rol}`);
      expect(req.request.method).toBe('GET');
      req.flush(10);

      expect(resultado).toBe(10);
    });
  });
});
