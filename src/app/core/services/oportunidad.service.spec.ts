import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { vi } from 'vitest';

import { OportunidadService } from './oportunidad.service';
import {
  EtapaOportunidad,
  OportunidadRequest,
  OportunidadResponse,
} from '../models/oportunidad.model';
import { environment } from '../../../environments/environment';

// ── Fixtures ───────────────────────────────────────────────────────────────

const oportunidadMock: OportunidadResponse = {
  idOportunidad: 1,
  clienteId: 10,
  asesorId: 5,
  descripcion: 'Oportunidad de prueba',
  valorEstimado: 50000,
  probabilidad: 75,
  etapa: 'NEGOCIACION',
  estado: 'ACTIVA',
  esPotencial: true,
  ventaId: null,
  fechaCierreEstimada: '2025-12-31',
  fechaCreacion: '2025-01-01',
  fechaActualizacion: '2025-06-01',
};

const oportunidadesMock: OportunidadResponse[] = [
  oportunidadMock,
  { ...oportunidadMock, idOportunidad: 2, etapa: 'PROPUESTA', probabilidad: 50 },
];

const oportunidadRequestMock: OportunidadRequest = {
  clienteId: 10,
  asesorId: 5,
  descripcion: 'Oportunidad de prueba',
  valorEstimado: 50000,
  fechaCierreEstimada: '2025-12-31',
};

const BASE_URL = `${environment.apiUrl}/oportunidades`;

// ── OportunidadService ─────────────────────────────────────────────────────

describe('OportunidadService', () => {
  let service: OportunidadService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [OportunidadService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(OportunidadService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── listar ───────────────────────────────────────────────────────────────

  describe('listar', () => {
    it('debería realizar un GET a /oportunidades y retornar todas las oportunidades', () => {
      let resultado: OportunidadResponse[] | undefined;

      service.listar().subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(BASE_URL);
      expect(req.request.method).toBe('GET');
      req.flush(oportunidadesMock);

      expect(resultado).toEqual(oportunidadesMock);
    });

    it('debería retornar un arreglo vacío cuando no hay oportunidades', () => {
      let resultado: OportunidadResponse[] | undefined;

      service.listar().subscribe((data) => (resultado = data));

      httpMock.expectOne(BASE_URL).flush([]);

      expect(resultado).toEqual([]);
    });
  });

  // ── listarPorAsesor ──────────────────────────────────────────────────────

  describe('listarPorAsesor', () => {
    it('debería realizar un GET a /oportunidades/idasesor/:idAsesor', () => {
      let resultado: OportunidadResponse[] | undefined;

      service.listarPorAsesor(5).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/idasesor/5`);
      expect(req.request.method).toBe('GET');
      req.flush(oportunidadesMock);

      expect(resultado).toEqual(oportunidadesMock);
    });
  });

  // ── buscarPorId ──────────────────────────────────────────────────────────

  describe('buscarPorId', () => {
    it('debería realizar un GET a /oportunidades/id/:id y retornar la oportunidad', () => {
      let resultado: OportunidadResponse | undefined;

      service.buscarPorId(1).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/id/1`);
      expect(req.request.method).toBe('GET');
      req.flush(oportunidadMock);

      expect(resultado).toEqual(oportunidadMock);
    });
  });

  // ── buscarPorAsesor ──────────────────────────────────────────────────────

  describe('buscarPorAsesor', () => {
    it('debería realizar un GET a /oportunidades/idasesor/:id', () => {
      let resultado: OportunidadResponse[] | undefined;

      service.buscarPorAsesor(5).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/idasesor/5`);
      expect(req.request.method).toBe('GET');
      req.flush(oportunidadesMock);

      expect(resultado).toEqual(oportunidadesMock);
    });
  });

  // ── buscarPorCliente ─────────────────────────────────────────────────────

  describe('buscarPorCliente', () => {
    it('debería realizar un GET a /oportunidades/idcliente/:id', () => {
      let resultado: OportunidadResponse[] | undefined;

      service.buscarPorCliente(10).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/idcliente/10`);
      expect(req.request.method).toBe('GET');
      req.flush(oportunidadesMock);

      expect(resultado).toEqual(oportunidadesMock);
    });
  });

  // ── crear ────────────────────────────────────────────────────────────────

  describe('crear', () => {
    it('debería realizar un POST a /oportunidades con el DTO y retornar la oportunidad creada', () => {
      let resultado: OportunidadResponse | undefined;

      service.crear(oportunidadRequestMock).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(BASE_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(oportunidadRequestMock);
      req.flush(oportunidadMock);

      expect(resultado).toEqual(oportunidadMock);
    });
  });

  // ── actualizar ───────────────────────────────────────────────────────────

  describe('actualizar', () => {
    it('debería realizar un PUT a /oportunidades/:id con el DTO y retornar la oportunidad actualizada', () => {
      const oportunidadActualizada: OportunidadResponse = {
        ...oportunidadMock,
        descripcion: 'Actualizada',
      };
      let resultado: OportunidadResponse | undefined;

      service.actualizar(1, oportunidadRequestMock).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(oportunidadRequestMock);
      req.flush(oportunidadActualizada);

      expect(resultado).toEqual(oportunidadActualizada);
    });
  });

  // ── cambiarEtapa ─────────────────────────────────────────────────────────

  describe('cambiarEtapa', () => {
    it('debería realizar un PATCH a /oportunidades/:id/etapa con la etapa como query param', () => {
      const etapa: EtapaOportunidad = 'CIERRE_GANADO';

      service.cambiarEtapa(1, etapa).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/1/etapa?etapa=${etapa}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({});
      req.flush({});
    });
  });

  // ── ajustarProbabilidad ──────────────────────────────────────────────────

  describe('ajustarProbabilidad', () => {
    it('debería realizar un PATCH a /oportunidades/:id/probabilidad con la probabilidad como query param', () => {
      const oportunidadActualizada: OportunidadResponse = { ...oportunidadMock, probabilidad: 90 };
      let resultado: OportunidadResponse | undefined;

      service.ajustarProbabilidad(1, 90).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/1/probabilidad?probabilidad=90`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({});
      req.flush(oportunidadActualizada);

      expect(resultado).toEqual(oportunidadActualizada);
    });
  });

  // ── cerrarGanada ─────────────────────────────────────────────────────────

  describe('cerrarGanada', () => {
    it('debería realizar un PATCH a /oportunidades/:id/ganar', () => {
      service.cerrarGanada(1).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/1/ganar`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({});
      req.flush(null);
    });
  });

  // ── cerrarPerdida ────────────────────────────────────────────────────────

  describe('cerrarPerdida', () => {
    it('debería realizar un PATCH a /oportunidades/:id/perder', () => {
      service.cerrarPerdida(1).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/1/perder`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({});
      req.flush(null);
    });
  });
});
