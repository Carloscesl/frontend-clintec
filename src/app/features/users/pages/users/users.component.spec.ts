import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, Subject, throwError } from 'rxjs';

import { UsersComponent } from './users.component';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { Router } from '@angular/router';
import { UsuarioResponse } from '../../../../core/models/usuario.model';

// ── Datos de prueba ────────────────────────────────────────────────────────

const usuariosMock: UsuarioResponse[] = [
  {
    id: 1,
    nombre: 'Ana García',
    email: 'ana@example.com',
    rol: 'ADMINISTRADOR',
    activo: true,
    fechaCreacion: '2024-01-15',
  },
  {
    id: 2,
    nombre: 'Carlos López',
    email: 'carlos@example.com',
    rol: 'ASESOR',
    activo: false,
    fechaCreacion: '2024-02-20',
  },
];

// ── Mocks de servicios ─────────────────────────────────────────────────────

const usuarioServiceMock = {
  listar: vi.fn(),
  activar: vi.fn(),
  desactivar: vi.fn(),
};

const routerMock = {
  navigate: vi.fn(),
};

// ── Suite ──────────────────────────────────────────────────────────────────

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();

    usuarioServiceMock.listar.mockReturnValue(of(usuariosMock));

    await TestBed.configureTestingModule({
      imports: [UsersComponent],
      providers: [
        { provide: UsuarioService, useValue: usuarioServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
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

  it('debería iniciar con lista de usuarios vacía', () => {
    expect(component.usuarios()).toEqual([]);
  });

  it('debería iniciar sin acción en curso', () => {
    expect(component.accionando()).toBeNull();
  });

  // ── Carga exitosa ──────────────────────────────────────────────────────────

  describe('cargar() — éxito', () => {
    it('debería llamar a listar', () => {
      fixture.detectChanges();
      expect(usuarioServiceMock.listar).toHaveBeenCalled();
    });

    it('debería setear los usuarios correctamente', () => {
      fixture.detectChanges();
      expect(component.usuarios()).toEqual(usuariosMock);
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

  // ── Carga con error ────────────────────────────────────────────────────────

  describe('cargar() — error', () => {
    beforeEach(() => {
      usuarioServiceMock.listar.mockReturnValue(throwError(() => new Error('Error de red')));
    });

    it('debería setear el mensaje de error', () => {
      fixture.detectChanges();
      expect(component.error()).toBe('Error al cargar usuarios');
    });

    it('debería poner loading en false tras el error', () => {
      fixture.detectChanges();
      expect(component.loading()).toBe(false);
    });

    it('no debería tener usuarios si falló la carga', () => {
      fixture.detectChanges();
      expect(component.usuarios()).toEqual([]);
    });
  });

  // ── cargar() llamado manualmente ───────────────────────────────────────────

  describe('cargar() llamado manualmente', () => {
    it('debería resetear error y loading al recargar', () => {
      usuarioServiceMock.listar.mockReturnValueOnce(throwError(() => new Error('fallo')));
      fixture.detectChanges();
      expect(component.error()).toBeTruthy();

      usuarioServiceMock.listar.mockReturnValue(of(usuariosMock));
      component.cargar();
      expect(component.error()).toBeNull();
      expect(component.usuarios()).toEqual(usuariosMock);
    });
  });

  // ── Navegación ─────────────────────────────────────────────────────────────

  describe('irACrear()', () => {
    it('debería navegar a /users/create', () => {
      component.irACrear();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/users/create']);
    });
  });

  describe('irAEditar()', () => {
    it('debería navegar a /users/edit/:id con el id correcto', () => {
      component.irAEditar(1);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/users/edit', 1]);
    });
  });

  // ── toggleEstado ───────────────────────────────────────────────────────────

  describe('toggleEstado() — desactivar (activo: true)', () => {
    beforeEach(() => {
      fixture.detectChanges();
      usuarioServiceMock.desactivar.mockReturnValue(of(void 0));
      usuarioServiceMock.listar.mockReturnValue(of(usuariosMock));
    });

    it('debería llamar a desactivar cuando el usuario está activo', () => {
      component.toggleEstado('ana@example.com', true, 1);
      expect(usuarioServiceMock.desactivar).toHaveBeenCalledWith('ana@example.com');
    });

    it('debería setear accionando con el id al iniciar', () => {
      const subject = new Subject<void>();
      usuarioServiceMock.desactivar.mockReturnValue(subject.asObservable());

      component.toggleEstado('ana@example.com', true, 1);
      expect(component.accionando()).toBe(1); // antes de completar

      subject.next();
      subject.complete();
      expect(component.accionando()).toBeNull(); // después de completar
    });

    it('debería limpiar accionando tras éxito', () => {
      component.toggleEstado('ana@example.com', true, 1);
      expect(component.accionando()).toBeNull();
    });

    it('debería recargar la lista tras éxito', () => {
      component.toggleEstado('ana@example.com', true, 1);
      // listar es llamado una vez en ngOnInit y otra tras el toggle
      expect(usuarioServiceMock.listar).toHaveBeenCalledTimes(2);
    });
  });

  describe('toggleEstado() — activar (activo: false)', () => {
    beforeEach(() => {
      fixture.detectChanges();
      usuarioServiceMock.activar.mockReturnValue(of(void 0));
      usuarioServiceMock.listar.mockReturnValue(of(usuariosMock));
    });

    it('debería llamar a activar cuando el usuario está inactivo', () => {
      component.toggleEstado('carlos@example.com', false, 2);
      expect(usuarioServiceMock.activar).toHaveBeenCalledWith('carlos@example.com');
    });

    it('debería limpiar accionando tras éxito', () => {
      component.toggleEstado('carlos@example.com', false, 2);
      expect(component.accionando()).toBeNull();
    });
  });

  describe('toggleEstado() — error', () => {
    beforeEach(() => {
      fixture.detectChanges();
      usuarioServiceMock.desactivar.mockReturnValue(throwError(() => new Error('Error de red')));
    });

    it('debería setear el mensaje de error al fallar', () => {
      component.toggleEstado('ana@example.com', true, 1);
      expect(component.error()).toBe('Error al cambiar estado del usuario');
    });

    it('debería limpiar accionando tras el error', () => {
      component.toggleEstado('ana@example.com', true, 1);
      expect(component.accionando()).toBeNull();
    });

    it('no debería recargar la lista si falló el toggle', () => {
      component.toggleEstado('ana@example.com', true, 1);
      // listar solo fue llamado en ngOnInit, no después del error
      expect(usuarioServiceMock.listar).toHaveBeenCalledTimes(1);
    });
  });
});
