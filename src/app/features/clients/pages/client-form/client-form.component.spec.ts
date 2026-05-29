import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { provideRouter, ActivatedRoute } from '@angular/router';

import { ClientFormComponent } from './client-form.component';
import { ClienteService } from '../../../../core/services/cliente.service';
import { ClienteResponse } from '../../../../core/models/cliente.model';

// ── Componente dummy para rutas stub ───────────────────────────────────────

@Component({ template: '', standalone: true })
class DummyComponent {}

// ── Datos de prueba ────────────────────────────────────────────────────────

const clienteMock: ClienteResponse = {
  id: 1,
  nombreCliente: 'Juan Pérez',
  empresa: 'Empresa SA',
  email: 'juan@empresa.com',
  telefono: '3001234567',
  direccion: 'Calle 1 # 2-3',
  fechaRegistro: '2024-01-01',
};

// ── Mocks de servicios ─────────────────────────────────────────────────────

const clienteServiceMock = {
  buscarPorId: vi.fn(),
  crear: vi.fn(),
  actualizar: vi.fn(),
};

// ── Suite ──────────────────────────────────────────────────────────────────

describe('ClientFormComponent', () => {
  let component: ClientFormComponent;
  let fixture: ComponentFixture<ClientFormComponent>;

  const setupWithId = async (id: string | null) => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [ClientFormComponent],
      providers: [
        provideRouter([
          { path: 'clients', component: DummyComponent },
          { path: '**', component: DummyComponent },
        ]),
        { provide: ClienteService, useValue: clienteServiceMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => id } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientFormComponent);
    component = fixture.componentInstance;
  };

  // ── Creación ───────────────────────────────────────────────────────────────

  it('debería crearse en modo creación', async () => {
    await setupWithId(null);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('debería crearse en modo edición', async () => {
    clienteServiceMock.buscarPorId.mockReturnValue(of(clienteMock));
    await setupWithId('1');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ── Estado inicial ─────────────────────────────────────────────────────────

  it('debería iniciar en modo creación cuando no hay id', async () => {
    await setupWithId(null);
    fixture.detectChanges();
    expect(component.modoEdicion()).toBe(false);
  });

  it('debería iniciar en modo edición cuando hay id', async () => {
    clienteServiceMock.buscarPorId.mockReturnValue(of(clienteMock));
    await setupWithId('1');
    fixture.detectChanges();
    expect(component.modoEdicion()).toBe(true);
  });

  it('debería iniciar sin error', async () => {
    await setupWithId(null);
    expect(component.error()).toBeNull();
  });

  it('debería iniciar sin guardar', async () => {
    await setupWithId(null);
    expect(component.guardando()).toBe(false);
  });

  // ── Formulario ─────────────────────────────────────────────────────────────

  it('debería tener el formulario inválido vacío', async () => {
    await setupWithId(null);
    fixture.detectChanges();
    expect(component.form.invalid).toBe(true);
  });

  it('debería ser válido con datos correctos', async () => {
    await setupWithId(null);
    fixture.detectChanges();
    component.form.setValue({
      nombreCliente: 'Juan Pérez',
      email: 'juan@empresa.com',
      telefono: '3001234567',
      empresa: 'Empresa SA',
      direccion: 'Calle 1',
    });
    expect(component.form.valid).toBe(true);
  });

  // ── Modo edición — carga cliente ───────────────────────────────────────────

  describe('modo edición', () => {
    beforeEach(async () => {
      clienteServiceMock.buscarPorId.mockReturnValue(of(clienteMock));
      await setupWithId('1');
      fixture.detectChanges();
    });

    it('debería setear el clienteId', () => {
      expect(component.clienteId()).toBe(1);
    });

    it('debería cargar los datos del cliente en el formulario', () => {
      expect(component.form.value.nombreCliente).toBe('Juan Pérez');
      expect(component.form.value.email).toBe('juan@empresa.com');
    });
  });

  describe('modo edición — error al cargar', () => {
    beforeEach(async () => {
      clienteServiceMock.buscarPorId.mockReturnValue(throwError(() => new Error('Error')));
      await setupWithId('1');
      fixture.detectChanges();
    });

    it('debería setear el mensaje de error', () => {
      expect(component.error()).toBe('No se pudo cargar el cliente');
    });
  });

  // ── submit() ───────────────────────────────────────────────────────────────

  describe('submit() — formulario inválido', () => {
    it('no debería llamar a crear si el formulario es inválido', async () => {
      await setupWithId(null);
      fixture.detectChanges();
      component.submit();
      expect(clienteServiceMock.crear).not.toHaveBeenCalled();
    });
  });

  describe('submit() — creación exitosa', () => {
    beforeEach(async () => {
      clienteServiceMock.crear.mockReturnValue(of(clienteMock));
      await setupWithId(null);
      fixture.detectChanges();
      component.form.setValue({
        nombreCliente: 'Juan Pérez',
        email: 'juan@empresa.com',
        telefono: '3001234567',
        empresa: 'Empresa SA',
        direccion: 'Calle 1',
      });
    });

    it('debería llamar a crear', () => {
      component.submit();
      expect(clienteServiceMock.crear).toHaveBeenCalled();
    });
  });

  describe('submit() — edición exitosa', () => {
    beforeEach(async () => {
      clienteServiceMock.buscarPorId.mockReturnValue(of(clienteMock));
      clienteServiceMock.actualizar.mockReturnValue(of(clienteMock));
      await setupWithId('1');
      fixture.detectChanges();
    });

    it('debería llamar a actualizar', () => {
      component.submit();
      expect(clienteServiceMock.actualizar).toHaveBeenCalledWith(1, expect.any(Object));
    });
  });

  describe('submit() — error', () => {
    beforeEach(async () => {
      clienteServiceMock.crear.mockReturnValue(
        throwError(() => ({ error: { message: 'Email duplicado' } })),
      );
      await setupWithId(null);
      fixture.detectChanges();
      component.form.setValue({
        nombreCliente: 'Juan Pérez',
        email: 'juan@empresa.com',
        telefono: '3001234567',
        empresa: 'Empresa SA',
        direccion: 'Calle 1',
      });
    });

    it('debería setear el mensaje de error', () => {
      component.submit();
      expect(component.error()).toBe('Email duplicado');
    });

    it('debería poner guardando en false tras el error', () => {
      component.submit();
      expect(component.guardando()).toBe(false);
    });
  });
});
