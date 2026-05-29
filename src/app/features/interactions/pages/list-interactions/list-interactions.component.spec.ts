import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { ListInteractionsComponent } from './list-interactions.component';
import { InteraccionService } from '../../../../core/services/interaccion.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { AuthService } from '../../../../core/services/auth.service';
import { InteraccionResponse, TipoInteraccion } from '../../../../core/models/interaccion.model';
import { ClienteResponse } from '../../../../core/models/cliente.model';
import { UsuarioResponse } from '../../../../core/models/usuario.model';

// ── Datos de prueba ────────────────────────────────────────────────────────

const interaccionMock: InteraccionResponse = {
  id: 1,
  clienteId: 10,
  usuarioId: 20,
  oportunidadId: 5,
  tipo: 'LLAMADA',
  nota: 'Nota de prueba',
  fecha: '2024-01-15T10:00:00',
  fechaActualizacion: '2024-01-15T10:00:00',
};

const clienteMock = {
  id: 10,
  nombreCliente: 'Empresa Test',
  empresa: 'Tech S.A.',
} as ClienteResponse;

const usuarioMock = { id: 20, nombre: 'Juan Asesor' } as UsuarioResponse;

// ── Mocks de servicios ─────────────────────────────────────────────────────

const interaccionServiceMock = {
  listar: vi.fn(),
  listarPorUsuario: vi.fn(),
};
const clienteServiceMock = { listar: vi.fn() };
const usuarioServiceMock = { listar: vi.fn() };
const authServiceMock = {
  obtenerRol: vi.fn(),
  obtenerUsuarioId: vi.fn(),
};

// ── Suite ──────────────────────────────────────────────────────────────────

