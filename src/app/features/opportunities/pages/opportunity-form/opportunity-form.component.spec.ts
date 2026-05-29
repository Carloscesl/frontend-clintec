import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { OpportunityFormComponent } from './opportunity-form.component';
import { OportunidadService } from '../../../../core/services/oportunidad.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { ModalService } from '../../../../shared/services/modal.service';

// ── Datos de prueba ────────────────────────────────────────────────────────

const clientesMock = [
  { id: 1, nombreCliente: 'Cliente A', empresa: 'Empresa A' },
  { id: 2, nombreCliente: 'Cliente B', empresa: 'Empresa B' },
];

const usuariosMock = [
  {
    id: 10,
    nombre: 'Asesor Uno',
    email: 'asesor1@test.com',
    rol: 'ASESOR',
    activo: true,
    fechaCreacion: '2024-01-01',
  },
];

const oportunidadMock = {
  idOportunidad: 5,
  clienteId: 1,
  asesorId: 10,
  descripcion: 'Descripción de prueba larga',
  valorEstimado: 30000,
  probabilidad: 50,
  etapa: 'PROPUESTA',
  estado: 'ACTIVA',
  esPotencial: false,
  ventaId: null,
  fechaCierreEstimada: '2024-12-31T00:00:00',
  fechaCreacion: '2024-01-01T00:00:00',
  fechaActualizacion: '2024-06-01T00:00:00',
};

// ── Mocks de servicios ─────────────────────────────────────────────────────

const oportunidadServiceMock = {
  buscarPorId: vi.fn(),
  crear: vi.fn(),
  actualizar: vi.fn(),
};

const clienteServiceMock = { listar: vi.fn() };
const usuarioServiceMock = { listarPorRol: vi.fn() };
const modalServiceMock = { show: vi.fn() };
const routerMock = { navigate: vi.fn() };

// ── Suite ──────────────────────────────────────────────────────────────────

