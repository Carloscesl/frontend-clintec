import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { AdminDashboardComponent } from './admin-dashboard.component';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CalificacionService } from '../../../../core/services/calificacion.service';
import { AdminDashboard } from '../../../../core/models/dashboard.model';
import { QualificationDistribucion } from '../../../../core/models/calificacion.model';

// ── Datos de prueba ────────────────────────────────────────────────────────

const dashboardMock: AdminDashboard = {
  totalClientes: 8,
  totalUsuarios: 3,
  totalVentas: 12,
  alertasPendientes: 2,
  oportunidadesActivas: 10,
  oportunidadesGanadas: 5,
  oportunidadesPerdidas: 3,
  valorOportunidadesGanadas: 50000,
  enProspeccion: 5,
  enCalificacion: 4,
  enPropuesta: 3,
  enNegociacion: 2,
  enCierreGanado: 1,
  enCierrePerdido: 1,
};

const distribucionMock: QualificationDistribucion = {
  distribucion: { FRIO: 10, TIBIO: 20, CALIENTE: 15, VIP: 5 },
};

// ── Mocks de servicios ─────────────────────────────────────────────────────

const dashboardServiceMock = { getAdmin: vi.fn() };
const authServiceMock = { obtenerUsuario: vi.fn().mockReturnValue({ nombre: 'Admin' }) };
const calificacionServiceMock = { distribucion: vi.fn() };

// ── Suite ──────────────────────────────────────────────────────────────────

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();

    dashboardServiceMock.getAdmin.mockReturnValue(of(dashboardMock));
    calificacionServiceMock.distribucion.mockReturnValue(of(distribucionMock));

    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: CalificacionService, useValue: calificacionServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
  });

  // ── Creación ───────────────────────────────────────────────────────────────

  it('debería crearse', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ── Estado inicial ─────────────────────────────────────────────────────────

  it('debería iniciar con loading en true', () => {
    expect(component.loading()).toBe(true);
  });

  it('debería iniciar sin error', () => {
    expect(component.error()).toBeNull();
  });

  it('debería obtener el usuario del authService', () => {
    fixture.detectChanges();
    expect(authServiceMock.obtenerUsuario).toHaveBeenCalled();
    expect(component.usuario).toEqual({ nombre: 'Admin' });
  });

  // ── Carga exitosa ──────────────────────────────────────────────────────────

  describe('cargar() — éxito', () => {
    it('debería llamar a getAdmin y distribucion', () => {
      fixture.detectChanges();
      expect(dashboardServiceMock.getAdmin).toHaveBeenCalled();
      expect(calificacionServiceMock.distribucion).toHaveBeenCalled();
    });

    it('debería setear los datos correctamente', () => {
      fixture.detectChanges();
      expect(component.data()).toEqual(dashboardMock);
    });

    it('debería poner loading en false tras cargar', () => {
      fixture.detectChanges();
      expect(component.loading()).toBe(false);
    });

    it('no debería tener error tras carga exitosa', () => {
      fixture.detectChanges();
      expect(component.error()).toBeNull();
    });
  });

  // ── Carga con error ────────────────────────────────────────────────────────

  describe('cargar() — error', () => {
    beforeEach(() => {
      dashboardServiceMock.getAdmin.mockReturnValue(throwError(() => new Error('Error de red')));
    });

    it('debería setear el mensaje de error', () => {
      fixture.detectChanges();
      expect(component.error()).toBe('Error al cargar el dashboard');
    });

    it('debería poner loading en false tras el error', () => {
      fixture.detectChanges();
      expect(component.loading()).toBe(false);
    });

    it('no debería tener datos si falló la carga', () => {
      fixture.detectChanges();
      expect(component.data()).toBeNull();
    });
  });

  // ── cargar() llamado manualmente ───────────────────────────────────────────

  describe('cargar() llamado manualmente', () => {
    it('debería resetear error y loading al recargar', () => {
      dashboardServiceMock.getAdmin.mockReturnValueOnce(throwError(() => new Error('fallo')));
      fixture.detectChanges();
      expect(component.error()).toBeTruthy();

      dashboardServiceMock.getAdmin.mockReturnValue(of(dashboardMock));
      component.cargar();
      expect(component.error()).toBeNull();
      expect(component.data()).toEqual(dashboardMock);
    });
  });

  // ── dibujarGraficas ────────────────────────────────────────────────────────

  describe('dibujarGraficas()', () => {
    it('no debería lanzar error si data() es null', () => {
      expect(() => component.dibujarGraficas()).not.toThrow();
    });

    it('debería ejecutarse sin error con data disponible', () => {
      fixture.detectChanges();
      expect(() => component.dibujarGraficas(distribucionMock)).not.toThrow();
    });
  });

  // ── ngOnDestroy ────────────────────────────────────────────────────────────

  describe('ngOnDestroy()', () => {
    it('debería destruir el componente sin error', () => {
      fixture.detectChanges();
      expect(() => fixture.destroy()).not.toThrow();
    });
  });
});
