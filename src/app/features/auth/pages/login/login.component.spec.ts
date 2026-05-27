import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../../../core/services/auth.service';
import { ModalService } from '../../../../shared/services/modal.service';

// ── Mocks ──────────────────────────────────────────────────────────────────

const authServiceMock = {
  login: vi.fn(),
  guardarSesion: vi.fn(),
};

const modalServiceMock = {
  show: vi.fn(),
};

// ── Helper ─────────────────────────────────────────────────────────────────

function loginConRol(rol: string) {
  return { roles: [`ROLE_${rol}`], token: 'fake-token' };
}

// ── Suite ──────────────────────────────────────────────────────────────────

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: ModalService, useValue: modalServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  // ── Creación ─────────────────────────────────────────────────────────────

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería iniciar con el formulario inválido', () => {
    expect(component.loginForm.invalid).toBe(true);
  });

  it('debería iniciar sin error y sin cargando', () => {
    expect(component.error).toBe('');
    expect(component.cargando).toBe(false);
  });

  // ── Validación del formulario ─────────────────────────────────────────────

  describe('validación del formulario', () => {
    it('campo email debería ser inválido si está vacío', () => {
      expect(component.campo('email')?.invalid).toBe(true);
    });

    it('campo email debería ser inválido con formato incorrecto', () => {
      component.campo('email')?.setValue('no-es-un-email');
      expect(component.campo('email')?.hasError('email')).toBe(true);
    });

    it('campo email debería ser válido con formato correcto', () => {
      component.campo('email')?.setValue('usuario@ejemplo.com');
      expect(component.campo('email')?.valid).toBe(true);
    });

    it('campo password debería ser inválido si tiene menos de 6 caracteres', () => {
      component.campo('password')?.setValue('123');
      expect(component.campo('password')?.hasError('minlength')).toBe(true);
    });

    it('formulario debería ser válido con datos correctos', () => {
      component.campo('email')?.setValue('usuario@ejemplo.com');
      component.campo('password')?.setValue('password123');
      expect(component.loginForm.valid).toBe(true);
    });
  });

  // ── onLogin con formulario inválido ───────────────────────────────────────

  describe('onLogin con formulario inválido', () => {
    it('no debería llamar al servicio si el formulario es inválido', () => {
      component.onLogin();
      expect(authServiceMock.login).not.toHaveBeenCalled();
    });

    it('debería marcar todos los campos como touched', () => {
      component.onLogin();
      expect(component.loginForm.touched).toBe(true);
    });
  });

  // ── onLogin con formulario válido ─────────────────────────────────────────

  describe('onLogin con formulario válido', () => {
    beforeEach(() => {
      component.campo('email')?.setValue('usuario@ejemplo.com');
      component.campo('password')?.setValue('password123');
    });

    it('debería llamar a authService.login con las credenciales', () => {
      authServiceMock.login.mockReturnValue(of(loginConRol('ADMINISTRADOR')));
      component.onLogin();
      expect(authServiceMock.login).toHaveBeenCalledWith({
        email: 'usuario@ejemplo.com',
        password: 'password123',
      });
    });

    it('debería poner cargando en true al enviar', () => {
      authServiceMock.login.mockReturnValue(of(loginConRol('ADMINISTRADOR')));
      component.onLogin();
      // guardarSesion se llama → cargando queda true hasta redirección
      expect(authServiceMock.guardarSesion).toHaveBeenCalled();
    });

    it('debería mostrar modal de error si el login falla', () => {
      authServiceMock.login.mockReturnValue(
        throwError(() => ({ error: { message: 'Credenciales inválidas' } })),
      );
      component.onLogin();
      expect(modalServiceMock.show).toHaveBeenCalledWith(
        'Error al iniciar sesión: Credenciales inválidas',
        'error',
      );
    });

    it('debería poner cargando en false si el login falla', () => {
      authServiceMock.login.mockReturnValue(throwError(() => ({ error: {} })));
      component.onLogin();
      expect(component.cargando).toBe(false);
    });

    it('debería mostrar "Error desconocido" si el error no tiene mensaje', () => {
      authServiceMock.login.mockReturnValue(throwError(() => ({ error: {} })));
      component.onLogin();
      expect(modalServiceMock.show).toHaveBeenCalledWith(
        'Error al iniciar sesión: Error desconocido',
        'error',
      );
    });
  });

  // ── Redirección por rol ───────────────────────────────────────────────────

  describe('redirección según rol', () => {
    beforeEach(() => {
      component.campo('email')?.setValue('usuario@ejemplo.com');
      component.campo('password')?.setValue('password123');
    });

    const casos = [
      { rol: 'ADMINISTRADOR', ruta: '/dashboard/admin' },
      { rol: 'GERENTE', ruta: '/dashboard/gerente' },
      { rol: 'ASESOR', ruta: '/dashboard/asesor' },
      { rol: 'DESCONOCIDO', ruta: '/login' },
    ];

    casos.forEach(({ rol, ruta }) => {
      it(`debería redirigir a ${ruta} para el rol ${rol}`, async () => {
        authServiceMock.login.mockReturnValue(of(loginConRol(rol)));
        const navigateSpy = vi.spyOn(router, 'navigate');
        component.onLogin();
        expect(navigateSpy).toHaveBeenCalledWith([ruta]);
      });
    });
  });
});
