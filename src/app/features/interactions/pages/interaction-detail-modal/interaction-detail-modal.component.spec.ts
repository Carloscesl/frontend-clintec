import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { InteractionDetailModalComponent } from './interaction-detail-modal.component';
import { InteraccionService } from '../../../../core/services/interaccion.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { AuthService } from '../../../../core/services/auth.service';
import { InteraccionResponse, TipoInteraccion } from '../../../../core/models/interaccion.model';

// ── Datos de prueba ────────────────────────────────────────────────────────

const interaccionMock: InteraccionResponse = {
  id: 1,
  clienteId: 10,
  usuarioId: 20,
  oportunidadId: 5,
  tipo: 'LLAMADA',
  nota: 'Llamada de seguimiento con el cliente',
  fecha: '2024-01-15T10:00:00',
  fechaActualizacion: '2024-01-15T10:00:00',
};

// ── Host para signal input requerido ──────────────────────────────────────

@Component({
  standalone: true,
  imports: [InteractionDetailModalComponent],
  template: `<app-interaction-detail-modal
    [interaccionId]="interaccionId"
    (cerrar)="onCerrar()"
  />`,
})
class HostComponent {
  interaccionId = 1;
  cerrado = false;
  onCerrar() {
    this.cerrado = true;
  }
}

// ── Mocks de servicios ─────────────────────────────────────────────────────

const interaccionServiceMock = { buscarPorId: vi.fn() };
const clienteServiceMock = { buscarPorId: vi.fn() };
const usuarioServiceMock = { buscarPorId: vi.fn() };
const authServiceMock = {
  obtenerRol: vi.fn(),
  obtenerUsuario: vi.fn(),
};

// ── Suite ──────────────────────────────────────────────────────────────────

