import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { InteractionFormComponent } from './interaction-form.component';
import { InteraccionService } from '../../../../core/services/interaccion.service';
import { OportunidadService } from '../../../../core/services/oportunidad.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ClienteResponse } from '../../../../core/models/cliente.model';
import { OportunidadResponse } from '../../../../core/models/oportunidad.model';

// ── Datos de prueba ────────────────────────────────────────────────────────

const USUARIO_ID = 99;

const clientesMock: ClienteResponse[] = [
  {
    id: 1,
    nombreCliente: 'Cliente A',
    empresa: 'Empresa A',
    email: 'a@a.com',
    telefono: '111',
    direccion: 'C1',
    fechaRegistro: '2024-01-01',
  },
  {
    id: 2,
    nombreCliente: 'Cliente B',
    empresa: 'Empresa B',
    email: 'b@b.com',
    telefono: '222',
    direccion: 'C2',
    fechaRegistro: '2024-01-02',
  },
];

const oportunidadMock: OportunidadResponse = {
  idOportunidad: 10,
  clienteId: 1,
  asesorId: USUARIO_ID, // ✅ mismo que usuarioId del auth
  descripcion: 'Op activa',
  valorEstimado: 5000,
  probabilidad: 50,
  etapa: 'PROSPECCION',
  estado: 'ACTIVA',
  esPotencial: false,
  ventaId: null,
  fechaCierreEstimada: '2024-12-31T00:00:00',
  fechaCreacion: '2024-01-01T00:00:00',
  fechaActualizacion: '2024-01-01T00:00:00',
};

// ── Mocks de servicios ─────────────────────────────────────────────────────

const interaccionServiceMock = { crear: vi.fn() };
const oportunidadServiceMock = {
  listarPorAsesor: vi.fn(),
  buscarPorCliente: vi.fn(),
};
const clienteServiceMock = { listar: vi.fn() };
const authServiceMock = { obtenerUsuarioId: vi.fn() };

// ── Setup ──────────────────────────────────────────────────────────────────

