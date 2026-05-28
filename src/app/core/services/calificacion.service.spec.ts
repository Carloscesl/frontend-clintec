import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { vi } from 'vitest';

import { CalificacionService } from './calificacion.service';
import {
  QualificationClient,
  QualificationDistribucion,
  QualificationHistory,
  QualificationLevel,
} from '../models/calificacion.model';
import { environment } from '../../../environments/environment';

// ── Fixtures ───────────────────────────────────────────────────────────────

const calificacionMock: QualificationClient = {
  id: 1,
  clienteId: 10,
  puntaje: 80,
  clasificacion: 'VIP',
  ultimaActualizacion: '2025-06-01',
  clienteNombre: 'Juan Pérez',
  clienteEmpresa: 'Empresa SA',
  clienteIniciales: 'JP',
};

const calificacionesMock: QualificationClient[] = [
  calificacionMock,
  { ...calificacionMock, id: 2, clienteId: 11, puntaje: 30, clasificacion: 'TIBIO' },
];

const historialMock: QualificationHistory[] = [
  {
    id: 1,
    clienteId: 10,
    puntajeAnterior: 70,
    puntajeNuevo: 80,
    motivo: 'Compra realizada',
    fecha: '2025-06-01',
  },
];

const distribucionMock: QualificationDistribucion = {
  distribucion: { FRIO: 5, TIBIO: 10, CALIENTE: 8, VIP: 3 },
};

const BASE_URL = `${environment.apiUrl}/calificaciones`;

// ── CalificacionService ────────────────────────────────────────────────────

describe('CalificacionService', () => {
  let service: CalificacionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [CalificacionService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CalificacionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── findAll ──────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('debería realizar un GET a /calificaciones y retornar todas las calificaciones', () => {
      let resultado: QualificationClient[] | undefined;

      service.findAll().subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(BASE_URL);
      expect(req.request.method).toBe('GET');
      req.flush(calificacionesMock);

      expect(resultado).toEqual(calificacionesMock);
    });

    it('debería retornar un arreglo vacío cuando no hay calificaciones', () => {
      let resultado: QualificationClient[] | undefined;

      service.findAll().subscribe((data) => (resultado = data));

      httpMock.expectOne(BASE_URL).flush([]);

      expect(resultado).toEqual([]);
    });
  });

  // ── findByClienteId ──────────────────────────────────────────────────────

  describe('findByClienteId', () => {
    it('debería realizar un GET a /calificaciones/cliente/:clienteId', () => {
      let resultado: QualificationClient | undefined;

      service.findByClienteId(10).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/cliente/10`);
      expect(req.request.method).toBe('GET');
      req.flush(calificacionMock);

      expect(resultado).toEqual(calificacionMock);
    });
  });

  // ── findByClasificacion ──────────────────────────────────────────────────

  describe('findByClasificacion', () => {
    it('debería realizar un GET a /calificaciones/clasificacion/:nivel', () => {
      const nivel: QualificationLevel = 'VIP';
      let resultado: QualificationClient[] | undefined;

      service.findByClasificacion(nivel).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/clasificacion/${nivel}`);
      expect(req.request.method).toBe('GET');
      req.flush([calificacionMock]);

      expect(resultado).toEqual([calificacionMock]);
    });
  });

  // ── findTopN ─────────────────────────────────────────────────────────────

  describe('findTopN', () => {
    it('debería realizar un GET a /calificaciones/top/:n', () => {
      let resultado: QualificationClient[] | undefined;

      service.findTopN(5).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/top/5`);
      expect(req.request.method).toBe('GET');
      req.flush(calificacionesMock);

      expect(resultado).toEqual(calificacionesMock);
    });
  });

  // ── findEnRiesgo ─────────────────────────────────────────────────────────

  describe('findEnRiesgo', () => {
    it('debería realizar un GET a /calificaciones/en-riesgo', () => {
      let resultado: QualificationClient[] | undefined;

      service.findEnRiesgo().subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/en-riesgo`);
      expect(req.request.method).toBe('GET');
      req.flush(calificacionesMock);

      expect(resultado).toEqual(calificacionesMock);
    });
  });

  // ── distribucion ─────────────────────────────────────────────────────────

  describe('distribucion', () => {
    it('debería realizar un GET a /calificaciones/distribucion', () => {
      let resultado: QualificationDistribucion | undefined;

      service.distribucion().subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/distribucion`);
      expect(req.request.method).toBe('GET');
      req.flush(distribucionMock);

      expect(resultado).toEqual(distribucionMock);
    });
  });

  // ── historialPorCliente ──────────────────────────────────────────────────

  describe('historialPorCliente', () => {
    it('debería realizar un GET a /calificaciones/cliente/:clienteId/historial', () => {
      let resultado: QualificationHistory[] | undefined;

      service.historialPorCliente(10).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/cliente/10/historial`);
      expect(req.request.method).toBe('GET');
      req.flush(historialMock);

      expect(resultado).toEqual(historialMock);
    });
  });

  // ── actualizarPuntaje ────────────────────────────────────────────────────

  describe('actualizarPuntaje', () => {
    it('debería realizar un PATCH a /calificaciones/cliente/:clienteId/puntaje con el puntaje', () => {
      const calificacionActualizada: QualificationClient = { ...calificacionMock, puntaje: 95 };
      let resultado: QualificationClient | undefined;

      service.actualizarPuntaje(10, 95).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/cliente/10/puntaje`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ puntaje: 95 });
      req.flush(calificacionActualizada);

      expect(resultado).toEqual(calificacionActualizada);
    });
  });
});
