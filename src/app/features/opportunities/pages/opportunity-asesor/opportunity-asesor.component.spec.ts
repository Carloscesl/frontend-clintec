import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { OpportunityAsesorComponent } from './opportunity-asesor.component';
import { OportunidadService } from '../../../../core/services/oportunidad.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CalificacionService } from '../../../../core/services/calificacion.service';
import { Router } from '@angular/router';
import { OportunidadResponse } from '../../../../core/models/oportunidad.model';
import { ClienteResponse } from '../../../../core/models/cliente.model';

// ── Datos de prueba ────────────────────────────────────────────────────────

const oportunidadesMock: OportunidadResponse[] = [
  {
    idOportunidad: 1,
    clienteId: 10,
    asesorId: 5,
    descripcion: 'Op activa en prospeccion',
    valorEstimado: 10000,
    probabilidad: 10,
    etapa: 'PROSPECCION',
    estado: 'ACTIVA',
    esPotencial: false,
    ventaId: null,
    fechaCierreEstimada: '2024-12-31T00:00:00',
    fechaCreacion: '2024-01-01T00:00:00',
    fechaActualizacion: '2024-06-01T00:00:00',
  },
  {
    idOportunidad: 2,
    clienteId: 11,
    asesorId: 5,
    descripcion: 'Op inactiva',
    valorEstimado: 5000,
    probabilidad: 0,
    etapa: 'CIERRE_PERDIDO',
    estado: 'INACTIVA',
    esPotencial: false,
    ventaId: null,
    fechaCierreEstimada: '2024-11-01T00:00:00',
    fechaCreacion: '2024-01-01T00:00:00',
    fechaActualizacion: '2024-05-01T00:00:00',
  },
];

const clientesMock: ClienteResponse[] = [
  { id: 10, nombreCliente: 'Cliente Uno', empresa: 'Empresa Uno' } as ClienteResponse,
];

// ── Mocks de servicios ─────────────────────────────────────────────────────

const oportunidadServiceMock = {
  listarPorAsesor: vi.fn(),
  cambiarEtapa: vi.fn(),
  cerrarGanada: vi.fn(),
  cerrarPerdida: vi.fn(),
};

const clienteServiceMock = { listar: vi.fn() };

const authServiceMock = {
  obtenerUsuario: vi.fn(),
  obtenerUsuarioId: vi.fn(),
};

const calificacionServiceMock = { findAll: vi.fn() };
const routerMock = { navigate: vi.fn() };

// ── Suite ──────────────────────────────────────────────────────────────────

