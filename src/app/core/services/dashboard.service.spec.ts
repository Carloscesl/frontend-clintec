import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { vi } from 'vitest';

import { DashboardService } from './dashboard.service';
import { AdminDashboard, AsesorDashboard, GerenteDashboard } from '../models/dashboard.model';
import { environment } from '../../../environments/environment';

// ── Fixtures ───────────────────────────────────────────────────────────────

const adminDashboardMock: AdminDashboard = {
  totalClientes: 100,
  totalUsuarios: 20,
  totalVentas: 50,
  alertasPendientes: 5,
  oportunidadesActivas: 30,
  oportunidadesGanadas: 15,
  oportunidadesPerdidas: 5,
  valorOportunidadesGanadas: 150000,
  enProspeccion: 10,
  enCalificacion: 8,
  enPropuesta: 6,
  enNegociacion: 4,
  enCierreGanado: 15,
  enCierrePerdido: 5,
};

const gerenteDashboardMock: GerenteDashboard = {
  totalClientes: 100,
  totalVentas: 50,
  oportunidadesActivas: 30,
  oportunidadesGanadas: 15,
  oportunidadesPerdidas: 5,
  valorOportunidadesGanadas: 150000,
  enProspeccion: 10,
  enCalificacion: 8,
  enPropuesta: 6,
  enNegociacion: 4,
  enCierreGanado: 15,
  enCierrePerdido: 5,
};

const asesorDashboardMock: AsesorDashboard = {
  misOportunidades: 20,
  misOportunidadesActivas: 10,
  misOportunidadesGanadas: 8,
  misOportunidadesPerdidas: 2,
  miValorGanado: 80000,
  misAlertasPendientes: 3,
  enProspeccion: 4,
  enCalificacion: 3,
  enPropuesta: 2,
  enNegociacion: 1,
  enCierreGanado: 8,
  enCierrePerdido: 2,
};

const BASE_URL = `${environment.apiUrl}/dashboard`;

// ── DashboardService ───────────────────────────────────────────────────────

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [DashboardService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── getAdmin ─────────────────────────────────────────────────────────────

  describe('getAdmin', () => {
    it('debería realizar un GET a /dashboard/admin y retornar el dashboard de admin', () => {
      let resultado: AdminDashboard | undefined;

      service.getAdmin().subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/admin`);
      expect(req.request.method).toBe('GET');
      req.flush(adminDashboardMock);

      expect(resultado).toEqual(adminDashboardMock);
    });
  });

  // ── getGerente ───────────────────────────────────────────────────────────

  describe('getGerente', () => {
    it('debería realizar un GET a /dashboard/gerente y retornar el dashboard de gerente', () => {
      let resultado: GerenteDashboard | undefined;

      service.getGerente().subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/gerente`);
      expect(req.request.method).toBe('GET');
      req.flush(gerenteDashboardMock);

      expect(resultado).toEqual(gerenteDashboardMock);
    });
  });

  // ── getAsesor ────────────────────────────────────────────────────────────

  describe('getAsesor', () => {
    it('debería realizar un GET a /dashboard/asesor y retornar el dashboard de asesor', () => {
      let resultado: AsesorDashboard | undefined;

      service.getAsesor().subscribe((data) => (resultado = data));

      const req = httpMock.expectOne(`${BASE_URL}/asesor`);
      expect(req.request.method).toBe('GET');
      req.flush(asesorDashboardMock);

      expect(resultado).toEqual(asesorDashboardMock);
    });
  });
});
