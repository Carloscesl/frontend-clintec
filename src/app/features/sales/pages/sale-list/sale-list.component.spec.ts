import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { SaleListComponent } from './sale-list.component';
import { VentaService } from '../../../../core/services/venta.service';
import { OportunidadService } from '../../../../core/services/oportunidad.service';
import { AuthService } from '../../../../core/services/auth.service';
import { VentaResponse } from '../../../../core/models/venta.model';
import { OportunidadResponse } from '../../../../core/models/oportunidad.model';

// ── Datos de prueba ────────────────────────────────────────────────────────

const ventasMock: VentaResponse[] = [
  {
    idVenta: 1,
    idOportunidad: 10,
    idAsesor: 5,
    valorVenta: 5000,
    paymentMethod: 'EFECTIVO',
    notas: '',
    fechaVenta: '2024-03-01',
    fechaActualizacion: '2024-03-01',
  },
  {
    idVenta: 2,
    idOportunidad: 11,
    idAsesor: 5,
    valorVenta: 12000,
    paymentMethod: 'TRANSFERENCIA',
    notas: '',
    fechaVenta: '2024-01-15',
    fechaActualizacion: '2024-01-15',
  },
  {
    idVenta: 3,
    idOportunidad: 12,
    idAsesor: 5,
    valorVenta: 8000,
    paymentMethod: 'EFECTIVO',
    notas: '',
    fechaVenta: '2024-02-10',
    fechaActualizacion: '2024-02-10',
  },
];

const oportunidadesMock: OportunidadResponse[] = [
  { idOportunidad: 20, estado: 'GANADA', ventaId: null, valorEstimado: 9000 } as any,
  { idOportunidad: 21, estado: 'GANADA', ventaId: 1, valorEstimado: 5000 } as any,
  { idOportunidad: 22, estado: 'EN_PROCESO', ventaId: null, valorEstimado: 3000 } as any,
];

// ── Mocks de servicios ─────────────────────────────────────────────────────

const ventaServiceMock = { listAll: vi.fn(), findAssessor: vi.fn() };
const oportunidadServiceMock = { listarPorAsesor: vi.fn() };
const authServiceMock = { obtenerRol: vi.fn(), obtenerUsuarioId: vi.fn() };
const routerMock = { navigate: vi.fn() };

// ── Helper ─────────────────────────────────────────────────────────────────

const configurar = async (rol: string, usuarioId: number | null = null) => {
  // 1. Reset del módulo ANTES de reconfigurarlo
  TestBed.resetTestingModule();

  authServiceMock.obtenerRol.mockReturnValue(rol);
  authServiceMock.obtenerUsuarioId.mockReturnValue(usuarioId);

  // Defaults exitosos — los tests de error los sobrescriben tras configurar()
  ventaServiceMock.listAll.mockReturnValue(of(ventasMock));
  ventaServiceMock.findAssessor.mockReturnValue(of(ventasMock));
  oportunidadServiceMock.listarPorAsesor.mockReturnValue(of(oportunidadesMock));

  await TestBed.configureTestingModule({
    imports: [SaleListComponent],
    providers: [
      { provide: VentaService, useValue: ventaServiceMock },
      { provide: OportunidadService, useValue: oportunidadServiceMock },
      { provide: AuthService, useValue: authServiceMock },
      { provide: Router, useValue: routerMock },
    ],
    schemas: [NO_ERRORS_SCHEMA],
  }).compileComponents();

  const fixture = TestBed.createComponent(SaleListComponent);
  const component = fixture.componentInstance;
  return { fixture, component };
};

// ── Suite ──────────────────────────────────────────────────────────────────

