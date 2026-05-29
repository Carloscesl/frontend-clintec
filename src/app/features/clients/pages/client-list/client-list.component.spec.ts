import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { Component, Input } from '@angular/core';

import { ClientListComponent } from './client-list.component';
import { ClienteService } from '../../../../core/services/cliente.service';
import { OportunidadService } from '../../../../core/services/oportunidad.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CalificacionService } from '../../../../core/services/calificacion.service';
import { ClienteResponse } from '../../../../core/models/cliente.model';
import { QualificationBadgeComponent } from '../../../qualifications/pages/qualification-badge/qualification-badge.component';

// ── Stub ──────────────────────────────────────────────────────────────────

@Component({ selector: 'app-qualification-badge', standalone: true, template: '' })
class QualificationBadgeStub {
  @Input() nivel: any;
}

// ── Datos de prueba ────────────────────────────────────────────────────────

const clientesMock: ClienteResponse[] = [
  {
    id: 1,
    nombreCliente: 'Juan',
    empresa: 'A',
    email: 'a@a.com',
    telefono: '111',
    direccion: 'C1',
    fechaRegistro: '2024-01-01',
  },
  {
    id: 2,
    nombreCliente: 'María',
    empresa: 'B',
    email: 'b@b.com',
    telefono: '222',
    direccion: 'C2',
    fechaRegistro: '2024-01-02',
  },
];

const oportunidadesMock = [
  {
    idOportunidad: 1,
    clienteId: 1,
    asesorId: 10,
    descripcion: 'Op1',
    valorEstimado: 1000,
    probabilidad: 50,
    etapa: 'PROSPECCION',
    estado: 'ACTIVA',
    fechaCierreEstimada: '2024-12-31',
    fechaCreacion: '2024-01-01',
    fechaActualizacion: '2024-01-01',
  },
];

const calificacionesMock = [{ clienteId: 1, clasificacion: 'CALIENTE', puntaje: 80 }];

// ── Mocks de servicios ─────────────────────────────────────────────────────

const clienteServiceMock = { listar: vi.fn() };
const oportunidadServiceMock = { listar: vi.fn() };
const calificacionServiceMock = { findAll: vi.fn() };
const authServiceMock = {
  obtenerUsuario: vi.fn().mockReturnValue({ id: 10, roles: ['ADMINISTRADOR'] }),
};

// ── Suite ──────────────────────────────────────────────────────────────────

describe('ClientListComponent', () => {
  let component: ClientListComponent;
  let fixture: ComponentFixture<ClientListComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    authServiceMock.obtenerUsuario.mockReturnValue({ id: 10, roles: ['ADMINISTRADOR'] });

    clienteServiceMock.listar.mockReturnValue(of(clientesMock));
    oportunidadServiceMock.listar.mockReturnValue(of(oportunidadesMock));
    calificacionServiceMock.findAll.mockReturnValue(of(calificacionesMock));

    await TestBed.configureTestingModule({
      imports: [ClientListComponent],
      providers: [
        provideRouter([]),
        { provide: ClienteService, useValue: clienteServiceMock },
        { provide: OportunidadService, useValue: oportunidadServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: CalificacionService, useValue: calificacionServiceMock },
      ],
    })
      .overrideComponent(ClientListComponent, {
        remove: { imports: [QualificationBadgeComponent] },
        add: { imports: [QualificationBadgeStub] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ClientListComponent);
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

  // ── Carga exitosa ──────────────────────────────────────────────────────────

  describe('cargarDatos() — éxito', () => {
    it('debería llamar a listar clientes, oportunidades y calificaciones', () => {
      fixture.detectChanges();
      expect(clienteServiceMock.listar).toHaveBeenCalled();
      expect(oportunidadServiceMock.listar).toHaveBeenCalled();
      expect(calificacionServiceMock.findAll).toHaveBeenCalled();
    });

    it('debería poner loading en false tras cargar', () => {
      fixture.detectChanges();
      expect(component.loading()).toBe(false);
    });

    it('no debería tener error tras carga exitosa', () => {
      fixture.detectChanges();
      expect(component.error()).toBeNull();
    });

    it('debería mostrar todos los clientes para ADMINISTRADOR', () => {
      fixture.detectChanges();
      expect(component.clientesFiltrados().length).toBe(2);
    });
  });

  // ── Filtro por rol ASESOR ──────────────────────────────────────────────────

  describe('filtrado por rol ASESOR', () => {
    beforeEach(async () => {
      TestBed.resetTestingModule();
      authServiceMock.obtenerUsuario.mockReturnValue({ id: 10, roles: ['ASESOR'] });

      await TestBed.configureTestingModule({
        imports: [ClientListComponent],
        providers: [
          provideRouter([]),
          { provide: ClienteService, useValue: clienteServiceMock },
          { provide: OportunidadService, useValue: oportunidadServiceMock },
          { provide: AuthService, useValue: authServiceMock },
          { provide: CalificacionService, useValue: calificacionServiceMock },
        ],
      })
        .overrideComponent(ClientListComponent, {
          remove: { imports: [QualificationBadgeComponent] },
          add: { imports: [QualificationBadgeStub] },
        })
        .compileComponents();

      fixture = TestBed.createComponent(ClientListComponent);
      component = fixture.componentInstance;
    });

    it('debería mostrar solo los clientes del asesor', () => {
      fixture.detectChanges();
      expect(component.clientesFiltrados().length).toBe(1);
      expect(component.clientesFiltrados()[0].id).toBe(1);
    });
  });

  // ── Carga con error ────────────────────────────────────────────────────────

  describe('cargarDatos() — error', () => {
    beforeEach(() => {
      clienteServiceMock.listar.mockReturnValue(throwError(() => new Error('Error')));
    });

    it('debería setear el mensaje de error', () => {
      fixture.detectChanges();
      expect(component.error()).toBe('Error al sincronizar datos de clientes y oportunidades');
    });

    it('debería poner loading en false tras el error', () => {
      fixture.detectChanges();
      expect(component.loading()).toBe(false);
    });
  });

  // ── getCalificacion ────────────────────────────────────────────────────────

  describe('getCalificacion()', () => {
    it('debería retornar la calificacion del cliente', () => {
      fixture.detectChanges();
      const q = component.getCalificacion(1);
      expect(q).toBeDefined();
      expect(q?.clasificacion).toBe('CALIENTE');
    });

    it('debería retornar undefined si el cliente no tiene calificacion', () => {
      fixture.detectChanges();
      expect(component.getCalificacion(999)).toBeUndefined();
    });
  });

  // ── Permisos ───────────────────────────────────────────────────────────────

  it('debería permitir crear a ADMINISTRADOR', () => {
    fixture.detectChanges();
    expect(component.puedeCrear).toBe(true);
  });
});
