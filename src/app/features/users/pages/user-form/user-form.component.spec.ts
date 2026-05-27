import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { UserFormComponent } from './user-form.component';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { ModalService } from '../../../../shared/services/modal.service';
import { UsuarioResponse } from '../../../../core/models/usuario.model';

// ── Datos de prueba ────────────────────────────────────────────────────────

const usuarioMock: UsuarioResponse = {
  id: 1,
  nombre: 'Ana García',
  email: 'ana@test.com',
  rol: 'ASESOR',
  activo: true,
  fechaCreacion: '2024-01-01T00:00:00',
};

// ── Mocks de servicios ─────────────────────────────────────────────────────

const usuarioServiceMock = {
  buscarPorId: vi.fn(),
  crear: vi.fn(),
  actualizar: vi.fn(),
};

const modalServiceMock = { show: vi.fn() };

const routerMock = { navigate: vi.fn() };

// ── Suite ──────────────────────────────────────────────────────────────────

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;

  async function setup(paramId: string | null = null) {
    await TestBed.configureTestingModule({
      imports: [UserFormComponent],
      providers: [
        { provide: UsuarioService, useValue: usuarioServiceMock },
        { provide: ModalService, useValue: modalServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => paramId } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
    usuarioServiceMock.buscarPorId.mockReturnValue(of(usuarioMock));
    usuarioServiceMock.crear.mockReturnValue(of({}));
    usuarioServiceMock.actualizar.mockReturnValue(of({}));
  });

  // ── Creación ───────────────────────────────────────────────────────────────

  it('debería crearse correctamente', async () => {
    await setup();
    expect(component).toBeTruthy();
  });

  // ── Estado inicial — modo creación ─────────────────────────────────────────

  describe('modo creación (sin id en ruta)', () => {
    beforeEach(async () => setup(null));

    it('debería iniciar con modoEdicion en false', () => {
      expect(component.modoEdicion()).toBe(false);
    });

    it('debería iniciar con usuarioId en null', () => {
      expect(component.usuarioId()).toBeNull();
    });

    it('debería iniciar con guardando en false', () => {
      expect(component.guardando()).toBe(false);
    });

    it('debería iniciar sin error', () => {
      expect(component.error()).toBeNull();
    });

    it('debería requerir password en modo creación', () => {
      expect(component.f['password'].validator).not.toBeNull();
    });

    it('no debería llamar a buscarPorId en modo creación', () => {
      expect(usuarioServiceMock.buscarPorId).not.toHaveBeenCalled();
    });
  });

  // ── Estado inicial — modo edición ──────────────────────────────────────────

  describe('modo edición (con id en ruta)', () => {
    beforeEach(async () => setup('1'));

    it('debería iniciar con modoEdicion en true', () => {
      expect(component.modoEdicion()).toBe(true);
    });

    it('debería setear usuarioId con el valor de la ruta', () => {
      expect(component.usuarioId()).toBe(1);
    });

    it('debería llamar a buscarPorId con el id de la ruta', () => {
      expect(usuarioServiceMock.buscarPorId).toHaveBeenCalledWith(1);
    });

    it('debería poblar el formulario con los datos del usuario', () => {
      expect(component.f['nombre'].value).toBe('Ana García');
      expect(component.f['email'].value).toBe('ana@test.com');
      expect(component.f['rol'].value).toBe('ASESOR');
    });

    it('debería limpiar el validador de password en modo edición', () => {
      expect(component.f['password'].validator).toBeNull();
    });
  });

  // ── cargarUsuario ──────────────────────────────────────────────────────────

  describe('cargarUsuario()', () => {
    it('debería setear error cuando el servicio falla', async () => {
      usuarioServiceMock.buscarPorId.mockReturnValue(throwError(() => new Error()));
      await setup('1');
      expect(component.error()).toBe('No se pudo cargar el usuario');
    });
  });

  // ── submit — formulario inválido ───────────────────────────────────────────

  describe('submit() — formulario inválido', () => {
    beforeEach(async () => setup(null));

    it('no debería llamar a ningún servicio', () => {
      component.submit();
      expect(usuarioServiceMock.crear).not.toHaveBeenCalled();
      expect(usuarioServiceMock.actualizar).not.toHaveBeenCalled();
    });

    it('debería marcar todos los campos como touched', () => {
      component.submit();
      expect(component.form.touched).toBe(true);
    });

    it('debería mantener guardando en false', () => {
      component.submit();
      expect(component.guardando()).toBe(false);
    });
  });

  // ── submit — modo creación exitoso ─────────────────────────────────────────

  describe('submit() — modo creación exitoso', () => {
    beforeEach(async () => {
      await setup(null);
      component.form.setValue({
        nombre: 'Nuevo Usuario',
        email: 'nuevo@test.com',
        password: 'pass1234',
        rol: 'ASESOR',
      });
    });

    it('debería llamar a usuarioService.crear con los datos del formulario', () => {
      component.submit();
      expect(usuarioServiceMock.crear).toHaveBeenCalledWith({
        nombre: 'Nuevo Usuario',
        email: 'nuevo@test.com',
        password: 'pass1234',
        rol: 'ASESOR',
      });
    });

    it('debería navegar a /users tras crear', () => {
      component.submit();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/users']);
    });

    it('debería mostrar modal de éxito', () => {
      component.submit();
      expect(modalServiceMock.show).toHaveBeenCalledWith('Usuario creado exitosamente', 'success');
    });
  });

  // ── submit — modo creación con error ───────────────────────────────────────

  describe('submit() — modo creación con error', () => {
    beforeEach(async () => {
      await setup(null);
      component.form.setValue({
        nombre: 'Nuevo Usuario',
        email: 'nuevo@test.com',
        password: 'pass1234',
        rol: 'ASESOR',
      });
    });

    it('debería setear el mensaje de error del servidor', () => {
      usuarioServiceMock.crear.mockReturnValue(
        throwError(() => ({ error: { message: 'Email ya registrado' } })),
      );
      component.submit();
      expect(component.error()).toBe('Email ya registrado');
    });

    it('debería usar mensaje genérico cuando el error no trae message', () => {
      usuarioServiceMock.crear.mockReturnValue(throwError(() => ({ error: {} })));
      component.submit();
      expect(component.error()).toBe('Error al crear usuario');
    });

    it('debería poner guardando en false tras el error', () => {
      usuarioServiceMock.crear.mockReturnValue(throwError(() => ({ error: {} })));
      component.submit();
      expect(component.guardando()).toBe(false);
    });
  });

  // ── submit — modo edición exitoso ──────────────────────────────────────────

  describe('submit() — modo edición exitoso', () => {
    beforeEach(async () => {
      await setup('1');
      component.form.patchValue({ password: '' });
    });

    it('debería llamar a usuarioService.actualizar con el id correcto', () => {
      component.submit();
      expect(usuarioServiceMock.actualizar).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ nombre: 'Ana García', email: 'ana@test.com', rol: 'ASESOR' }),
      );
    });

    it('NO debería incluir password en el payload si viene vacío', () => {
      component.submit();
      const payload = usuarioServiceMock.actualizar.mock.calls[0][1];
      expect(payload).not.toHaveProperty('password');
    });

    it('debería incluir password en el payload si se proporciona', () => {
      component.form.patchValue({ password: 'nueva_clave' });
      component.submit();
      const payload = usuarioServiceMock.actualizar.mock.calls[0][1];
      expect(payload.password).toBe('nueva_clave');
    });

    it('debería navegar a /users tras actualizar', () => {
      component.submit();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/users']);
    });

    it('debería mostrar modal de éxito', () => {
      component.submit();
      expect(modalServiceMock.show).toHaveBeenCalledWith(
        'Usuario actualizado exitosamente',
        'success',
      );
    });
  });

  // ── submit — modo edición con error ───────────────────────────────────────

  describe('submit() — modo edición con error', () => {
    beforeEach(async () => setup('1'));

    it('debería setear el mensaje de error del servidor', () => {
      usuarioServiceMock.actualizar.mockReturnValue(
        throwError(() => ({ error: { message: 'Email en uso' } })),
      );
      component.submit();
      expect(component.error()).toBe('Email en uso');
    });

    it('debería usar mensaje genérico cuando el error no trae message', () => {
      usuarioServiceMock.actualizar.mockReturnValue(throwError(() => ({ error: {} })));
      component.submit();
      expect(component.error()).toBe('Error al actualizar');
    });

    it('debería poner guardando en false tras el error', () => {
      usuarioServiceMock.actualizar.mockReturnValue(throwError(() => ({ error: {} })));
      component.submit();
      expect(component.guardando()).toBe(false);
    });
  });

  // ── cancelar ──────────────────────────────────────────────────────────────

  describe('cancelar()', () => {
    it('debería navegar a /users', async () => {
      await setup();
      component.cancelar();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/users']);
    });
  });

  // ── getter f ──────────────────────────────────────────────────────────────

  describe('getter f', () => {
    beforeEach(async () => setup());

    it('debería exponer los controles del formulario', () => {
      expect(component.f['nombre']).toBeDefined();
      expect(component.f['email']).toBeDefined();
      expect(component.f['password']).toBeDefined();
      expect(component.f['rol']).toBeDefined();
    });
  });
});
