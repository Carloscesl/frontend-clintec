import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { OpportunityMainComponent } from './opportunity-main.component';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { OportunidadService } from '../../../../core/services/oportunidad.service';
import { Router } from '@angular/router';
import { OportunidadResponse } from '../../../../core/models/oportunidad.model';
import { UsuarioResponse } from '../../../../core/models/usuario.model';

// ── Datos de prueba ────────────────────────────────────────────────────────

const asesoresMock: UsuarioResponse[] = [
  {
    id: 1,
    nombre: 'Asesor Uno',
    email: 'a1@test.com',
    rol: 'ASESOR',
    activo: true,
    fechaCreacion: '2024-01-01',
  },
  {
    id: 2,
    nombre: 'Asesor Dos',
    email: 'a2@test.com',
    rol: 'ASESOR',
    activo: true,
    fechaCreacion: '2024-01-01',
  },
];

const oportunidadesMock: OportunidadResponse[] = [
  {
    idOportunidad: 10,
    clienteId: 1,
    asesorId: 1,
    descripcion: 'Op asesor uno',
    valorEstimado: 20000,
    probabilidad: 30,
    etapa: 'CALIFICACION',
    estado: 'ACTIVA',
    esPotencial: false,
    ventaId: null,
    fechaCierreEstimada: '2024-12-01T00:00:00',
    fechaCreacion: '2024-01-01T00:00:00',
    fechaActualizacion: '2024-06-01T00:00:00',
  },
];

// ── Mocks de servicios ─────────────────────────────────────────────────────

const usuarioServiceMock = { listarPorRol: vi.fn() };
const oportunidadServiceMock = { listarPorAsesor: vi.fn() };
const routerMock = { navigate: vi.fn() };

// ── Suite ──────────────────────────────────────────────────────────────────

describe('OpportunityMainComponent', () => {
  let component: OpportunityMainComponent;
  let fixture: ComponentFixture<OpportunityMainComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();

    usuarioServiceMock.listarPorRol.mockReturnValue(of(asesoresMock));
    oportunidadServiceMock.listarPorAsesor.mockReturnValue(of(oportunidadesMock));

    await TestBed.configureTestingModule({
      imports: [OpportunityMainComponent],
      providers: [
        { provide: UsuarioService, useValue: usuarioServiceMock },
        { provide: OportunidadService, useValue: oportunidadServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OpportunityMainComponent);
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

  it('debería iniciar con dataAsesores vacío', () => {
    expect(component.dataAsesores()).toEqual([]);
  });

  // ── cargarTodo() — éxito ───────────────────────────────────────────────────

  describe('cargarTodo() — éxito', () => {
    it('debería llamar a listarPorRol con ASESOR', () => {
      fixture.detectChanges();
      expect(usuarioServiceMock.listarPorRol).toHaveBeenCalledWith('ASESOR');
    });

    it('debería llamar a listarPorAsesor para cada asesor', () => {
      fixture.detectChanges();
      expect(oportunidadServiceMock.listarPorAsesor).toHaveBeenCalledTimes(asesoresMock.length);
    });

    it('debería setear dataAsesores con los asesores y sus oportunidades', () => {
      fixture.detectChanges();
      expect(component.dataAsesores()).toHaveLength(2);
      expect(component.dataAsesores()[0].oportunidades).toEqual(oportunidadesMock);
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

  // ── cargarTodo() — sin asesores ────────────────────────────────────────────

  describe('cargarTodo() — lista de asesores vacía', () => {
    it('debería poner loading en false si no hay asesores', () => {
      usuarioServiceMock.listarPorRol.mockReturnValue(of([]));
      fixture.detectChanges();
      expect(component.loading()).toBe(false);
    });

    it('no debería llamar a listarPorAsesor si no hay asesores', () => {
      usuarioServiceMock.listarPorRol.mockReturnValue(of([]));
      fixture.detectChanges();
      expect(oportunidadServiceMock.listarPorAsesor).not.toHaveBeenCalled();
    });
  });

  // ── cargarTodo() — error al cargar asesores ────────────────────────────────

  describe('cargarTodo() — error al cargar asesores', () => {
    beforeEach(() => {
      usuarioServiceMock.listarPorRol.mockReturnValue(throwError(() => new Error('Error de red')));
    });

    it('debería setear el mensaje de error', () => {
      fixture.detectChanges();
      expect(component.error()).toBe('Error al cargar la lista de asesores');
    });

    it('debería poner loading en false', () => {
      fixture.detectChanges();
      expect(component.loading()).toBe(false);
    });
  });

  // ── cargarTodo() — error al cargar oportunidades ──────────────────────────

  describe('cargarTodo() — error al cargar oportunidades', () => {
    beforeEach(() => {
      oportunidadServiceMock.listarPorAsesor.mockReturnValue(
        throwError(() => new Error('Error ops')),
      );
    });

    it('debería setear el mensaje de error de oportunidades', () => {
      fixture.detectChanges();
      expect(component.error()).toBe('Error al cargar el detalle de oportunidades');
    });

    it('debería poner loading en false', () => {
      fixture.detectChanges();
      expect(component.loading()).toBe(false);
    });
  });

  // ── Navegación ─────────────────────────────────────────────────────────────

  describe('irAcrear()', () => {
    it('debería navegar a /opportunities/crear', () => {
      fixture.detectChanges();
      component.irAcrear();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/opportunities/crear']);
    });
  });

  describe('irAeditar()', () => {
    it('debería navegar a /opportunities/editar/:id', () => {
      fixture.detectChanges();
      component.irAeditar(10);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/opportunities/editar', 10]);
    });
  });
});
