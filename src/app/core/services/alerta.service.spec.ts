import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { vi } from 'vitest';

import { AlertaService } from './alerta.service';
import { AlertaResponse } from '../models/alerta.model';
import { environment } from '../../../environments/environment';

// ── Fixtures ───────────────────────────────────────────────────────────────

const alertaMock: AlertaResponse = {
  id: 1,
  clienteId: 10,
  usuarioId: 5,
  descripcion: 'Alerta de prueba',
  tipo: 'SEGUIMIENTO',
  estado: 'PENDIENTE',
  fechaVencimiento: '2025-12-31',
  fecha: '2025-01-01',
  fechaActualizacion: '2025-01-02',
};

const alertasMock: AlertaResponse[] = [
  alertaMock,
  { ...alertaMock, id: 2, tipo: 'INACTIVIDAD', estado: 'VISTA' },
];

const BASE_URL = `${environment.apiUrl}/alertas`;

// ── AlertaService ──────────────────────────────────────────────────────────

describe('AlertaService', () => {
  let service: AlertaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [AlertaService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AlertaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── listar ───────────────────────────────────────────────────────────────

  describe('listar', () => {
    it('debería realizar un GET a /alertas y retornar todas las alertas', () => {
      let resultado: AlertaResponse[] | undefined;

      service.listar().subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(BASE_URL);
      expect(req.request.method).toBe('GET');
      req.flush(alertasMock);

      expect(resultado).toEqual(alertasMock);
    });

    it('debería retornar un arreglo vacío cuando no hay alertas', () => {
      let resultado: AlertaResponse[] | undefined;

      service.listar().subscribe((data) => (resultado = data));

      httpMock.expectOne(BASE_URL).flush([]);

      expect(resultado).toEqual([]);
    });
  });

  // ── buscarPorId ──────────────────────────────────────────────────────────

  describe('buscarPorId', () => {
    it('debería realizar un GET a /alertas/id/:id y retornar la alerta', () => {
      let resultado: AlertaResponse | undefined;

      service.buscarPorId(1).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/id/1`);
      expect(req.request.method).toBe('GET');
      req.flush(alertaMock);

      expect(resultado).toEqual(alertaMock);
    });
  });

  // ── pendientes ───────────────────────────────────────────────────────────

  describe('pendientes', () => {
    it('debería realizar un GET a /alertas/pendientes y retornar alertas pendientes', () => {
      const pendientesMock = alertasMock.filter((a) => a.estado === 'PENDIENTE');
      let resultado: AlertaResponse[] | undefined;

      service.pendientes().subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/pendientes`);
      expect(req.request.method).toBe('GET');
      req.flush(pendientesMock);

      expect(resultado).toEqual(pendientesMock);
    });
  });

  // ── porCliente ───────────────────────────────────────────────────────────

  describe('porCliente', () => {
    it('debería realizar un GET a /alertas/cliente/:clienteId', () => {
      let resultado: AlertaResponse[] | undefined;

      service.porCliente(10).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/cliente/10`);
      expect(req.request.method).toBe('GET');
      req.flush(alertasMock);

      expect(resultado).toEqual(alertasMock);
    });
  });

  // ── porUsuario ───────────────────────────────────────────────────────────

  describe('porUsuario', () => {
    it('debería realizar un GET a /alertas/usuario/:usuarioId', () => {
      let resultado: AlertaResponse[] | undefined;

      service.porUsuario(5).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/usuario/5`);
      expect(req.request.method).toBe('GET');
      req.flush(alertasMock);

      expect(resultado).toEqual(alertasMock);
    });
  });

  // ── marcarVista ──────────────────────────────────────────────────────────

  describe('marcarVista', () => {
    it('debería realizar un PATCH a /alertas/:id/vista', () => {
      const alertaVista: AlertaResponse = { ...alertaMock, estado: 'VISTA' };
      let resultado: AlertaResponse | undefined;

      service.marcarVista(1).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/1/vista`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({});
      req.flush(alertaVista);

      expect(resultado).toEqual(alertaVista);
    });
  });

  // ── resolver ─────────────────────────────────────────────────────────────

  describe('resolver', () => {
    it('debería realizar un PATCH a /alertas/:id/resolver', () => {
      const alertaResuelta: AlertaResponse = { ...alertaMock, estado: 'RESUELTA' };
      let resultado: AlertaResponse | undefined;

      service.resolver(1).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/1/resolver`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({});
      req.flush(alertaResuelta);

      expect(resultado).toEqual(alertaResuelta);
    });
  });
});
