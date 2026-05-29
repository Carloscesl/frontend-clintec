import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MainAlertsComponent } from './main-alerts.component';
import { AlertaService } from '../../../../core/services/alerta.service';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CalificacionService } from '../../../../core/services/calificacion.service';
import { AlertaResponse, TipoAlerta } from '../../../../core/models/alerta.model';
import { ClienteResponse } from '../../../../core/models/cliente.model';
import { UsuarioResponse } from '../../../../core/models/usuario.model';
import { QualificationClient } from '../../../../core/models/calificacion.model';

// ── Datos de prueba ────────────────────────────────────────────────────────

const alertaMock: AlertaResponse = {
  id: 1,
  clienteId: 10,
  usuarioId: 20,
  descripcion: 'Alerta de prueba',
  tipo: 'SEGUIMIENTO',
  estado: 'PENDIENTE',
  fechaVencimiento: '2024-02-01T00:00:00',
  fecha: '2024-01-15T10:00:00',
  fechaActualizacion: '2024-01-15T10:00:00',
};

const clienteMock = { id: 10, nombreCliente: 'Empresa Test' } as ClienteResponse;
const usuarioMock = { id: 20, nombre: 'Juan Asesor' } as UsuarioResponse;
const calificacionMock: QualificationClient = {
  id: 1,
  clienteId: 10,
  puntaje: 80,
  clasificacion: 'VIP',
  ultimaActualizacion: '2024-01-15T10:00:00',
};

// ── Mocks de servicios ─────────────────────────────────────────────────────

const alertaServiceMock = {
  listar: vi.fn(),
  porUsuario: vi.fn(),
  marcarVista: vi.fn(),
  resolver: vi.fn(),
};
const usuarioServiceMock = { listar: vi.fn() };
const clienteServiceMock = { listar: vi.fn() };
const calificacionServiceMock = { findAll: vi.fn() };
const authServiceMock = {
  obtenerRol: vi.fn(),
  obtenerUsuarioId: vi.fn(),
  obtenerUsuario: vi.fn(),
};

// ── Helper ─────────────────────────────────────────────────────────────────
// Setea mocks exitosos POR DEFECTO. Los tests que necesiten error
// sobrescriben el mock DESPUÉS de setup() y ANTES de detectChanges()
// (o directamente en el it si setup() ya llama detectChanges).
//
// IMPORTANTE: setup() llama fixture.detectChanges() internamente,
// así que para tests de error en ngOnInit hay que sobrescribir
// el mock ANTES de llamar a setup() pero también llamar
// TestBed.resetTestingModule() al inicio para no contaminar.

async function buildModule(rol: string, usuarioId: number | null) {
  TestBed.resetTestingModule();

  authServiceMock.obtenerRol.mockReturnValue(rol);
  authServiceMock.obtenerUsuarioId.mockReturnValue(usuarioId);
  authServiceMock.obtenerUsuario.mockReturnValue({ username: 'asesor_test' });

  await TestBed.configureTestingModule({
    imports: [MainAlertsComponent],
    providers: [
      { provide: AlertaService, useValue: alertaServiceMock },
      { provide: UsuarioService, useValue: usuarioServiceMock },
      { provide: ClienteService, useValue: clienteServiceMock },
      { provide: AuthService, useValue: authServiceMock },
      { provide: CalificacionService, useValue: calificacionServiceMock },
    ],
    schemas: [NO_ERRORS_SCHEMA],
  }).compileComponents();

  const fixture = TestBed.createComponent(MainAlertsComponent);
  const component = fixture.componentInstance;
  return { fixture, component };
}

// setup() con defaults exitosos + detectChanges
async function setup(rol = 'ADMINISTRADOR', usuarioId: number | null = null) {
  // Defaults — sobreescribir antes de llamar a setup() para tests de error
  alertaServiceMock.listar.mockReturnValue(of([alertaMock]));
  alertaServiceMock.porUsuario.mockReturnValue(of([alertaMock]));
  alertaServiceMock.marcarVista.mockReturnValue(of(null));
  alertaServiceMock.resolver.mockReturnValue(of(null));
  clienteServiceMock.listar.mockReturnValue(of([clienteMock]));
  usuarioServiceMock.listar.mockReturnValue(of([usuarioMock]));
  calificacionServiceMock.findAll.mockReturnValue(of([calificacionMock]));

  const { fixture, component } = await buildModule(rol, usuarioId);
  fixture.detectChanges();
  return { fixture, component };
}

// ── Suite ──────────────────────────────────────────────────────────────────