describe('OpportunityFormComponent', () => {
  let component: OpportunityFormComponent;
  let fixture: ComponentFixture<OpportunityFormComponent>;

  const crearComponente = async (paramId: string | null = null) => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [OpportunityFormComponent],
      providers: [
        { provide: OportunidadService, useValue: oportunidadServiceMock },
        { provide: ClienteService, useValue: clienteServiceMock },
        { provide: UsuarioService, useValue: usuarioServiceMock },
        { provide: ModalService, useValue: modalServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => paramId } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OpportunityFormComponent);
    component = fixture.componentInstance;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    clienteServiceMock.listar.mockReturnValue(of(clientesMock));
    usuarioServiceMock.listarPorRol.mockReturnValue(of(usuariosMock));
  });

  // ── Creación ───────────────────────────────────────────────────────────────

  it('debería crearse', async () => {
    await crearComponente();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ── Estado inicial ─────────────────────────────────────────────────────────

  describe('modo creación (sin id en ruta)', () => {
    beforeEach(async () => {
      await crearComponente(null);
      fixture.detectChanges();
    });

    it('debería iniciar en modo creación', () => {
      expect(component.modoEdicion()).toBe(false);
    });

    it('debería iniciar sin error', () => {
      expect(component.error()).toBeNull();
    });

    it('debería iniciar con guardando en false', () => {
      expect(component.guardando()).toBe(false);
    });

    it('debería cargar la lista de clientes', () => {
      expect(component.ListaClientes()).toHaveLength(2);
    });

    it('debería cargar la lista de asesores', () => {
      expect(component.ListaUsuarios()).toHaveLength(1);
    });

    it('no debería llamar a buscarPorId', () => {
      expect(oportunidadServiceMock.buscarPorId).not.toHaveBeenCalled();
    });
  });

  // ── Modo edición ───────────────────────────────────────────────────────────

  describe('modo edición (con id en ruta)', () => {
    beforeEach(async () => {
      oportunidadServiceMock.buscarPorId.mockReturnValue(of(oportunidadMock));
      await crearComponente('5');
      fixture.detectChanges();
    });

    it('debería iniciar en modo edición', () => {
      expect(component.modoEdicion()).toBe(true);
    });

    it('debería setear el id de la oportunidad', () => {
      expect(component.oportunidadId()).toBe(5);
    });

    it('debería llamar a buscarPorId con el id correcto', () => {
      expect(oportunidadServiceMock.buscarPorId).toHaveBeenCalledWith(5);
    });

    it('debería parchear el formulario con los datos de la oportunidad', () => {
      expect(component.form.get('descripcion')?.value).toBe('Descripción de prueba larga');
      expect(component.form.get('valorEstimado')?.value).toBe(30000);
    });

    it('debería deshabilitar el campo clienteId en modo edición', () => {
      expect(component.form.get('clienteId')?.disabled).toBe(true);
    });

    it('debería setear error si buscarPorId falla', async () => {
      vi.clearAllMocks();
      clienteServiceMock.listar.mockReturnValue(of(clientesMock));
      usuarioServiceMock.listarPorRol.mockReturnValue(of(usuariosMock));
      oportunidadServiceMock.buscarPorId.mockReturnValue(
        throwError(() => new Error('No encontrado')),
      );
      await crearComponente('5');
      fixture.detectChanges();
      expect(component.error()).toBe('No se pudo cargar la oportunidad');
    });
  });

  // ── submit() — formulario inválido ─────────────────────────────────────────

  describe('submit() — formulario inválido', () => {
    beforeEach(async () => {
      await crearComponente();
      fixture.detectChanges();
    });

    it('no debería llamar al servicio si el formulario es inválido', () => {
      component.submit();
      expect(oportunidadServiceMock.crear).not.toHaveBeenCalled();
    });

    it('debería marcar todos los controles como touched', () => {
      component.submit();
      expect(component.form.touched).toBe(true);
    });
  });

  // ── submit() — creación exitosa ────────────────────────────────────────────

  describe('submit() — creación exitosa', () => {
    beforeEach(async () => {
      oportunidadServiceMock.crear.mockReturnValue(of(oportunidadMock));
      await crearComponente();
      fixture.detectChanges();

      component.form.patchValue({
        clienteId: 1,
        asesorId: 10,
        descripcion: 'Descripción de prueba larga',
        valorEstimado: 30000,
        fechaCierreEstimada: '2024-12-31',
      });
    });

    it('debería llamar a crear con el dto del formulario', () => {
      component.submit();
      expect(oportunidadServiceMock.crear).toHaveBeenCalled();
    });

    it('debería mostrar modal de éxito con mensaje de creada', () => {
      component.submit();
      expect(modalServiceMock.show).toHaveBeenCalledWith('Oportunidad Creada con éxito', 'success');
    });

    it('debería navegar a /opportunities tras crear', () => {
      component.submit();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/opportunities']);
    });
  });

  // ── submit() — actualización exitosa ──────────────────────────────────────

  describe('submit() — actualización exitosa', () => {
    beforeEach(async () => {
      oportunidadServiceMock.buscarPorId.mockReturnValue(of(oportunidadMock));
      oportunidadServiceMock.actualizar.mockReturnValue(of(oportunidadMock));
      await crearComponente('5');
      fixture.detectChanges();
    });

    it('debería llamar a actualizar con el id correcto', () => {
      component.submit();
      expect(oportunidadServiceMock.actualizar).toHaveBeenCalledWith(5, expect.any(Object));
    });

    it('debería mostrar modal de éxito con mensaje de actualizada', () => {
      component.submit();
      expect(modalServiceMock.show).toHaveBeenCalledWith(
        'Oportunidad Actualizada con éxito',
        'success',
      );
    });

    it('debería navegar a /opportunities tras actualizar', () => {
      component.submit();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/opportunities']);
    });
  });

  // ── submit() — error ───────────────────────────────────────────────────────

  describe('submit() — error', () => {
    beforeEach(async () => {
      oportunidadServiceMock.crear.mockReturnValue(
        throwError(() => ({ error: { detalles: 'Error' } })),
      );
      await crearComponente();
      fixture.detectChanges();

      component.form.patchValue({
        clienteId: 1,
        asesorId: 10,
        descripcion: 'Descripción de prueba larga',
        valorEstimado: 30000,
        fechaCierreEstimada: '2024-12-31',
      });
    });

    it('debería mostrar modal de error', () => {
      component.submit();
      expect(modalServiceMock.show).toHaveBeenCalledWith('Error al procesar la solicitud', 'error');
    });

    it('debería poner guardando en false tras el error', () => {
      component.submit();
      expect(component.guardando()).toBe(false);
    });
  });

  // ── cancelar() ────────────────────────────────────────────────────────────

  describe('cancelar()', () => {
    it('debería navegar a /opportunities', async () => {
      await crearComponente();
      fixture.detectChanges();
      component.cancelar();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/opportunities']);
    });
  });
});
