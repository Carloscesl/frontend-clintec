import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { AsesorDashboardComponent } from './asesor-dashboard.component';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AsesorDashboard } from '../../../../core/models/dashboard.model';
import { QualificationPriorityPanelComponent } from '../../../qualifications/pages/qualification-priority-panel/qualification-priority-panel.component';

// ── Stub del panel de prioridad ────────────────────────────────────────────

@Component({ selector: 'app-qualification-priority-panel', standalone: true, template: '' })
class QualificationPriorityPanelStub {}

// ── Datos de prueba ────────────────────────────────────────────────────────

const asesorDashboardMock: AsesorDashboard = {
  misOportunidades: 10,
  misOportunidadesActivas: 6,
  misOportunidadesGanadas: 3,
  misOportunidadesPerdidas: 1,
  miValorGanado: 25000,
  misAlertasPendientes: 2,
  enProspeccion: 3,
  enCalificacion: 2,
  enPropuesta: 2,
  enNegociacion: 1,
  enCierreGanado: 1,
  enCierrePerdido: 1,
};

// ── Mocks de servicios ─────────────────────────────────────────────────────

const dashboardServiceMock = { getAsesor: vi.fn() };
const authServiceMock = { obtenerUsuario: vi.fn().mockReturnValue({ nombre: 'Asesor Test' }) };

// ── Suite ──────────────────────────────────────────────────────────────────

describe('AsesorDashboardComponent', () => {
  let component: AsesorDashboardComponent;
  let fixture: ComponentFixture<AsesorDashboardComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();

    dashboardServiceMock.getAsesor.mockReturnValue(of(asesorDashboardMock));

    await TestBed.configureTestingModule({
      imports: [AsesorDashboardComponent],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    })
      .overrideComponent(AsesorDashboardComponent, {
        remove: { imports: [QualificationPriorityPanelComponent] },
        add: { imports: [QualificationPriorityPanelStub] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AsesorDashboardComponent);
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
    expect(component.usuario).toEqual({ nombre: 'Asesor Test' });
  });

  // ── Carga exitosa ──────────────────────────────────────────────────────────

  describe('cargar() — éxito', () => {
    it('debería llamar a getAsesor', () => {
      fixture.detectChanges();
      expect(dashboardServiceMock.getAsesor).toHaveBeenCalled();
    });

    it('debería setear los datos correctamente', () => {
      fixture.detectChanges();
      expect(component.data()).toEqual(asesorDashboardMock);
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
      dashboardServiceMock.getAsesor.mockReturnValue(throwError(() => new Error('Error de red')));
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