describe('SaleListComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Creación ───────────────────────────────────────────────────────────────

  it('debería crearse', async () => {
    const { fixture, component } = await configurar('GERENTE');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ── Estado inicial ─────────────────────────────────────────────────────────

  it('debería iniciar con loading en true', async () => {
    const { component } = await configurar('GERENTE');
    expect(component.loading()).toBe(true);
  });

  it('debería iniciar sin error', async () => {
    const { component } = await configurar('GERENTE');
    expect(component.error()).toBeNull();
  });

  it('debería iniciar con filtroMetodo en "TODOS"', async () => {
    const { component } = await configurar('GERENTE');
    expect(component.filtroMetodo()).toBe('TODOS');
  });

  it('debería exponer los 5 métodos de pago incluyendo TODOS', async () => {
    const { component } = await configurar('GERENTE');
    expect(component.metodos.length).toBe(5);
    expect(component.metodos[0].valor).toBe('TODOS');
  });

  // ── Rol GERENTE ────────────────────────────────────────────────────────────

  describe('cargar() — rol GERENTE', () => {
    it('debería llamar a listAll (no findAssessor)', async () => {
      const { fixture } = await configurar('GERENTE');
      fixture.detectChanges();
      expect(ventaServiceMock.listAll).toHaveBeenCalled();
      expect(ventaServiceMock.findAssessor).not.toHaveBeenCalled();
    });

    it('debería setear las ventas ordenadas por fecha descendente', async () => {
      const { fixture, component } = await configurar('GERENTE');
      fixture.detectChanges();
      const fechas = component.ventas().map((v) => v.fechaVenta);
      expect(fechas).toEqual([...fechas].sort((a, b) => (a < b ? 1 : -1)));
    });

    it('debería poner loading en false tras la carga', async () => {
      const { fixture, component } = await configurar('GERENTE');
      fixture.detectChanges();
      expect(component.loading()).toBe(false);
    });

    it('no debería cargar oportunidades pendientes para GERENTE', async () => {
      const { fixture } = await configurar('GERENTE');
      fixture.detectChanges();
      expect(oportunidadServiceMock.listarPorAsesor).not.toHaveBeenCalled();
    });
  });

  // ── Rol ASESOR ─────────────────────────────────────────────────────────────

  describe('cargar() — rol ASESOR', () => {
    it('debería llamar a findAssessor con el usuarioId', async () => {
      const { fixture } = await configurar('ASESOR', 5);
      fixture.detectChanges();
      expect(ventaServiceMock.findAssessor).toHaveBeenCalledWith(5);
      expect(ventaServiceMock.listAll).not.toHaveBeenCalled();
    });

    it('debería cargar oportunidades pendientes para ASESOR', async () => {
      const { fixture } = await configurar('ASESOR', 5);
      fixture.detectChanges();
      expect(oportunidadServiceMock.listarPorAsesor).toHaveBeenCalledWith(5);
    });

    it('debería setear solo oportunidades GANADAS sin ventaId', async () => {
      const { fixture, component } = await configurar('ASESOR', 5);
      fixture.detectChanges();
      const pendientes = component.oportunidadesPendientes();
      expect(pendientes.every((o) => o.estado === 'GANADA' && o.ventaId === null)).toBe(true);
    });

    it('debería exponer esAsesor como true', async () => {
      const { component } = await configurar('ASESOR', 5);
      expect(component.esAsesor).toBe(true);
    });
  });

  // ── cargar() — error ───────────────────────────────────────────────────────
  // IMPORTANTE: el mock de error se setea DESPUÉS de configurar() y ANTES de detectChanges()

  describe('cargar() — error', () => {
    it('debería setear el mensaje de error', async () => {
      const { fixture, component } = await configurar('GERENTE');
      // Sobrescribir el mock exitoso con uno de error
      ventaServiceMock.listAll.mockReturnValue(throwError(() => new Error('fallo')));
      fixture.detectChanges();
      expect(component.error()).toBe('Error al cargar ventas');
    });

    it('debería poner loading en false tras el error', async () => {
      const { fixture, component } = await configurar('GERENTE');
      ventaServiceMock.listAll.mockReturnValue(throwError(() => new Error('fallo')));
      fixture.detectChanges();
      expect(component.loading()).toBe(false);
    });
  });

  // ── Computed: ventasFiltradas ──────────────────────────────────────────────

  describe('ventasFiltradas', () => {
    it('debería retornar todas las ventas con filtro TODOS', async () => {
      const { fixture, component } = await configurar('GERENTE');
      fixture.detectChanges();
      expect(component.ventasFiltradas().length).toBe(ventasMock.length);
    });

    it('debería filtrar por EFECTIVO', async () => {
      const { fixture, component } = await configurar('GERENTE');
      fixture.detectChanges();
      component.filtroMetodo.set('EFECTIVO');
      expect(component.ventasFiltradas().every((v) => v.paymentMethod === 'EFECTIVO')).toBe(true);
    });

    it('debería filtrar por TRANSFERENCIA', async () => {
      const { fixture, component } = await configurar('GERENTE');
      fixture.detectChanges();
      component.filtroMetodo.set('TRANSFERENCIA');
      expect(component.ventasFiltradas().length).toBe(1);
    });
  });

  // ── Computed: métricas ────────────────────────────────────────────────────

  describe('métricas computadas', () => {
    it('debería calcular totalVentas correctamente', async () => {
      const { fixture, component } = await configurar('GERENTE');
      fixture.detectChanges();
      expect(component.totalVentas()).toBe(ventasMock.length);
    });

    it('debería calcular valorTotal sumando todas las ventas', async () => {
      const { fixture, component } = await configurar('GERENTE');
      fixture.detectChanges();
      const esperado = ventasMock.reduce((a, v) => a + v.valorVenta, 0);
      expect(component.valorTotal()).toBe(esperado);
    });

    it('debería calcular valorPromedio correctamente', async () => {
      const { fixture, component } = await configurar('GERENTE');
      fixture.detectChanges();
      const total = ventasMock.reduce((a, v) => a + v.valorVenta, 0);
      expect(component.valorPromedio()).toBeCloseTo(total / ventasMock.length);
    });

    it('valorPromedio debería ser 0 si no hay ventas', async () => {
      const { fixture, component } = await configurar('GERENTE');
      // Sobrescribir con lista vacía ANTES de detectChanges
      ventaServiceMock.listAll.mockReturnValue(of([]));
      fixture.detectChanges();
      expect(component.valorPromedio()).toBe(0);
    });

    it('debería calcular ventaMayor correctamente', async () => {
      const { fixture, component } = await configurar('GERENTE');
      fixture.detectChanges();
      expect(component.ventaMayor()).toBe(12000);
    });
  });

  // ── getMetodoConfig ───────────────────────────────────────────────────────

  describe('getMetodoConfig()', () => {
    it('debería retornar config de EFECTIVO', async () => {
      const { component } = await configurar('GERENTE');
      expect(component.getMetodoConfig('EFECTIVO').icon).toBe('💵');
      expect(component.getMetodoConfig('EFECTIVO').color).toBe('#10B981');
    });

    it('debería retornar config de TRANSFERENCIA', async () => {
      const { component } = await configurar('GERENTE');
      expect(component.getMetodoConfig('TRANSFERENCIA').icon).toBe('🏦');
    });

    it('debería retornar config de TARJETA_CREDITO', async () => {
      const { component } = await configurar('GERENTE');
      expect(component.getMetodoConfig('TARJETA_CREDITO').color).toBe('#A855F7');
    });

    it('debería retornar config de TARJETA_DEBITO', async () => {
      const { component } = await configurar('GERENTE');
      expect(component.getMetodoConfig('TARJETA_DEBITO').color).toBe('#06B6D4');
    });
  });

  // ── Navegación ────────────────────────────────────────────────────────────

  describe('navegación', () => {
    it('irADetalle() debería navegar a /sales/detalle/:id', async () => {
      const { fixture, component } = await configurar('GERENTE');
      fixture.detectChanges();
      component.irADetalle(42);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/sales/detalle', 42]);
    });

    it('registrarVenta() debería navegar con queryParam oportunidadId', async () => {
      const { fixture, component } = await configurar('ASESOR', 5);
      fixture.detectChanges();
      const op = oportunidadesMock[0];
      component.registrarVenta(op);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/sales/registrar'], {
        queryParams: { oportunidadId: op.idOportunidad },
      });
    });
  });
});
