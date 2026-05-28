import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { vi } from 'vitest';

import { InteraccionService } from './interaccion.service';
import { InteraccionRequest, InteraccionResponse } from '../models/interaccion.model';
import { environment } from '../../../environments/environment';

// ── Fixtures ───────────────────────────────────────────────────────────────

const interaccionMock: InteraccionResponse = {
  id: 1,
  clienteId: 10,
  usuarioId: 5,
  oportunidadId: 3,
  tipo: 'LLAMADA',
  nota: 'Llamada de seguimiento',
  fecha: '2025-06-01',
  fechaActualizacion: '2025-06-01',
};

const interaccionesMock: InteraccionResponse[] = [
  interaccionMock,
  { ...interaccionMock, id: 2, tipo: 'EMAIL', nota: 'Envío de propuesta' },
];

const interaccionRequestMock: InteraccionRequest = {
  clienteId: 10,
  usuarioId: 5,
  oportunidadId: 3,
  tipo: 'LLAMADA',
  nota: 'Llamada de seguimiento',
};

const BASE_URL = `${environment.apiUrl}/interacciones`;

// ── InteraccionService ─────────────────────────────────────────────────────

describe('InteraccionService', () => {
  let service: InteraccionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [InteraccionService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(InteraccionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── listar ───────────────────────────────────────────────────────────────

  describe('listar', () => {
    it('debería realizar un GET a /interacciones y retornar todas las interacciones', () => {
      let resultado: InteraccionResponse[] | undefined;

      service.listar().subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(BASE_URL);
      expect(req.request.method).toBe('GET');
      req.flush(interaccionesMock);

      expect(resultado).toEqual(interaccionesMock);
    });

    it('debería retornar un arreglo vacío cuando no hay interacciones', () => {
      let resultado: InteraccionResponse[] | undefined;

      service.listar().subscribe((data) => (resultado = data));

      httpMock.expectOne(BASE_URL).flush([]);

      expect(resultado).toEqual([]);
    });
  });

  // ── buscarPorId ──────────────────────────────────────────────────────────

  describe('buscarPorId', () => {
    it('debería realizar un GET a /interacciones/:id y retornar la interacción', () => {
      let resultado: InteraccionResponse | undefined;

      service.buscarPorId(1).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(interaccionMock);

      expect(resultado).toEqual(interaccionMock);
    });
  });

  // ── listarPorCliente ─────────────────────────────────────────────────────

  describe('listarPorCliente', () => {
    it('debería realizar un GET a /interacciones/cliente/:idCliente', () => {
      let resultado: InteraccionResponse[] | undefined;

      service.listarPorCliente(10).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/cliente/10`);
      expect(req.request.method).toBe('GET');
      req.flush(interaccionesMock);

      expect(resultado).toEqual(interaccionesMock);
    });
  });

  // ── listarPorUsuario ─────────────────────────────────────────────────────

  describe('listarPorUsuario', () => {
    it('debería realizar un GET a /interacciones/usuario/:idUsuario', () => {
      let resultado: InteraccionResponse[] | undefined;

      service.listarPorUsuario(5).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/usuario/5`);
      expect(req.request.method).toBe('GET');
      req.flush(interaccionesMock);

      expect(resultado).toEqual(interaccionesMock);
    });
  });

  // ── listarPorOportunidad ─────────────────────────────────────────────────

  describe('listarPorOportunidad', () => {
    it('debería realizar un GET a /interacciones/oportunidad/:idOportunidad', () => {
      let resultado: InteraccionResponse[] | undefined;

      service.listarPorOportunidad(3).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/oportunidad/3`);
      expect(req.request.method).toBe('GET');
      req.flush(interaccionesMock);

      expect(resultado).toEqual(interaccionesMock);
    });
  });

  // ── crear ────────────────────────────────────────────────────────────────

  describe('crear', () => {
    it('debería realizar un POST a /interacciones con el DTO y retornar la interacción creada', () => {
      let resultado: InteraccionResponse | undefined;

      service.crear(interaccionRequestMock).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(BASE_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(interaccionRequestMock);
      req.flush(interaccionMock);

      expect(resultado).toEqual(interaccionMock);
    });
  });

  // ── actualizar ───────────────────────────────────────────────────────────

  describe('actualizar', () => {
    it('debería realizar un PUT a /interacciones/:id con el DTO y retornar la interacción actualizada', () => {
      const interaccionActualizada: InteraccionResponse = {
        ...interaccionMock,
        nota: 'Nota actualizada',
      };
      let resultado: InteraccionResponse | undefined;

      service.actualizar(1, interaccionRequestMock).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(interaccionRequestMock);
      req.flush(interaccionActualizada);

      expect(resultado).toEqual(interaccionActualizada);
    });
  });
});
