import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { vi } from 'vitest';

import { ClienteService } from './cliente.service';
import { ClienteRequest, ClienteResponse } from '../models/cliente.model';
import { environment } from '../../../environments/environment';
import { TestBed } from '@angular/core/testing';

// ── Fixtures ───────────────────────────────────────────────────────────────

const clienteMock: ClienteResponse = {
  id: 1,
  nombreCliente: 'Juan Pérez',
  empresa: 'Empresa SA',
  email: 'juan@empresa.com',
  telefono: '3001234567',
  direccion: 'Calle 123',
  fechaRegistro: '2025-01-01',
};

const clientesMock: ClienteResponse[] = [
  clienteMock,
  { ...clienteMock, id: 2, nombreCliente: 'María López', email: 'maria@empresa.com' },
];

const clienteRequestMock: ClienteRequest = {
  nombreCliente: 'Juan Pérez',
  empresa: 'Empresa SA',
  email: 'juan@empresa.com',
  telefono: '3001234567',
  direccion: 'Calle 123',
};

const BASE_URL = `${environment.apiUrl}/clientes`;

// ── ClienteService ─────────────────────────────────────────────────────────

describe('ClienteService', () => {
  let service: ClienteService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [ClienteService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ClienteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── listar ───────────────────────────────────────────────────────────────

  describe('listar', () => {
    it('debería realizar un GET a /clientes y retornar todos los clientes', () => {
      let resultado: ClienteResponse[] | undefined;

      service.listar().subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(BASE_URL);
      expect(req.request.method).toBe('GET');
      req.flush(clientesMock);

      expect(resultado).toEqual(clientesMock);
    });

    it('debería retornar un arreglo vacío cuando no hay clientes', () => {
      let resultado: ClienteResponse[] | undefined;

      service.listar().subscribe((data) => (resultado = data));

      httpMock.expectOne(BASE_URL).flush([]);

      expect(resultado).toEqual([]);
    });
  });

  // ── buscarPorId ──────────────────────────────────────────────────────────

  describe('buscarPorId', () => {
    it('debería realizar un GET a /clientes/:id y retornar el cliente', () => {
      let resultado: ClienteResponse | undefined;

      service.buscarPorId(1).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(clienteMock);

      expect(resultado).toEqual(clienteMock);
    });
  });

  // ── crear ────────────────────────────────────────────────────────────────

  describe('crear', () => {
    it('debería realizar un POST a /clientes con el DTO y retornar el cliente creado', () => {
      let resultado: ClienteResponse | undefined;

      service.crear(clienteRequestMock).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(BASE_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(clienteRequestMock);
      req.flush(clienteMock);

      expect(resultado).toEqual(clienteMock);
    });
  });

  // ── actualizar ───────────────────────────────────────────────────────────

  describe('actualizar', () => {
    it('debería realizar un PUT a /clientes/:id con el DTO y retornar el cliente actualizado', () => {
      const clienteActualizado: ClienteResponse = {
        ...clienteMock,
        nombreCliente: 'Juan Actualizado',
      };
      let resultado: ClienteResponse | undefined;

      service.actualizar(1, clienteRequestMock).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(clienteRequestMock);
      req.flush(clienteActualizado);

      expect(resultado).toEqual(clienteActualizado);
    });
  });
});
