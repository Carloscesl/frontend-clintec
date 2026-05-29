import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { GerenteDashboardComponent } from './gerente-dashboard.component';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { AuthService } from '../../../../core/services/auth.service';
import { GerenteDashboard } from '../../../../core/models/dashboard.model';

// ── Datos de prueba ────────────────────────────────────────────────────────

const gerenteDashboardMock: GerenteDashboard = {
  totalClientes: 15,
  totalVentas: 8,
  oportunidadesActivas: 12,
  oportunidadesGanadas: 6,
  oportunidadesPerdidas: 2,
  valorOportunidadesGanadas: 75000,
  enProspeccion: 4,
  enCalificacion: 3,
  enPropuesta: 2,
  enNegociacion: 2,
  enCierreGanado: 1,
  enCierrePerdido: 1,
};

// ── Mocks de servicios ─────────────────────────────────────────────────────

const dashboardServiceMock = { getGerente: vi.fn() };
const authServiceMock = { obtenerUsuario: vi.fn().mockReturnValue({ nombre: 'Gerente Test' }) };

// ── Suite ──────────────────────────────────────────────────────────────────

describe('GerenteDashboardComponent', () => {
  let component: GerenteDashboardComponent;
  let fixture: ComponentFixture<GerenteDashboardComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();

    dashboardServiceMock.getGerente.mockReturnValue(of(gerenteDashboardMock));

    await TestBed.configureTestingModule({
      imports: [GerenteDashboardComponent],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GerenteDashboardComponent);
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
    expect(component.usuario).toEqual({ nombre: 'Gerente Test' });
  });

  // ── Carga exitosa ──────────────────────────────────────────────────────────

  describe('cargar() — éxito', () => {
    it('debería llamar a getGerente', () => {
      fixture.detectChanges();
      expect(dashboardServiceMock.getGerente).toHaveBeenCalled();
    });

    it('debería setear los datos correctamente', () => {
      fixture.detectChanges();
      expect(component.data()).toEqual(gerenteDashboardMock);
    });

    it('debería poner loading en false', () => {
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
      dashboardServiceMock.getGerente.mockReturnValue(throwError(() => new Error('Error de red')));
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
      dashboardServiceMock.getGerente.mockReturnValueOnce(throwError(() => new Error('fallo')));
      fixture.detectChanges();
      expect(component.error()).toBeTruthy();

      dashboardServiceMock.getGerente.mockReturnValue(of(gerenteDashboardMock));
      component.cargar();
      expect(component.error()).toBeNull();
      expect(component.data()).toEqual(gerenteDashboardMock);
    });
  });

  // ── dibujarGraficas ────────────────────────────────────────────────────────

  describe('dibujarGraficas()', () => {
    it('no debería lanzar error si data() es null', () => {
      expect(() => component.dibujarGraficas()).not.toThrow();
    });

    it('debería ejecutarse sin error con data disponible', () => {
      fixture.detectChanges();
      expect(() => component.dibujarGraficas()).not.toThrow();
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