describe('InteractionDetailModalComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let component: InteractionDetailModalComponent;

  function setup(rol = 'ADMINISTRADOR') {
    authServiceMock.obtenerRol.mockReturnValue(rol);
    authServiceMock.obtenerUsuario.mockReturnValue({ username: 'asesor_test' });
    interaccionServiceMock.buscarPorId.mockReturnValue(of(interaccionMock));
    clienteServiceMock.buscarPorId.mockReturnValue(
      of({ nombreCliente: 'Empresa Test', empresa: 'Tech S.A.' }),
    );
    usuarioServiceMock.buscarPorId.mockReturnValue(of({ nombre: 'Juan Asesor' }));
  }

  async function compilar() {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: InteraccionService, useValue: interaccionServiceMock },
        { provide: ClienteService, useValue: clienteServiceMock },
        { provide: UsuarioService, useValue: usuarioServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();

    component = fixture.debugElement.query(By.directive(InteractionDetailModalComponent))
      .componentInstance as InteractionDetailModalComponent;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
  });

  // ── Creación ───────────────────────────────────────────────────────────────

  it('debería crearse correctamente', async () => {
    setup();
    await compilar();
    expect(component).toBeTruthy();
  });

  // ── Estado inicial ─────────────────────────────────────────────────────────

  it('debería iniciar con loading en true antes de recibir respuesta', async () => {
    authServiceMock.obtenerRol.mockReturnValue('ADMINISTRADOR');
    authServiceMock.obtenerUsuario.mockReturnValue(null);
    clienteServiceMock.buscarPorId.mockReturnValue(of({ nombreCliente: 'X', empresa: '' }));
    usuarioServiceMock.buscarPorId.mockReturnValue(of({ nombre: 'X' }));

    let resolver!: (v: InteraccionResponse) => void;
    interaccionServiceMock.buscarPorId.mockReturnValue(
      new (await import('rxjs')).Observable((obs) => {
        resolver = (v) => obs.next(v);
      }),
    );

    await compilar();
    expect(component.loading()).toBe(true);
    resolver(interaccionMock); // limpieza
  });

  it('debería iniciar sin error', async () => {
    setup();
    await compilar();
    expect(component.error()).toBeNull();
  });

  // ── Carga exitosa ──────────────────────────────────────────────────────────

  describe('cargar() — éxito', () => {
    beforeEach(async () => {
      setup();
      await compilar();
    });

    it('debería llamar a interaccionService.buscarPorId con el id recibido', () => {
      expect(interaccionServiceMock.buscarPorId).toHaveBeenCalledWith(1);
    });

    it('debería setear la interacción con los datos retornados', () => {
      expect(component.interaccion()).toEqual(interaccionMock);
    });

    it('debería poner loading en false', () => {
      expect(component.loading()).toBe(false);
    });

    it('no debería tener error tras carga exitosa', () => {
      expect(component.error()).toBeNull();
    });
  });

  // ── Carga con error ────────────────────────────────────────────────────────

  describe('cargar() — error', () => {
    beforeEach(async () => {
      authServiceMock.obtenerRol.mockReturnValue('ADMINISTRADOR');
      authServiceMock.obtenerUsuario.mockReturnValue(null);
      interaccionServiceMock.buscarPorId.mockReturnValue(throwError(() => new Error('Not found')));
      clienteServiceMock.buscarPorId.mockReturnValue(of({ nombreCliente: 'X', empresa: '' }));
      usuarioServiceMock.buscarPorId.mockReturnValue(of({ nombre: 'X' }));
      await compilar();
    });

    it('debería setear el mensaje de error', () => {
      expect(component.error()).toBe('No se encontró la interacción');
    });

    it('debería poner loading en false', () => {
      expect(component.loading()).toBe(false);
    });

    it('debería dejar interaccion en null', () => {
      expect(component.interaccion()).toBeNull();
    });
  });

  // ── cargarCliente ──────────────────────────────────────────────────────────

  describe('cargarCliente()', () => {
    it('debería setear clienteNombre con el valor recibido', async () => {
      setup();
      clienteServiceMock.buscarPorId.mockReturnValue(
        of({ nombreCliente: 'Empresa ABC', empresa: 'ABC Corp' }),
      );
      await compilar();
      expect(component.clienteNombre()).toBe('Empresa ABC');
    });

    it('debería setear clienteEmpresa con el valor recibido', async () => {
      setup();
      clienteServiceMock.buscarPorId.mockReturnValue(
        of({ nombreCliente: 'Empresa ABC', empresa: 'ABC Corp' }),
      );
      await compilar();
      expect(component.clienteEmpresa()).toBe('ABC Corp');
    });

    it('debería setear "Sin nombre" cuando nombreCliente viene vacío', async () => {
      setup();
      clienteServiceMock.buscarPorId.mockReturnValue(of({ nombreCliente: '', empresa: '' }));
      await compilar();
      expect(component.clienteNombre()).toBe('Sin nombre');
    });

    it('debería setear "Sin empresa" cuando empresa viene vacía', async () => {
      setup();
      clienteServiceMock.buscarPorId.mockReturnValue(
        of({ nombreCliente: 'Cliente X', empresa: '' }),
      );
      await compilar();
      expect(component.clienteEmpresa()).toBe('Sin empresa');
    });

    it('debería setear "Cliente desconocido" cuando el servicio falla', async () => {
      setup();
      await compilar();
      clienteServiceMock.buscarPorId.mockReturnValue(throwError(() => new Error()));
      component.cargarCliente(99);
      expect(component.clienteNombre()).toBe('Cliente desconocido');
    });

    it('debería setear empresa vacía cuando el servicio falla', async () => {
      setup();
      await compilar();
      clienteServiceMock.buscarPorId.mockReturnValue(throwError(() => new Error()));
      component.cargarCliente(99);
      expect(component.clienteEmpresa()).toBe('');
    });
  });

  // ── cargarUsuario — ADMINISTRADOR ──────────────────────────────────────────

  describe('cargarUsuario() — ADMINISTRADOR', () => {
    beforeEach(async () => {
      setup('ADMINISTRADOR');
      await compilar();
    });

    it('debería llamar a usuarioService.buscarPorId', () => {
      expect(usuarioServiceMock.buscarPorId).toHaveBeenCalledWith(20);
    });

    it('debería setear usuarioNombre con el nombre retornado', () => {
      expect(component.usuarioNombre()).toBe('Juan Asesor');
    });

    it('debería setear "Sin nombre" cuando nombre viene vacío', () => {
      usuarioServiceMock.buscarPorId.mockReturnValue(of({ nombre: '' }));
      component.cargarUsuario(20);
      expect(component.usuarioNombre()).toBe('Sin nombre');
    });

    it('debería setear "Usuario desconocido" cuando el servicio falla', () => {
      usuarioServiceMock.buscarPorId.mockReturnValue(throwError(() => new Error()));
      component.cargarUsuario(20);
      expect(component.usuarioNombre()).toBe('Usuario desconocido');
    });
  });

  // ── cargarUsuario — ASESOR ─────────────────────────────────────────────────

  describe('cargarUsuario() — ASESOR', () => {
    beforeEach(async () => {
      setup('ASESOR');
      await compilar();
    });

    it('NO debería llamar a usuarioService.buscarPorId', () => {
      expect(usuarioServiceMock.buscarPorId).not.toHaveBeenCalled();
    });

    it('debería usar el username del usuario logueado', () => {
      expect(component.usuarioNombre()).toBe('asesor_test');
    });

    it('debería setear "Mi Usuario" cuando obtenerUsuario retorna null', () => {
      authServiceMock.obtenerUsuario.mockReturnValue(null);
      component.cargarUsuario(20);
      expect(component.usuarioNombre()).toBe('Mi Usuario');
    });
  });

  // ── noEsAsesor ─────────────────────────────────────────────────────────────

  describe('noEsAsesor', () => {
    it('debería ser true cuando el rol es ADMINISTRADOR', async () => {
      setup('ADMINISTRADOR');
      await compilar();
      expect(component.noEsAsesor).toBe(true);
    });

    it('debería ser false cuando el rol es ASESOR', async () => {
      setup('ASESOR');
      await compilar();
      expect(component.noEsAsesor).toBe(false);
    });

    it('debería ser true cuando obtenerRol retorna null', async () => {
      authServiceMock.obtenerRol.mockReturnValue(null);
      authServiceMock.obtenerUsuario.mockReturnValue(null);
      interaccionServiceMock.buscarPorId.mockReturnValue(of(interaccionMock));
      clienteServiceMock.buscarPorId.mockReturnValue(of({ nombreCliente: 'X', empresa: '' }));
      usuarioServiceMock.buscarPorId.mockReturnValue(of({ nombre: 'X' }));
      await compilar();
      expect(component.noEsAsesor).toBe(true);
    });
  });

  // ── getTipoConfig ──────────────────────────────────────────────────────────

  describe('getTipoConfig()', () => {
    beforeEach(async () => {
      setup();
      await compilar();
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

  // ── Output cerrar ──────────────────────────────────────────────────────────

  describe('output cerrar', () => {
    it('debería emitir el evento al host al llamar cerrar.emit()', async () => {
      setup();
      await compilar();
      component.cerrar.emit();
      fixture.detectChanges();
      expect(host.cerrado).toBe(true);
    });
  });
});