describe('MainAlertsComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Creación ───────────────────────────────────────────────────────────────

  it('debería crearse', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  // ── Estado inicial ─────────────────────────────────────────────────────────

  it('debería iniciar sin error', async () => {
    const { component } = await setup();
    expect(component.error()).toBeNull();
  });

  it('debería iniciar con loading en false tras carga exitosa', async () => {
    const { component } = await setup();
    expect(component.loading()).toBe(false);
  });

  // ── ngOnInit — roles ───────────────────────────────────────────────────────

  describe('ngOnInit — según rol', () => {
    it('debería llamar a alertaService.listar() cuando el rol es ADMINISTRADOR', async () => {
      await setup('ADMINISTRADOR');
      expect(alertaServiceMock.listar).toHaveBeenCalled();
      expect(alertaServiceMock.porUsuario).not.toHaveBeenCalled();
    });

    it('debería llamar a alertaService.porUsuario() cuando el rol es ASESOR', async () => {
      await setup('ASESOR', 5);
      expect(alertaServiceMock.porUsuario).toHaveBeenCalledWith(5);
      expect(alertaServiceMock.listar).not.toHaveBeenCalled();
    });

    it('debería llamar a cargarUsuarios() solo si el rol es ADMINISTRADOR', async () => {
      await setup('ADMINISTRADOR');
      expect(usuarioServiceMock.listar).toHaveBeenCalled();
    });

    it('NO debería llamar a cargarUsuarios() si el rol es ASESOR', async () => {
      await setup('ASESOR', 5);
      expect(usuarioServiceMock.listar).not.toHaveBeenCalled();
    });

    it('debería cargar clientes y calificaciones independientemente del rol', async () => {
      await setup('ASESOR', 5);
      expect(clienteServiceMock.listar).toHaveBeenCalled();
      expect(calificacionServiceMock.findAll).toHaveBeenCalled();
    });
  });

  // ── cargarAlertas ──────────────────────────────────────────────────────────

  describe('cargarAlertas()', () => {
    it('debería poner loading en false tras carga exitosa', async () => {
      const { component } = await setup();
      expect(component.loading()).toBe(false);
    });

    it('debería ordenar alertas de más reciente a más antigua', async () => {
      // Sobrescribir mock ANTES de setup() para que detectChanges() use estos datos
      alertaServiceMock.listar.mockReturnValue(
        of([
          { ...alertaMock, id: 1, fecha: '2024-01-01T00:00:00' },
          { ...alertaMock, id: 2, fecha: '2024-03-01T00:00:00' },
          { ...alertaMock, id: 3, fecha: '2024-02-01T00:00:00' },
        ]),
      );
      clienteServiceMock.listar.mockReturnValue(of([clienteMock]));
      usuarioServiceMock.listar.mockReturnValue(of([usuarioMock]));
      calificacionServiceMock.findAll.mockReturnValue(of([calificacionMock]));

      const { fixture, component } = await buildModule('ADMINISTRADOR', null);
      fixture.detectChanges();

      expect(component.alertas().map((a) => a.id)).toEqual([2, 3, 1]);
    });

    it('debería setear el mensaje de error cuando listar falla', async () => {
      // Error mock ANTES de buildModule + detectChanges
      alertaServiceMock.listar.mockReturnValue(throwError(() => new Error('Error de red')));
      clienteServiceMock.listar.mockReturnValue(of([clienteMock]));
      usuarioServiceMock.listar.mockReturnValue(of([usuarioMock]));
      calificacionServiceMock.findAll.mockReturnValue(of([calificacionMock]));

      const { fixture, component } = await buildModule('ADMINISTRADOR', null);
      fixture.detectChanges();

      expect(component.error()).toBe('Error al cargar alertas');
      expect(component.loading()).toBe(false);
    });

    it('debería limpiar el error antes de recargar', async () => {
      const { component } = await setup();
      component.error.set('Error anterior');
      alertaServiceMock.listar.mockReturnValue(of([]));
      component.cargarAlertas();
      expect(component.error()).toBeNull();
    });
  });

  // ── cargarUsuarios ─────────────────────────────────────────────────────────

  describe('cargarUsuarios()', () => {
    it('debería setear la lista de usuarios', async () => {
      const { component } = await setup('ADMINISTRADOR');
      expect(component.usuarios().length).toBe(1);
      expect(component.usuarios()[0].nombre).toBe('Juan Asesor');
    });

    it('debería setear error cuando el servicio falla', async () => {
      usuarioServiceMock.listar.mockReturnValue(throwError(() => new Error()));
      alertaServiceMock.listar.mockReturnValue(of([alertaMock]));
      clienteServiceMock.listar.mockReturnValue(of([clienteMock]));
      calificacionServiceMock.findAll.mockReturnValue(of([calificacionMock]));

      const { fixture, component } = await buildModule('ADMINISTRADOR', null);
      fixture.detectChanges();

      expect(component.error()).toBe('Error al cargar usuarios');
    });
  });

  // ── cargarClientes ─────────────────────────────────────────────────────────

  describe('cargarClientes()', () => {
    it('debería setear la lista de clientes', async () => {
      const { component } = await setup();
      expect(component.clientes().length).toBe(1);
      expect(component.clientes()[0].nombreCliente).toBe('Empresa Test');
    });

    it('debería setear error cuando el servicio falla', async () => {
      clienteServiceMock.listar.mockReturnValue(throwError(() => new Error()));
      alertaServiceMock.listar.mockReturnValue(of([alertaMock]));
      usuarioServiceMock.listar.mockReturnValue(of([usuarioMock]));
      calificacionServiceMock.findAll.mockReturnValue(of([calificacionMock]));

      const { fixture, component } = await buildModule('ADMINISTRADOR', null);
      fixture.detectChanges();

      expect(component.error()).toBe('Error al cargar clientes');
    });
  });

  // ── cargarCalificaciones ───────────────────────────────────────────────────

  describe('cargarCalificaciones()', () => {
    it('debería construir el mapa de calificaciones indexado por clienteId', async () => {
      const { component } = await setup();
      expect(component.getCalificacion(10)?.clasificacion).toBe('VIP');
    });

    it('debería retornar undefined para un clienteId sin calificación', async () => {
      const { component } = await setup();
      expect(component.getCalificacion(999)).toBeUndefined();
    });
  });

  // ── getClienteNombre ───────────────────────────────────────────────────────

  describe('getClienteNombre()', () => {
    it('debería retornar el nombre cuando el cliente existe', async () => {
      const { component } = await setup();
      expect(component.getClienteNombre(10)).toBe('Empresa Test');
    });

    it('debería retornar "Desconocido" cuando el cliente no existe', async () => {
      const { component } = await setup();
      expect(component.getClienteNombre(999)).toBe('Desconocido');
    });
  });

  // ── getUsuarioNombre ───────────────────────────────────────────────────────

  describe('getUsuarioNombre() — ADMINISTRADOR', () => {
    it('debería retornar el nombre del usuario cuando existe', async () => {
      const { component } = await setup('ADMINISTRADOR');
      expect(component.getUsuarioNombre(20)).toBe('Juan Asesor');
    });

    it('debería retornar "Asesor Asignado" cuando el usuario no existe', async () => {
      const { component } = await setup('ADMINISTRADOR');
      expect(component.getUsuarioNombre(999)).toBe('Asesor Asignado');
    });
  });

  describe('getUsuarioNombre() — ASESOR', () => {
    it('debería retornar el username del usuario logueado', async () => {
      const { component } = await setup('ASESOR', 5);
      expect(component.getUsuarioNombre(20)).toBe('asesor_test');
    });
  });

  // ── alertasFiltradas (computed) ────────────────────────────────────────────

  describe('alertasFiltradas (computed)', () => {
    let component: MainAlertsComponent;

    beforeEach(async () => {
      alertaServiceMock.listar.mockReturnValue(
        of([
          { ...alertaMock, id: 1, tipo: 'INACTIVIDAD', estado: 'PENDIENTE' },
          { ...alertaMock, id: 2, tipo: 'VENCIMIENTO', estado: 'VISTA' },
          { ...alertaMock, id: 3, tipo: 'INACTIVIDAD', estado: 'RESUELTA' },
        ]),
      );
      clienteServiceMock.listar.mockReturnValue(of([clienteMock]));
      usuarioServiceMock.listar.mockReturnValue(of([usuarioMock]));
      calificacionServiceMock.findAll.mockReturnValue(of([calificacionMock]));

      const result = await buildModule('ADMINISTRADOR', null);
      result.fixture.detectChanges();
      component = result.component;
    });

    it('debería retornar todas las alertas cuando los filtros están en TODOS', () => {
      expect(component.alertasFiltradas().length).toBe(3);
    });

    it('debería filtrar por tipo correctamente', () => {
      component.filtroTipo.set('INACTIVIDAD');
      expect(component.alertasFiltradas().length).toBe(2);
      expect(component.alertasFiltradas().every((a) => a.tipo === 'INACTIVIDAD')).toBe(true);
    });

    it('debería filtrar por estado correctamente', () => {
      component.filtroEstado.set('VISTA');
      expect(component.alertasFiltradas().length).toBe(1);
      expect(component.alertasFiltradas()[0].estado).toBe('VISTA');
    });

    it('debería combinar filtro de tipo y estado', () => {
      component.filtroTipo.set('INACTIVIDAD');
      component.filtroEstado.set('RESUELTA');
      expect(component.alertasFiltradas().length).toBe(1);
      expect(component.alertasFiltradas()[0].id).toBe(3);
    });

    it('debería retornar vacío si no hay coincidencias', () => {
      component.filtroTipo.set('OPORTUNIDAD');
      component.filtroEstado.set('VENCIDA');
      expect(component.alertasFiltradas().length).toBe(0);
    });
  });

  // ── marcarVista ────────────────────────────────────────────────────────────

  describe('marcarVista()', () => {
    it('debería llamar a alertaService.marcarVista con el id correcto', async () => {
      const { component } = await setup();
      component.marcarVista(1);
      expect(alertaServiceMock.marcarVista).toHaveBeenCalledWith(1);
    });

    it('debería recargar las alertas tras marcar como vista', async () => {
      const { component } = await setup();
      component.marcarVista(1);
      // 1 llamada en ngOnInit + 1 al recargar
      expect(alertaServiceMock.listar).toHaveBeenCalledTimes(2);
    });

    it('debería setear error cuando el servicio falla', async () => {
      const { component } = await setup();
      alertaServiceMock.marcarVista.mockReturnValue(throwError(() => new Error()));
      component.marcarVista(1);
      expect(component.error()).toBe('Error al marcar alerta como vista');
    });
  });

  // ── resolver ───────────────────────────────────────────────────────────────

  describe('resolver()', () => {
    it('debería llamar a alertaService.resolver con el id correcto', async () => {
      const { component } = await setup();
      component.resolver(1);
      expect(alertaServiceMock.resolver).toHaveBeenCalledWith(1);
    });

    it('debería recargar las alertas tras resolver', async () => {
      const { component } = await setup();
      component.resolver(1);
      expect(alertaServiceMock.listar).toHaveBeenCalledTimes(2);
    });

    it('debería setear error cuando el servicio falla', async () => {
      const { component } = await setup();
      alertaServiceMock.resolver.mockReturnValue(throwError(() => new Error()));
      component.resolver(1);
      expect(component.error()).toBe('Error al resolver alerta');
    });
  });

  // ── modal ──────────────────────────────────────────────────────────────────

  describe('irADetalle() y cerrarModal()', () => {
    it('debería abrir el modal y setear alertaSeleccionada', async () => {
      const { component } = await setup();
      component.irADetalle(42);
      expect(component.modalAbierto()).toBe(true);
      expect(component.alertaSeleccionada()).toBe(42);
    });

    it('debería cerrar el modal y limpiar alertaSeleccionada', async () => {
      const { component } = await setup();
      component.irADetalle(42);
      component.cerrarModal();
      expect(component.modalAbierto()).toBe(false);
      expect(component.alertaSeleccionada()).toBeNull();
    });
  });

  // ── getTipoConfig ──────────────────────────────────────────────────────────

  describe('getTipoConfig()', () => {
    const casos: { tipo: TipoAlerta; icon: string; color: string; bg: string }[] = [
      { tipo: 'INACTIVIDAD', icon: '⏳', color: '#856404', bg: '#fff3cd' },
      { tipo: 'VENCIMIENTO', icon: '⚠️', color: '#721c24', bg: '#f8d7da' },
      { tipo: 'SEGUIMIENTO', icon: '🔍', color: '#0c5460', bg: '#d1ecf1' },
      { tipo: 'OPORTUNIDAD', icon: '💡', color: '#155724', bg: '#d4edda' },
    ];

    casos.forEach(({ tipo, icon, color, bg }) => {
      it(`debería retornar la config correcta para ${tipo}`, async () => {
        const { component } = await setup();
        const cfg = component.getTipoConfig(tipo);
        expect(cfg.icon).toBe(icon);
        expect(cfg.color).toBe(color);
        expect(cfg.bg).toBe(bg);
      });
    });
  });

  // ── esAsesor ───────────────────────────────────────────────────────────────

  describe('esAsesor', () => {
    it('debería ser true cuando el rol es ASESOR', async () => {
      const { component } = await setup('ASESOR', 5);
      expect(component.esAsesor).toBe(true);
    });

    it('debería ser false cuando el rol es ADMINISTRADOR', async () => {
      const { component } = await setup('ADMINISTRADOR');
      expect(component.esAsesor).toBe(false);
    });
  });

  // ── metadata de filtros ────────────────────────────────────────────────────

  describe('metadata de filtros', () => {
    it('debería incluir la opción TODOS en tipos', async () => {
      const { component } = await setup();
      expect(component.tipos.some((t) => t.valor === 'TODOS')).toBe(true);
    });

    it('debería incluir los 4 tipos de alerta', async () => {
      const { component } = await setup();
      const valores = component.tipos.map((t) => t.valor).filter((v) => v !== 'TODOS');
      expect(valores).toEqual(
        expect.arrayContaining(['INACTIVIDAD', 'VENCIMIENTO', 'SEGUIMIENTO', 'OPORTUNIDAD']),
      );
    });

    it('debería incluir los 4 estados más TODOS en la lista de estados', async () => {
      const { component } = await setup();
      expect(component.estados.length).toBe(5);
    });
  });
});
