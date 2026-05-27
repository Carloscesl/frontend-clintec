import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { SaleDetailComponent } from './sale-detail.component';
import { VentaService } from '../../../../core/services/venta.service';
import { OportunidadService } from '../../../../core/services/oportunidad.service';
import { VentaResponse } from '../../../../core/models/venta.model';
import { OportunidadResponse } from '../../../../core/models/oportunidad.model';

// ── Datos de prueba ────────────────────────────────────────────────────────

const ventaMock: VentaResponse = {
  idVenta: 1,
  idOportunidad: 10,
  idAsesor: 5,
  valorVenta: 12000,
  paymentMethod: 'TRANSFERENCIA',
  notas: 'Pago completado',
  fechaVenta: '2024-03-01',
  fechaActualizacion: '2024-03-01',
};

const oportunidadMock: OportunidadResponse = {
  idOportunidad: 10,
  valorEstimado: 10000,
  estado: 'GANADA',
} as any;

// ── Mocks de servicios ─────────────────────────────────────────────────────

const ventaServiceMock = { findId: vi.fn() };
const oportunidadServiceMock = { buscarPorId: vi.fn() };
const routerMock = { navigate: vi.fn() };

const crearActivatedRoute = (id: string | null) => ({
  snapshot: { paramMap: { get: vi.fn().mockReturnValue(id) } },
});

// ── Helper ─────────────────────────────────────────────────────────────────

const configurar = async (idParam: string | null = '1') => {
  TestBed.resetTestingModule();

  // Defaults exitosos
  ventaServiceMock.findId.mockReturnValue(of(ventaMock));
  oportunidadServiceMock.buscarPorId.mockReturnValue(of(oportunidadMock));

  await TestBed.configureTestingModule({
    imports: [SaleDetailComponent],
    providers: [
      { provide: VentaService, useValue: ventaServiceMock },
      { provide: OportunidadService, useValue: oportunidadServiceMock },
      { provide: Router, useValue: routerMock },
      { provide: ActivatedRoute, useValue: crearActivatedRoute(idParam) },
    ],
    schemas: [NO_ERRORS_SCHEMA],
  }).compileComponents();

  const fixture = TestBed.createComponent(SaleDetailComponent);
  const component = fixture.componentInstance;
  return { fixture, component };
};

// ── Suite ──────────────────────────────────────────────────────────────────