describe('OpportunityAsesorComponent', () => {
  let component: OpportunityAsesorComponent;
  let fixture: ComponentFixture<OpportunityAsesorComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // ✅ Re-mockear TODOS después del clearAllMocks
    authServiceMock.obtenerUsuario.mockReturnValue({ username: 'Asesor Test' });
    authServiceMock.obtenerUsuarioId.mockReturnValue(5);
    oportunidadServiceMock.listarPorAsesor.mockReturnValue(of(oportunidadesMock));
    oportunidadServiceMock.cambiarEtapa.mockReturnValue(of(void 0));
    oportunidadServiceMock.cerrarGanada.mockReturnValue(of(void 0));
    oportunidadServiceMock.cerrarPerdida.mockReturnValue(of(void 0));
    clienteServiceMock.listar.mockReturnValue(of(clientesMock));
    calificacionServiceMock.findAll.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [OpportunityAsesorComponent],
      providers: [
        { provide: OportunidadService, useValue: oportunidadServiceMock },
        { provide: ClienteService, useValue: clienteServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: CalificacionService, useValue: calificacionServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OpportunityAsesorComponent);
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

  it('debería setear el nombre del asesor desde authService', () => {
    fixture.detectChanges();
    expect(component.nombreAsesor()).toBe('Asesor Test');
  });

  // ── cargar() — éxito ───────────────────────────────────────────────────────

  describe('cargar() — éxito', () => {
    it('debería llamar a listarPorAsesor con el id del asesor', () => {
      fixture.detectChanges();
      expect(oportunidadServiceMock.listarPorAsesor).toHaveBeenCalledWith(5);
    });

    it('debería filtrar solo oportunidades ACTIVAS', () => {
      fixture.detectChanges();
      expect(component.oportunidades().every((o) => o.estado === 'ACTIVA')).toBe(true);
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

  // ── cargar() — sin usuario autenticado ────────────────────────────────────

  describe('cargar() — sin usuario autenticado', () => {
    it('debería setear error si obtenerUsuarioId retorna null', () => {
      authServiceMock.obtenerUsuarioId.mockReturnValue(null);
      fixture.detectChanges();
      expect(component.error()).toBe('Usuario no autenticado');
      expect(component.loading()).toBe(false);
    });
  });

  // ── cargar() — error ───────────────────────────────────────────────────────

  describe('cargar() — error', () => {
    beforeEach(() => {
      authServiceMock.obtenerUsuarioId.mockReturnValue(5);
      oportunidadServiceMock.listarPorAsesor.mockReturnValue(
        throwError(() => new Error('Error de red')),
      );
    });

    it('debería setear el mensaje de error', () => {
      fixture.detectChanges();
      expect(component.error()).toBe('Error al cargar oportunidades');
    });

    it('debería poner loading en false tras el error', () => {
      fixture.detectChanges();
      expect(component.loading()).toBe(false);
    });
  });

  // ── reconstruirKanban() ────────────────────────────────────────────────────

  describe('reconstruirKanban()', () => {
    it('debería distribuir oportunidades activas en la columna correcta', () => {
      fixture.detectChanges();
      const colProspeccion = component.columnas.find((c) => c.etapa === 'PROSPECCION');
      expect(colProspeccion?.items).toHaveLength(1);
      expect(colProspeccion?.items[0].idOportunidad).toBe(1);
    });

    it('no debería lanzar error si oportunidades está vacío', () => {
      oportunidadServiceMock.listarPorAsesor.mockReturnValue(of([]));
      fixture.detectChanges();
      expect(() => component.reconstruirKanban()).not.toThrow();
    });
  });

  // ── Helpers ────────────────────────────────────────────────────────────────

  describe('getClienteNombre()', () => {
    it('debería retornar el nombre del cliente si existe', () => {
      fixture.detectChanges();
      expect(component.getClienteNombre(10)).toBe('Cliente Uno');
    });

    it('debería retornar "Cliente" si no existe el id', () => {
      fixture.detectChanges();
      expect(component.getClienteNombre(999)).toBe('Cliente');
    });
  });

  describe('getClienteEmpresa()', () => {
    it('debería retornar la empresa del cliente si existe', () => {
      fixture.detectChanges();
      expect(component.getClienteEmpresa(10)).toBe('Empresa Uno');
    });

    it('debería retornar string vacío si no existe el id', () => {
      fixture.detectChanges();
      expect(component.getClienteEmpresa(999)).toBe('');
    });
  });

  describe('getIniciales()', () => {
    it('debería retornar las iniciales de las dos primeras palabras', () => {
      expect(component.getIniciales('Carlos López')).toBe('CL');
    });

    it('debería retornar una sola inicial si el nombre es una palabra', () => {
      expect(component.getIniciales('Carlos')).toBe('C');
    });
  });

  // ── Navegación ─────────────────────────────────────────────────────────────

  describe('irAeditar()', () => {
    it('debería navegar a /opportunities/editar/:id', () => {
      fixture.detectChanges();
      component.irAeditar(1);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/opportunities/editar', 1]);
    });
  });

  // ── Modal probabilidad ─────────────────────────────────────────────────────

  describe('abrirModalProbabilidad()', () => {
    it('debería setear la oportunidad seleccionada y abrir el modal', () => {
      fixture.detectChanges();
      const op = component.oportunidades()[0];
      const event = { stopPropagation: vi.fn() } as unknown as Event;
      component.abrirModalProbabilidad(op, event);
      expect(component.opSeleccionada()).toEqual(op);
      expect(component.modalAbierto()).toBe(true);
    });
  });

  describe('onProbabilidadGuardada()', () => {
    it('debería actualizar la probabilidad de la oportunidad seleccionada y cerrar el modal', () => {
      fixture.detectChanges();
      const op = component.oportunidades()[0];
      const event = { stopPropagation: vi.fn() } as unknown as Event;
      component.abrirModalProbabilidad(op, event);

      component.onProbabilidadGuardada(75);

      expect(component.modalAbierto()).toBe(false);
      expect(component.opSeleccionada()).toBeNull();
      const opActualizada = component
        .oportunidades()
        .find((o) => o.idOportunidad === op.idOportunidad);
      expect(opActualizada?.probabilidad).toBe(75);
    });
  });

  // ── Modal cierre ───────────────────────────────────────────────────────────

  describe('abrirModalCierre()', () => {
    it('debería setear op, tipoCierre y abrir el modal', () => {
      fixture.detectChanges();
      const op = component.oportunidades()[0];
      component.abrirModalCierre(op, 'CIERRE_GANADO');
      expect(component.opCierre()).toEqual(op);
      expect(component.tipoCierre()).toBe('CIERRE_GANADO');
      expect(component.modalCierreAbierto()).toBe(true);
    });
  });

  describe('cerrarModalCierre()', () => {
    it('debería limpiar op, tipoCierre y cerrar el modal', () => {
      fixture.detectChanges();
      const op = component.oportunidades()[0];
      component.abrirModalCierre(op, 'CIERRE_GANADO');
      component.cerrarModalCierre();
      expect(component.modalCierreAbierto()).toBe(false);
      expect(component.opCierre()).toBeNull();
      expect(component.tipoCierre()).toBeNull();
    });
  });

  describe('onCierreCancelado()', () => {
    it('debería agregar la oportunidad a pendientesCierre y cerrar el modal', () => {
      fixture.detectChanges();
      const op = component.oportunidades()[0];
      component.abrirModalCierre(op, 'CIERRE_GANADO');
      component.onCierreCancelado();
      expect(component.oportunidadesPendientesCierre().has(op.idOportunidad)).toBe(true);
      expect(component.modalCierreAbierto()).toBe(false);
    });

    it('no debería lanzar error si opCierre es null', () => {
      fixture.detectChanges();
      expect(() => component.onCierreCancelado()).not.toThrow();
    });
  });

  describe('onCierreConfirmado() — GANADA', () => {
    beforeEach(() => {
      authServiceMock.obtenerUsuarioId.mockReturnValue(5);
      oportunidadServiceMock.cerrarGanada.mockReturnValue(of(void 0));
      oportunidadServiceMock.listarPorAsesor.mockReturnValue(of(oportunidadesMock));
      fixture.detectChanges();
      const op = component.oportunidades()[0];
      component.abrirModalCierre(op, 'CIERRE_GANADO');
    });

    it('debería llamar a cerrarGanada', () => {
      component.onCierreConfirmado('GANADA');
      expect(oportunidadServiceMock.cerrarGanada).toHaveBeenCalledWith(1);
    });

    it('debería navegar a /sales/registrar con queryParam', () => {
      component.onCierreConfirmado('GANADA');
      expect(routerMock.navigate).toHaveBeenCalledWith(['/sales/registrar'], {
        queryParams: { oportunidadId: 1 },
      });
    });
  });

  describe('onCierreConfirmado() — PERDIDA', () => {
    beforeEach(() => {
      authServiceMock.obtenerUsuarioId.mockReturnValue(5);
      oportunidadServiceMock.cerrarPerdida.mockReturnValue(of(void 0));
      oportunidadServiceMock.listarPorAsesor.mockReturnValue(of(oportunidadesMock));
      fixture.detectChanges();
      const op = component.oportunidades()[0];
      component.abrirModalCierre(op, 'CIERRE_PERDIDO');
    });

    it('debería llamar a cerrarPerdida', () => {
      component.onCierreConfirmado('PERDIDA');
      expect(oportunidadServiceMock.cerrarPerdida).toHaveBeenCalledWith(1);
    });

    it('no debería navegar a /sales/registrar', () => {
      component.onCierreConfirmado('PERDIDA');
      expect(routerMock.navigate).not.toHaveBeenCalledWith(['/sales/registrar'], expect.anything());
    });
  });

  // ── tieneCierrePendiente() ─────────────────────────────────────────────────

  describe('tieneCierrePendiente()', () => {
    it('debería retornar true si está ACTIVA y en CIERRE_GANADO', () => {
      const op = {
        ...oportunidadesMock[0],
        etapa: 'CIERRE_GANADO',
        estado: 'ACTIVA',
      } as OportunidadResponse;
      expect(component.tieneCierrePendiente(op)).toBe(true);
    });

    it('debería retornar false si no está en etapa de cierre', () => {
      expect(component.tieneCierrePendiente(oportunidadesMock[0])).toBe(false);
    });

    it('debería retornar false si no está ACTIVA', () => {
      const op = {
        ...oportunidadesMock[0],
        etapa: 'CIERRE_GANADO',
        estado: 'GANADA',
      } as OportunidadResponse;
      expect(component.tieneCierrePendiente(op)).toBe(false);
    });
  });
});
