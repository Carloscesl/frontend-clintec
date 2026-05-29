import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { vi } from 'vitest';

import { VentaService } from './venta.service';
import { VentaRequest, VentaResponse } from '../models/venta.model';
import { environment } from '../../../environments/environment';

// ── Fixtures ───────────────────────────────────────────────────────────────

const ventaMock: VentaResponse = {
  idVenta: 1,
  idOportunidad: 3,
  idAsesor: 5,
  valorVenta: 75000,
  paymentMethod: 'TRANSFERENCIA',
  notas: 'Venta cerrada con éxito',
  fechaVenta: '2025-06-01',
  fechaActualizacion: '2025-06-01',
};

const ventasMock: VentaResponse[] = [
  ventaMock,
  { ...ventaMock, idVenta: 2, idOportunidad: 4, valorVenta: 50000, paymentMethod: 'EFECTIVO' },
];

const ventaRequestMock: VentaRequest = {
  idOportunidad: 3,
  idAsesor: 5,
  valorVenta: 75000,
  paymentMethod: 'TRANSFERENCIA',
  notas: 'Venta cerrada con éxito',
};

const BASE_URL = `${environment.apiUrl}/venta`;

// ── VentaService ───────────────────────────────────────────────────────────

describe('VentaService', () => {
  let service: VentaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [VentaService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(VentaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── listAll ──────────────────────────────────────────────────────────────

  describe('listAll', () => {
    it('debería realizar un GET a /venta y retornar todas las ventas', () => {
      let resultado: VentaResponse[] | undefined;

      service.listAll().subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(BASE_URL);
      expect(req.request.method).toBe('GET');
      req.flush(ventasMock);

      expect(resultado).toEqual(ventasMock);
    });

    it('debería retornar un arreglo vacío cuando no hay ventas', () => {
      let resultado: VentaResponse[] | undefined;

      service.listAll().subscribe((data) => (resultado = data));

      httpMock.expectOne(BASE_URL).flush([]);

      expect(resultado).toEqual([]);
    });
  });

  // ── findId ───────────────────────────────────────────────────────────────

  describe('findId', () => {
    it('debería realizar un GET a /venta/:id y retornar la venta', () => {
      let resultado: VentaResponse | undefined;

      service.findId(1).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(ventaMock);

      expect(resultado).toEqual(ventaMock);
    });
  });

  // ── findAssessor ─────────────────────────────────────────────────────────

  describe('findAssessor', () => {
    it('debería realizar un GET a /venta/buscarasesor/:id y retornar las ventas del asesor', () => {
      let resultado: VentaResponse[] | undefined;

      service.findAssessor(5).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/buscarasesor/5`);
      expect(req.request.method).toBe('GET');
      req.flush(ventasMock);

      expect(resultado).toEqual(ventasMock);
    });
  });

  // ── findOpportunity ──────────────────────────────────────────────────────

  describe('findOpportunity', () => {
    it('debería realizar un GET a /venta/buscaroportunidad/:id y retornar las ventas de la oportunidad', () => {
      let resultado: VentaResponse[] | undefined;

      service.findOpportunity(3).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/buscaroportunidad/3`);
      expect(req.request.method).toBe('GET');
      req.flush([ventaMock]);

      expect(resultado).toEqual([ventaMock]);
    });
  });

  // ── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    it('debería realizar un POST a /venta con el DTO y retornar la venta creada', () => {
      let resultado: VentaResponse | undefined;

      service.create(ventaRequestMock).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(BASE_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(ventaRequestMock);
      req.flush(ventaMock);

      expect(resultado).toEqual(ventaMock);
    });
  });

  // ── updateSale ───────────────────────────────────────────────────────────

  describe('updateSale', () => {
    it('debería realizar un PUT a /venta/actualizarventa/:id con el DTO y retornar la venta actualizada', () => {
      const ventaActualizada: VentaResponse = { ...ventaMock, valorVenta: 90000 };
      let resultado: VentaResponse | undefined;

      service.updateSale(1, ventaRequestMock).subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/actualizarventa/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(ventaRequestMock);
      req.flush(ventaActualizada);

      expect(resultado).toEqual(ventaActualizada);
    });
  });
});