describe('SaleDetailComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Creación ───────────────────────────────────────────────────────────────

  it('debería crearse', async () => {
    const { fixture, component } = await configurar();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ── Estado inicial ─────────────────────────────────────────────────────────

  it('debería iniciar con loading en true', async () => {
    const { component } = await configurar();
    expect(component.loading()).toBe(true);
  });

  it('debería iniciar sin error', async () => {
    const { component } = await configurar();
    expect(component.error()).toBeNull();
  });

  it('debería iniciar sin venta', async () => {
    const { component } = await configurar();
    expect(component.venta()).toBeNull();
  });

  it('debería iniciar con diferencia en 0', async () => {
    const { component } = await configurar();
    expect(component.diferencia()).toBe(0);
  });

  // ── cargar() — éxito ───────────────────────────────────────────────────────

  describe('cargar() — éxito', () => {
    it('debería llamar a findId con el id de la ruta', async () => {
      const { fixture } = await configurar('1');
      fixture.detectChanges();
      expect(ventaServiceMock.findId).toHaveBeenCalledWith(1);
    });

    it('debería setear la venta correctamente', async () => {
      const { fixture, component } = await configurar();
      fixture.detectChanges();
      expect(component.venta()).toEqual(ventaMock);
    });

    it('debería poner loading en false', async () => {
      const { fixture, component } = await configurar();
      fixture.detectChanges();
      expect(component.loading()).toBe(false);
    });

    it('debería llamar a cargarOportunidad con el idOportunidad de la venta', async () => {
      const { fixture } = await configurar();
      fixture.detectChanges();
      expect(oportunidadServiceMock.buscarPorId).toHaveBeenCalledWith(ventaMock.idOportunidad);
    });
  });

  // ── cargar() — sin id en ruta ─────────────────────────────────────────────

  describe('cargar() — sin id en ruta', () => {
    it('no debería llamar a findId si no hay id en la ruta', async () => {
      const { fixture } = await configurar(null);
      fixture.detectChanges();
      expect(ventaServiceMock.findId).not.toHaveBeenCalled();
    });
  });

  // ── cargar() — error ───────────────────────────────────────────────────────
  // El mock de error se sobrescribe DESPUÉS de configurar() y ANTES de detectChanges()

  describe('cargar() — error', () => {
    it('debería setear el mensaje de error', async () => {
      const { fixture, component } = await configurar();
      ventaServiceMock.findId.mockReturnValue(throwError(() => new Error('not found')));
      fixture.detectChanges();
      expect(component.error()).toBe('No se encontró la venta');
    });

    it('debería poner loading en false tras el error', async () => {
      const { fixture, component } = await configurar();
      ventaServiceMock.findId.mockReturnValue(throwError(() => new Error('not found')));
      fixture.detectChanges();
      expect(component.loading()).toBe(false);
    });

    it('no debería cargar la oportunidad si falla la venta', async () => {
      const { fixture } = await configurar();
      ventaServiceMock.findId.mockReturnValue(throwError(() => new Error('not found')));
      // Reset buscarPorId para verificar que no se llama
      oportunidadServiceMock.buscarPorId.mockClear();
      fixture.detectChanges();
      expect(oportunidadServiceMock.buscarPorId).not.toHaveBeenCalled();
    });
  });

  // ── cargarOportunidad ─────────────────────────────────────────────────────

  describe('cargarOportunidad()', () => {
    it('debería setear la oportunidad correctamente', async () => {
      const { fixture, component } = await configurar();
      fixture.detectChanges();
      expect(component.oportunidad()).toEqual(oportunidadMock);
    });

    it('debería calcular la diferencia positiva entre valorVenta y valorEstimado', async () => {
      const { fixture, component } = await configurar();
      fixture.detectChanges();
      // 12000 - 10000 = 2000
      expect(component.diferencia()).toBe(2000);
    });

    it('debería calcular diferencia negativa si valorVenta < valorEstimado', async () => {
      const { fixture, component } = await configurar();
      // Sobrescribir ANTES de detectChanges para que el segundo subscribe use este mock
      oportunidadServiceMock.buscarPorId.mockReturnValue(
        of({ ...oportunidadMock, valorEstimado: 15000 }),
      );
      fixture.detectChanges();
      // 12000 - 15000 = -3000
      expect(component.diferencia()).toBe(-3000);
    });
  });

  // ── getMetodoConfig ───────────────────────────────────────────────────────

  describe('getMetodoConfig()', () => {
    it('debería retornar config de EFECTIVO', async () => {
      const { component } = await configurar();
      const cfg = component.getMetodoConfig('EFECTIVO');
      expect(cfg.icon).toBe('💵');
      expect(cfg.color).toBe('#10B981');
    });

    it('debería retornar config de TRANSFERENCIA', async () => {
      const { component } = await configurar();
      expect(component.getMetodoConfig('TRANSFERENCIA').icon).toBe('🏦');
    });

    it('debería retornar config de TARJETA_CREDITO', async () => {
      const { component } = await configurar();
      expect(component.getMetodoConfig('TARJETA_CREDITO').color).toBe('#A855F7');
    });

    it('debería retornar config de TARJETA_DEBITO', async () => {
      const { component } = await configurar();
      expect(component.getMetodoConfig('TARJETA_DEBITO').color).toBe('#06B6D4');
    });
  });

  // ── Navegación ────────────────────────────────────────────────────────────

  describe('volver()', () => {
    it('debería navegar a /sales', async () => {
      const { fixture, component } = await configurar();
      fixture.detectChanges();
      component.volver();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/sales']);
    });
  });
});