async function setup(oportunidadesAsesor: OportunidadResponse[] = [oportunidadMock]) {
  authServiceMock.obtenerUsuarioId.mockReturnValue(USUARIO_ID);
  clienteServiceMock.listar.mockReturnValue(of(clientesMock));
  oportunidadServiceMock.listarPorAsesor.mockReturnValue(of(oportunidadesAsesor));
  oportunidadServiceMock.buscarPorCliente.mockReturnValue(of([oportunidadMock]));

  await TestBed.configureTestingModule({
    imports: [InteractionFormComponent],
    providers: [
      { provide: InteraccionService, useValue: interaccionServiceMock },
      { provide: OportunidadService, useValue: oportunidadServiceMock },
      { provide: ClienteService, useValue: clienteServiceMock },
      { provide: AuthService, useValue: authServiceMock },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(InteractionFormComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();
  return { fixture, component };
}

// ── Suite ──────────────────────────────────────────────────────────────────

describe('InteractionFormComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
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

  it('debería iniciar sin guardar', async () => {
    const { component } = await setup();
    expect(component.guardando()).toBe(false);
  });

  it('debería iniciar con el formulario inválido', async () => {
    const { component } = await setup();
    expect(component.form.invalid).toBe(true);
  });

  // ── ngOnInit ───────────────────────────────────────────────────────────────

  describe('ngOnInit()', () => {
    it('debería llamar a clienteServ.listar()', async () => {
      await setup();
      expect(clienteServiceMock.listar).toHaveBeenCalled();
    });

    it('debería llamar a listarPorAsesor con el usuarioId', async () => {
      await setup();
      expect(oportunidadServiceMock.listarPorAsesor).toHaveBeenCalledWith(USUARIO_ID);
    });

    it('debería cargar solo oportunidades ACTIVAS', async () => {
      const { component } = await setup([oportunidadMock, { ...oportunidadMock, idOportunidad: 99, estado: 'INACTIVA' }]);
      expect(component.oportunidades().every((o) => o.estado === 'ACTIVA')).toBe(true);
    });
  });

  // ── clientesFiltrados (computed) ───────────────────────────────────────────

  describe('clientesFiltrados (computed)', () => {
    it('debería retornar los clientes cuya oportunidad pertenece al asesor', async () => {
      const { component } = await setup();
      // oportunidadMock tiene asesorId = USUARIO_ID y clienteId = 1
      expect(component.clientesFiltrados().length).toBe(1);
      expect(component.clientesFiltrados()[0].id).toBe(1);
    });

    it('debería retornar vacío cuando no hay oportunidades activas del asesor', async () => {
      const { component } = await setup([]);
      expect(component.clientesFiltrados().length).toBe(0);
    });

    it('debería excluir clientes sin oportunidades del asesor', async () => {
      // oportunidad con asesorId diferente al usuario
      const { component } = await setup([{ ...oportunidadMock, asesorId: 999 }]);
      expect(component.clientesFiltrados().length).toBe(0);
    });
  });

  // ── onClienteChange ────────────────────────────────────────────────────────

  describe('onClienteChange()', () => {
    it('debería llamar a buscarPorCliente con el id del cliente', async () => {
      const { component } = await setup();
      component.onClienteChange(1);
      expect(oportunidadServiceMock.buscarPorCliente).toHaveBeenCalledWith(1);
    });

    it('debería resetear oportunidadId al cambiar el cliente', async () => {
      const { component } = await setup();
      component.f['oportunidadId'].setValue(10);
      component.onClienteChange(1);
      expect(component.f['oportunidadId'].value).toBeNull();
    });
  });

  // ── submit() ───────────────────────────────────────────────────────────────

  describe('submit() — formulario inválido', () => {
    it('no debería llamar a crear si el formulario es inválido', async () => {
      const { component } = await setup();
      component.submit();
      expect(interaccionServiceMock.crear).not.toHaveBeenCalled();
    });

    it('debería marcar todos los campos como touched', async () => {
      const { component } = await setup();
      component.submit();
      expect(component.form.touched).toBe(true);
    });
  });

  describe('submit() — éxito', () => {
    it('debería llamar a crear con los datos correctos', async () => {
      interaccionServiceMock.crear.mockReturnValue(of({}));
      const { component } = await setup();
      component.form.setValue({
        clienteId: 1,
        oportunidadId: 10,
        tipo: 'LLAMADA',
        nota: 'Nota de prueba de la interaccion',
      });
      component.submit();
      expect(interaccionServiceMock.crear).toHaveBeenCalledWith({
        clienteId: 1,
        usuarioId: USUARIO_ID,
        oportunidadId: 10,
        tipo: 'LLAMADA',
        nota: 'Nota de prueba de la interaccion',
      });
    });

    it('debería resetear el formulario tras el éxito', async () => {
      interaccionServiceMock.crear.mockReturnValue(of({}));
      const { component } = await setup();
      component.form.setValue({
        clienteId: 1,
        oportunidadId: 10,
        tipo: 'LLAMADA',
        nota: 'Nota de prueba de la interaccion',
      });
      component.submit();
      expect(component.form.value.clienteId).toBeNull();
    });
  });

  describe('submit() — error', () => {
    it('debería setear el mensaje de error', async () => {
      interaccionServiceMock.crear.mockReturnValue(
        throwError(() => ({ error: { message: 'Error del servidor' } })),
      );
      const { component } = await setup();
      component.form.setValue({
        clienteId: 1,
        oportunidadId: 10,
        tipo: 'LLAMADA',
        nota: 'Nota de prueba de la interaccion',
      });
      component.submit();
      expect(component.error()).toBe('Error del servidor');
    });

    it('debería poner guardando en false tras el error', async () => {
      interaccionServiceMock.crear.mockReturnValue(
        throwError(() => ({ error: { message: 'Error' } })),
      );
      const { component } = await setup();
      component.form.setValue({
        clienteId: 1,
        oportunidadId: 10,
        tipo: 'LLAMADA',
        nota: 'Nota de prueba de la interaccion',
      });
      component.submit();
      expect(component.guardando()).toBe(false);
    });
  });

  // ── tipos ──────────────────────────────────────────────────────────────────

  describe('tipos', () => {
    it('debería tener 6 tipos de interacción', async () => {
      const { component } = await setup();
      expect(component.tipos.length).toBe(6);
    });

    it('debería incluir LLAMADA, REUNION, EMAIL, VISITA, WHATSAPP y OTRO', async () => {
      const { component } = await setup();
      const valores = component.tipos.map((t) => t.valor);
      expect(valores).toEqual(
        expect.arrayContaining(['LLAMADA', 'REUNION', 'EMAIL', 'VISITA', 'WHATSAPP', 'OTRO']),
      );
    });
  });
});