describe('ListInteractionsComponent', () => {
  let component: ListInteractionsComponent;
  let fixture: ComponentFixture<ListInteractionsComponent>;

  // setup recibe opcionalmente interacciones custom para sobreescribir el mock
  async function setup(
    rol = 'ADMINISTRADOR',
    usuarioId: number | null = null,
    interacciones: InteraccionResponse[] = [interaccionMock],
  ) {
    authServiceMock.obtenerRol.mockReturnValue(rol);
    authServiceMock.obtenerUsuarioId.mockReturnValue(usuarioId);
    interaccionServiceMock.listar.mockReturnValue(of(interacciones));
    interaccionServiceMock.listarPorUsuario.mockReturnValue(of(interacciones));
    clienteServiceMock.listar.mockReturnValue(of([clienteMock]));
    usuarioServiceMock.listar.mockReturnValue(of([usuarioMock]));

    await TestBed.configureTestingModule({
      imports: [ListInteractionsComponent],
      providers: [
        { provide: InteraccionService, useValue: interaccionServiceMock },
        { provide: ClienteService, useValue: clienteServiceMock },
        { provide: UsuarioService, useValue: usuarioServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListInteractionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
  });

  // ── Creación ───────────────────────────────────────────────────────────────

  it('debería crearse', async () => {
    await setup();
    expect(component).toBeTruthy();
  });

  // ── Estado inicial ─────────────────────────────────────────────────────────

  it('debería iniciar sin error', async () => {
    await setup();
    expect(component.error()).toBeNull();
  });

  it('debería iniciar con el modal cerrado', async () => {
    await setup();
    expect(component.modalAbierto()).toBe(false);
  });

  it('debería iniciar con el panel de creación cerrado', async () => {
    await setup();
    expect(component.panelCrearAbierto()).toBe(false);
  });

  it('debería iniciar con filtroTipo en TODOS', async () => {
    await setup();
    expect(component.filtroTipo()).toBe('TODOS');
  });

  // ── ngOnInit — roles ───────────────────────────────────────────────────────

  describe('ngOnInit — según rol', () => {
    it('debería llamar a interaccionService.listar() si el rol es ADMINISTRADOR', async () => {
      await setup('ADMINISTRADOR');
      expect(interaccionServiceMock.listar).toHaveBeenCalled();
      expect(interaccionServiceMock.listarPorUsuario).not.toHaveBeenCalled();
    });

    it('debería llamar a interaccionService.listarPorUsuario() si el rol es ASESOR', async () => {
      await setup('ASESOR', 5);
      expect(interaccionServiceMock.listarPorUsuario).toHaveBeenCalledWith(5);
      expect(interaccionServiceMock.listar).not.toHaveBeenCalled();
    });

    it('debería llamar a usuariosService.listar() solo si NO es ASESOR', async () => {
      await setup('ADMINISTRADOR');
      expect(usuarioServiceMock.listar).toHaveBeenCalled();
    });

    it('NO debería llamar a usuariosService.listar() si es ASESOR', async () => {
      await setup('ASESOR', 5);
      expect(usuarioServiceMock.listar).not.toHaveBeenCalled();
    });

    it('debería cargar clientes independientemente del rol', async () => {
      await setup('ASESOR', 5);
      expect(clienteServiceMock.listar).toHaveBeenCalled();
    });
  });

  // ── cargar ─────────────────────────────────────────────────────────────────

  describe('cargar()', () => {
    it('debería poner loading en false tras carga exitosa', async () => {
      await setup();
      expect(component.loading()).toBe(false);
    });

    it('debería ordenar interacciones de más reciente a más antigua', async () => {
      // ✅ pasamos las interacciones directamente al setup para evitar que se sobreescriban
      await setup('ADMINISTRADOR', null, [
        { ...interaccionMock, id: 1, fecha: '2024-01-01T00:00:00' },
        { ...interaccionMock, id: 2, fecha: '2024-03-01T00:00:00' },
        { ...interaccionMock, id: 3, fecha: '2024-02-01T00:00:00' },
      ]);
      expect(component.interacciones().map((i) => i.id)).toEqual([2, 3, 1]);
    });

    it('debería setear error cuando el servicio falla', async () => {
      // ✅ sobreescribir antes del setup
      interaccionServiceMock.listar.mockReturnValue(throwError(() => new Error()));
      authServiceMock.obtenerRol.mockReturnValue('ADMINISTRADOR');
      authServiceMock.obtenerUsuarioId.mockReturnValue(null);
      clienteServiceMock.listar.mockReturnValue(of([clienteMock]));
      usuarioServiceMock.listar.mockReturnValue(of([usuarioMock]));

      await TestBed.configureTestingModule({
        imports: [ListInteractionsComponent],
        providers: [
          { provide: InteraccionService, useValue: interaccionServiceMock },
          { provide: ClienteService, useValue: clienteServiceMock },
          { provide: UsuarioService, useValue: usuarioServiceMock },
          { provide: AuthService, useValue: authServiceMock },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(ListInteractionsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.error()).toBe('Error al cargar interacciones');
      expect(component.loading()).toBe(false);
    });

    it('debería limpiar el error antes de recargar', async () => {
      await setup();
      component.error.set('Error anterior');
      interaccionServiceMock.listar.mockReturnValue(of([]));
      component.cargar();
      expect(component.error()).toBeNull();
    });

    it('debería recargar la lista al llamar cargar() manualmente', async () => {
      await setup();
      interaccionServiceMock.listar.mockReturnValue(of([]));
      component.cargar();
      expect(interaccionServiceMock.listar).toHaveBeenCalledTimes(2);
    });
  });

  // ── cargarClientes ─────────────────────────────────────────────────────────

  describe('cargarClientes()', () => {
    it('debería setear la lista de clientes', async () => {
      await setup();
      expect(component.clientes().length).toBe(1);
    });

    it('debería construir el clienteMap indexado por id', async () => {
      await setup();
      expect(component.clienteMap.get(10)?.nombreCliente).toBe('Empresa Test');
    });
  });

  // ── cargarUsuarios ─────────────────────────────────────────────────────────

  describe('cargarUsuarios()', () => {
    it('debería setear la lista de usuarios', async () => {
      await setup('ADMINISTRADOR');
      expect(component.usuarios().length).toBe(1);
      expect(component.usuarios()[0].nombre).toBe('Juan Asesor');
    });
  });

  // ── getClienteNombre ───────────────────────────────────────────────────────

  describe('getClienteNombre()', () => {
    it('debería retornar el nombre cuando el cliente existe', async () => {
      await setup();
      expect(component.getClienteNombre(10)).toBe('Empresa Test');
    });

    it('debería retornar "Cliente" cuando el id no existe', async () => {
      await setup();
      expect(component.getClienteNombre(999)).toBe('Cliente');
    });
  });

  // ── getClienteEmpresa ──────────────────────────────────────────────────────

  describe('getClienteEmpresa()', () => {
    it('debería retornar la empresa cuando el cliente existe', async () => {
      await setup();
      expect(component.getClienteEmpresa(10)).toBe('Tech S.A.');
    });

    it('debería retornar cadena vacía cuando el id no existe', async () => {
      await setup();
      expect(component.getClienteEmpresa(999)).toBe('');
    });
  });

  // ── getTipoConfig ──────────────────────────────────────────────────────────

  describe('getTipoConfig()', () => {
    beforeEach(async () => {
      await setup();
    });

    const casos: { tipo: TipoInteraccion; icon: string; color: string }[] = [
      { tipo: 'LLAMADA', icon: '📞', color: '#3B82F6' },
      { tipo: 'REUNION', icon: '🤝', color: '#10B981' },
      { tipo: 'EMAIL', icon: '✉️', color: '#A855F7' },
      { tipo: 'VISITA', icon: '🚗', color: '#F59E0B' },
      { tipo: 'WHATSAPP', icon: '💬', color: '#00D4AA' },
      { tipo: 'OTRO', icon: '📌', color: '#94A3B8' },
    ];

    casos.forEach(({ tipo, icon, color }) => {
      it(`debería retornar la config correcta para ${tipo}`, () => {
        const cfg = component.getTipoConfig(tipo);
        expect(cfg.icon).toBe(icon);
        expect(cfg.color).toBe(color);
      });
    });
  });

  // ── interaccionesFiltradas (computed) ──────────────────────────────────────

  describe('interaccionesFiltradas (computed)', () => {
    beforeEach(async () => {
      await setup('ADMINISTRADOR', null, [
        { ...interaccionMock, id: 1, tipo: 'LLAMADA' },
        { ...interaccionMock, id: 2, tipo: 'EMAIL' },
        { ...interaccionMock, id: 3, tipo: 'LLAMADA' },
      ]);
    });

    it('debería retornar todas cuando filtroTipo es TODOS', () => {
      expect(component.interaccionesFiltradas().length).toBe(3);
    });

    it('debería filtrar por tipo correctamente', () => {
      component.filtroTipo.set('LLAMADA');
      expect(component.interaccionesFiltradas().length).toBe(2);
      expect(component.interaccionesFiltradas().every((i) => i.tipo === 'LLAMADA')).toBe(true);
    });

    it('debería retornar vacío si no hay coincidencias', () => {
      component.filtroTipo.set('VISITA');
      expect(component.interaccionesFiltradas().length).toBe(0);
    });
  });

  // ── modal de detalle ───────────────────────────────────────────────────────

  describe('irADetalle() y cerrarModal()', () => {
    beforeEach(async () => {
      await setup();
    });

    it('debería abrir el modal y setear interaccionSeleccionada', () => {
      component.irADetalle(42);
      expect(component.modalAbierto()).toBe(true);
      expect(component.interaccionSeleccionada()).toBe(42);
    });

    it('debería cerrar el modal y limpiar interaccionSeleccionada', () => {
      component.irADetalle(42);
      component.cerrarModal();
      expect(component.modalAbierto()).toBe(false);
      expect(component.interaccionSeleccionada()).toBeNull();
    });
  });

  // ── panel de creación ──────────────────────────────────────────────────────

  describe('irACrear(), cerrarPanelCrear() y onInteraccionCreada()', () => {
    beforeEach(async () => {
      await setup();
    });

    it('debería abrir el panel de creación al llamar irACrear()', () => {
      component.irACrear();
      expect(component.panelCrearAbierto()).toBe(true);
    });

    it('debería cerrar el panel al llamar cerrarPanelCrear()', () => {
      component.irACrear();
      component.cerrarPanelCrear();
      expect(component.panelCrearAbierto()).toBe(false);
    });

    it('debería cerrar el panel y recargar interacciones al llamar onInteraccionCreada()', () => {
      component.irACrear();
      interaccionServiceMock.listar.mockReturnValue(of([]));
      component.onInteraccionCreada();
      expect(component.panelCrearAbierto()).toBe(false);
      expect(interaccionServiceMock.listar).toHaveBeenCalledTimes(2);
    });
  });

  // ── esAsesor ───────────────────────────────────────────────────────────────

  describe('esAsesor', () => {
    it('debería ser true cuando el rol es ASESOR', async () => {
      await setup('ASESOR', 5);
      expect(component.esAsesor).toBe(true);
    });

    it('debería ser false cuando el rol es ADMINISTRADOR', async () => {
      await setup('ADMINISTRADOR');
      expect(component.esAsesor).toBe(false);
    });
  });

  // ── tipos (metadata) ───────────────────────────────────────────────────────

  describe('tipos (metadata)', () => {
    beforeEach(async () => {
      await setup();
    });

    it('debería incluir la opción TODOS', () => {
      expect(component.tipos.some((t) => t.valor === 'TODOS')).toBe(true);
    });

    it('debería incluir los 6 tipos de interacción', () => {
      const valores = component.tipos.map((t) => t.valor).filter((v) => v !== 'TODOS');
      expect(valores).toEqual(
        expect.arrayContaining(['LLAMADA', 'REUNION', 'EMAIL', 'VISITA', 'WHATSAPP', 'OTRO']),
      );
    });
  });
});
