import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { ClientDetailComponent } from './client-detail.component';
import { ClienteService } from '../../../../core/services/cliente.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ClienteResponse } from '../../../../core/models/cliente.model';
import { QualificationWidgetComponent } from '../../../qualifications/pages/qualification-widget/qualification-widget.component';
import { Component, Input } from '@angular/core';

// ── Stub ──────────────────────────────────────────────────────────────────

@Component({ selector: 'app-qualification-widget', standalone: true, template: '' })
class QualificationWidgetStub {
  @Input() clienteId: any;
  @Input() puedeEditar: any;
}

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

const clienteServiceMock = { buscarPorId: vi.fn() };
const authServiceMock = {
  obtenerUsuario: vi.fn().mockReturnValue({ roles: ['ADMINISTRADOR'] }),
};
const routerMock = { navigate: vi.fn() };

// ── Suite ──────────────────────────────────────────────────────────────────

describe('ClientDetailComponent', () => {
  let component: ClientDetailComponent;
  let fixture: ComponentFixture<ClientDetailComponent>;

  const setupWithId = async (id: string | null) => {
    vi.clearAllMocks();
    clienteServiceMock.buscarPorId.mockReturnValue(of(clienteMock));

    await TestBed.configureTestingModule({
      imports: [ClientDetailComponent],
      providers: [
        provideRouter([]),
        { provide: ClienteService, useValue: clienteServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => id } } },
        },
      ],
    })
      .overrideComponent(ClientDetailComponent, {
        remove: { imports: [QualificationWidgetComponent] },
        add: { imports: [QualificationWidgetStub] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ClientDetailComponent);
    component = fixture.componentInstance;
  };

  // ── Creación ───────────────────────────────────────────────────────────────

  it('debería crearse', async () => {
    await setupWithId('1');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ── Estado inicial ─────────────────────────────────────────────────────────

  it('debería iniciar con loading en true', async () => {
    await setupWithId(null);
    expect(component.loading()).toBe(true);
  });

  it('debería iniciar sin error', async () => {
    await setupWithId(null);
    expect(component.error()).toBeNull();
  });

  it('debería iniciar sin cliente', async () => {
    await setupWithId(null);
    expect(component.cliente()).toBeNull();
  });

  // ── Con ID en la ruta ──────────────────────────────────────────────────────

  describe('con id en la ruta', () => {
    beforeEach(async () => await setupWithId('1'));

    it('debería setear el clienteId', () => {
      fixture.detectChanges();
      expect(component.clienteId()).toBe(1);
    });

    it('debería llamar a buscarPorId con el id correcto', () => {
      fixture.detectChanges();
      expect(clienteServiceMock.buscarPorId).toHaveBeenCalledWith(1);
    });

    it('debería setear el cliente correctamente', () => {
      fixture.detectChanges();
      expect(component.cliente()).toEqual(clienteMock);
    });

    it('debería poner loading en false tras cargar', () => {
      fixture.detectChanges();
      expect(component.loading()).toBe(false);
    });

    it('no debería tener error tras carga exitosa', () => {
      fixture.detectChanges();
      expect(component.error()).toBeNull();
    });
  });

  // ── Sin ID en la ruta ──────────────────────────────────────────────────────

  describe('sin id en la ruta', () => {
    beforeEach(async () => await setupWithId(null));

    it('no debería llamar a buscarPorId', () => {
      fixture.detectChanges();
      expect(clienteServiceMock.buscarPorId).not.toHaveBeenCalled();
    });
  });

  // ── Error al cargar ────────────────────────────────────────────────────────

  describe('cargar() — error', () => {
    beforeEach(async () => {
      await setupWithId('1');
      clienteServiceMock.buscarPorId.mockReturnValue(throwError(() => new Error('Error')));
    });

    it('debería setear el mensaje de error', () => {
      fixture.detectChanges();
      expect(component.error()).toBe('No se encontró el cliente');
    });

    it('debería poner loading en false tras el error', () => {
      fixture.detectChanges();
      expect(component.loading()).toBe(false);
    });
  });

  // ── puedeEditarCalificacion ────────────────────────────────────────────────

  it('debería permitir editar calificacion a ADMINISTRADOR', async () => {
    await setupWithId('1');
    fixture.detectChanges();
    expect(component.puedeEditarCalificacion).toBe(true);
  });

  it('no debería permitir editar calificacion a ASESOR', async () => {
    authServiceMock.obtenerUsuario.mockReturnValue({ roles: ['ASESOR'] });
    await setupWithId('1');
    fixture.detectChanges();
    expect(component.puedeEditarCalificacion).toBe(false);
  });
});
