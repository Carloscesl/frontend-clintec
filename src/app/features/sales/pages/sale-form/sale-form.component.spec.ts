import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { SaleFormComponent } from './sale-form.component';
import { VentaService } from '../../../../core/services/venta.service';
import { OportunidadService } from '../../../../core/services/oportunidad.service';
import { AuthService } from '../../../../core/services/auth.service';
import { VentaResponse } from '../../../../core/models/venta.model';
import { OportunidadResponse } from '../../../../core/models/oportunidad.model';

// ── Datos de prueba ────────────────────────────────────────────────────────

const oportunidadMock: OportunidadResponse = {
  idOportunidad: 20,
  valorEstimado: 8000,
  estado: 'GANADA',
} as any;

const ventaCreada: VentaResponse = {
  idVenta: 99,
  idOportunidad: 20,
  idAsesor: 5,
  valorVenta: 8000,
  paymentMethod: 'EFECTIVO',
  notas: '',
  fechaVenta: '2024-03-01',
  fechaActualizacion: '2024-03-01',
};

// ── Mocks de servicios ─────────────────────────────────────────────────────

const ventaServiceMock = { create: vi.fn() };
const oportunidadServiceMock = { buscarPorId: vi.fn() };
const authServiceMock = { obtenerUsuarioId: vi.fn() };
const routerMock = { navigate: vi.fn() };

const crearActivatedRoute = (oportunidadId: string | null) => ({
  snapshot: { queryParamMap: { get: vi.fn().mockReturnValue(oportunidadId) } },
});

// ── Helper ─────────────────────────────────────────────────────────────────

const configurar = async (oportunidadId: string | null = '20') => {
  TestBed.resetTestingModule();

  authServiceMock.obtenerUsuarioId.mockReturnValue(5);
  // Defaults exitosos — los tests de error los sobrescriben después
  oportunidadServiceMock.buscarPorId.mockReturnValue(of(oportunidadMock));
  ventaServiceMock.create.mockReturnValue(of(ventaCreada));

  await TestBed.configureTestingModule({
    imports: [SaleFormComponent],
    providers: [
      { provide: VentaService, useValue: ventaServiceMock },
      { provide: OportunidadService, useValue: oportunidadServiceMock },
      { provide: AuthService, useValue: authServiceMock },
      { provide: Router, useValue: routerMock },
      { provide: ActivatedRoute, useValue: crearActivatedRoute(oportunidadId) },
    ],
    schemas: [NO_ERRORS_SCHEMA],
  }).compileComponents();

  const fixture = TestBed.createComponent(SaleFormComponent);
  const component = fixture.componentInstance;
  return { fixture, component };
};

// ── Suite ──────────────────────────────────────────────────────────────────

describe('SaleFormComponent', () => {
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

  it('debería iniciar sin guardando', async () => {
    const { component } = await configurar();
    expect(component.guardando()).toBe(false);
  });

  it('debería iniciar sin error', async () => {
    const { component } = await configurar();
    expect(component.error()).toBeNull();
  });

  it('debería iniciar sin loading', async () => {
    const { component } = await configurar();
    expect(component.loading()).toBe(false);
  });

  it('debería exponer los 4 métodos de pago', async () => {
    const { component } = await configurar();
    expect(component.metodos.length).toBe(4);
  });

  it('debería tener el formulario con los controles correctos', async () => {
    const { component } = await configurar();
    expect(component.f['valorVenta']).toBeDefined();
    expect(component.f['paymentMethod']).toBeDefined();
    expect(component.f['notas']).toBeDefined();
  });

  // ── ngOnInit — sin oportunidadId ──────────────────────────────────────────

  describe('ngOnInit() — sin oportunidadId en query params', () => {
    it('debería setear error si no hay oportunidadId', async () => {
      const { fixture, component } = await configurar(null);
      fixture.detectChanges();
      expect(component.error()).toBe('No se especificó una oportunidad');
    });

    it('no debería llamar a buscarPorId si no hay oportunidadId', async () => {
      const { fixture } = await configurar(null);
      fixture.detectChanges();
      expect(oportunidadServiceMock.buscarPorId).not.toHaveBeenCalled();
    });
  });

  // ── cargarOportunidad — éxito ─────────────────────────────────────────────

  describe('cargarOportunidad() — éxito', () => {
    it('debería llamar a buscarPorId con el id correcto', async () => {
      const { fixture } = await configurar('20');
      fixture.detectChanges();
      expect(oportunidadServiceMock.buscarPorId).toHaveBeenCalledWith(20);
    });

    it('debería setear la oportunidad', async () => {
      const { fixture, component } = await configurar();
      fixture.detectChanges();
      expect(component.oportunidad()).toEqual(oportunidadMock);
    });

    it('debería precargar valorEstimado en el formulario', async () => {
      const { fixture, component } = await configurar();
      fixture.detectChanges();
      expect(component.f['valorVenta'].value).toBe(8000);
    });

    it('debería poner loading en false tras cargar', async () => {
      const { fixture, component } = await configurar();
      fixture.detectChanges();
      expect(component.loading()).toBe(false);
    });
  });

  // ── cargarOportunidad — error ─────────────────────────────────────────────
  // El mock de error se sobrescribe DESPUÉS de configurar() y ANTES de detectChanges()

  describe('cargarOportunidad() — error', () => {
    it('debería setear el mensaje de error', async () => {
      const { fixture, component } = await configurar();
      oportunidadServiceMock.buscarPorId.mockReturnValue(throwError(() => new Error('not found')));
      fixture.detectChanges();
      expect(component.error()).toBe('No se encontró la oportunidad');
    });

    it('debería poner loading en false tras el error', async () => {
      const { fixture, component } = await configurar();
      oportunidadServiceMock.buscarPorId.mockReturnValue(throwError(() => new Error('not found')));
      fixture.detectChanges();
      expect(component.loading()).toBe(false);
    });
  });

  // ── submit() — formulario inválido ────────────────────────────────────────

  describe('submit() — formulario inválido', () => {
    it('no debería llamar a create si el formulario es inválido', async () => {
      const { fixture, component } = await configurar();
      fixture.detectChanges();
      component.f['paymentMethod'].setValue('');
      component.f['valorVenta'].setValue(0);
      component.submit();
      expect(ventaServiceMock.create).not.toHaveBeenCalled();
    });

    it('debería marcar todos los controles como touched', async () => {
      const { fixture, component } = await configurar();
      fixture.detectChanges();
      component.f['paymentMethod'].setValue('');
      component.f['valorVenta'].setValue(0);
      component.submit();
      expect(component.f['valorVenta'].touched).toBe(true);
      expect(component.f['paymentMethod'].touched).toBe(true);
    });

    it('no debería llamar a create si no hay oportunidad cargada', async () => {
      const { fixture, component } = await configurar();
      // Simular que la carga de oportunidad falló → oportunidad() queda null
      oportunidadServiceMock.buscarPorId.mockReturnValue(throwError(() => new Error('err')));
      fixture.detectChanges();
      // Aunque el form sea válido, sin oportunidad no debe crear
      component.f['valorVenta'].setValue(5000);
      component.f['paymentMethod'].setValue('EFECTIVO');
      component.submit();
      expect(ventaServiceMock.create).not.toHaveBeenCalled();
    });
  });

  // ── submit() — éxito ──────────────────────────────────────────────────────

  describe('submit() — éxito', () => {
    it('debería llamar a create con los datos del formulario', async () => {
      const { fixture, component } = await configurar();
      fixture.detectChanges();
      component.f['valorVenta'].setValue(9000);
      component.f['paymentMethod'].setValue('EFECTIVO');
      component.f['notas'].setValue('Sin novedades');
      component.submit();
      expect(ventaServiceMock.create).toHaveBeenCalledWith({
        idOportunidad: 20,
        idAsesor: 5,
        valorVenta: 9000,
        paymentMethod: 'EFECTIVO',
        notas: 'Sin novedades',
      });
    });

    it('debería navegar al detalle de la venta creada', async () => {
      const { fixture, component } = await configurar();
      fixture.detectChanges();
      component.f['valorVenta'].setValue(8000);
      component.f['paymentMethod'].setValue('EFECTIVO');
      component.submit();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/sales/detalle', ventaCreada.idVenta]);
    });
  });

  // ── submit() — error ──────────────────────────────────────────────────────
  // El mock de error se sobrescribe DESPUÉS de detectChanges() y ANTES de submit()

  describe('submit() — error', () => {
    it('debería setear el mensaje de error del servidor', async () => {
      const { fixture, component } = await configurar();
      fixture.detectChanges();
      ventaServiceMock.create.mockReturnValue(
        throwError(() => ({ error: { message: 'Venta duplicada' } })),
      );
      component.f['valorVenta'].setValue(8000);
      component.f['paymentMethod'].setValue('EFECTIVO');
      component.submit();
      expect(component.error()).toBe('Venta duplicada');
    });

    it('debería usar mensaje genérico si el error no trae message', async () => {
      const { fixture, component } = await configurar();
      fixture.detectChanges();
      ventaServiceMock.create.mockReturnValue(throwError(() => ({ error: {} })));
      component.f['valorVenta'].setValue(8000);
      component.f['paymentMethod'].setValue('EFECTIVO');
      component.submit();
      expect(component.error()).toBe('Error al registrar la venta');
    });

    it('debería poner guardando en false tras el error', async () => {
      const { fixture, component } = await configurar();
      fixture.detectChanges();
      ventaServiceMock.create.mockReturnValue(throwError(() => ({ error: {} })));
      component.f['valorVenta'].setValue(8000);
      component.f['paymentMethod'].setValue('EFECTIVO');
      component.submit();
      expect(component.guardando()).toBe(false);
    });
  });

  // ── cancelar ─────────────────────────────────────────────────────────────

  describe('cancelar()', () => {
    it('debería navegar a /sales', async () => {
      const { fixture, component } = await configurar();
      fixture.detectChanges();
      component.cancelar();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/sales']);
    });
  });
});
