import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { DetailModalAlertsComponent } from './detail-modal-alerts.component';
import { AlertaService } from '../../../../core/services/alerta.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AlertaResponse, TipoAlerta } from '../../../../core/models/alerta.model';

// ── Datos de prueba ────────────────────────────────────────────────────────

const alertaMock: AlertaResponse = {
  id: 1,
  clienteId: 10,
  usuarioId: 20,
  descripcion: 'Alerta de prueba',
  tipo: 'SEGUIMIENTO',
  estado: 'PENDIENTE',
  fechaVencimiento: '2024-02-01T00:00:00',
  fecha: '2024-01-15T10:00:00',
  fechaActualizacion: '2024-01-15T10:00:00',
};

// ── Host para signal input requerido ──────────────────────────────────────

@Component({
  standalone: true,
  imports: [DetailModalAlertsComponent],
  template: `<app-detail-modal-alerts [alertaId]="alertaId" (cerrar)="onCerrar()" />`,
})
class HostComponent {
  alertaId = 1;
  cerrado = false;
  onCerrar() {
    this.cerrado = true;
  }
}

// ── Mocks de servicios ─────────────────────────────────────────────────────

const alertaServiceMock = { buscarPorId: vi.fn() };
const clienteServiceMock = { buscarPorId: vi.fn() };
const usuarioServiceMock = { buscarPorId: vi.fn() };
const authServiceMock = {
  obtenerRol: vi.fn(),
  obtenerUsuario: vi.fn(),
};

// ── Suite ──────────────────────────────────────────────────────────────────

describe('DetailModalAlertsComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let component: DetailModalAlertsComponent;

  function setup(rol = 'ADMINISTRADOR') {
    authServiceMock.obtenerRol.mockReturnValue(rol);
    authServiceMock.obtenerUsuario.mockReturnValue({ username: 'asesor_test' });
    alertaServiceMock.buscarPorId.mockReturnValue(of(alertaMock));
    clienteServiceMock.buscarPorId.mockReturnValue(of({ nombreCliente: 'Empresa Test' }));
    usuarioServiceMock.buscarPorId.mockReturnValue(of({ nombre: 'Juan Asesor' }));
  }

  async function compilar() {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: AlertaService, useValue: alertaServiceMock },
        { provide: ClienteService, useValue: clienteServiceMock },
        { provide: UsuarioService, useValue: usuarioServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();

    component = fixture.debugElement.query(By.directive(DetailModalAlertsComponent))
      .componentInstance as DetailModalAlertsComponent;
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

  it('debería iniciar con loading en true antes de que llegue la respuesta', async () => {
    authServiceMock.obtenerRol.mockReturnValue('ADMINISTRADOR');
    authServiceMock.obtenerUsuario.mockReturnValue(null);
    clienteServiceMock.buscarPorId.mockReturnValue(of({ nombreCliente: 'X' }));
    usuarioServiceMock.buscarPorId.mockReturnValue(of({ nombre: 'X' }));

    let resolver!: (v: AlertaResponse) => void;
    alertaServiceMock.buscarPorId.mockReturnValue(
      new (await import('rxjs')).Observable((obs) => {
        resolver = (v) => obs.next(v);
      }),
    );

    await compilar();
    expect(component.loading()).toBe(true);
    resolver(alertaMock); // limpieza del observable pendiente
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

    it('debería llamar a alertaService.buscarPorId con el id recibido', () => {
      expect(alertaServiceMock.buscarPorId).toHaveBeenCalledWith(1);
    });

    it('debería setear la alerta con los datos retornados', () => {
      expect(component.alerta()).toEqual(alertaMock);
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
      alertaServiceMock.buscarPorId.mockReturnValue(throwError(() => new Error('Error de red')));
      clienteServiceMock.buscarPorId.mockReturnValue(of({ nombreCliente: 'X' }));
      usuarioServiceMock.buscarPorId.mockReturnValue(of({ nombre: 'X' }));
      await compilar();
    });

    it('debería setear el mensaje de error', () => {
      expect(component.error()).toBe('Error al cargar la alerta');
    });

    it('debería poner loading en false', () => {
      expect(component.loading()).toBe(false);
    });

    it('debería dejar alerta en null', () => {
      expect(component.alerta()).toBeNull();
    });
  });

  // ── cargarCliente ──────────────────────────────────────────────────────────

  describe('cargarCliente()', () => {
    it('debería setear clienteNombre con el valor recibido', async () => {
      setup();
      clienteServiceMock.buscarPorId.mockReturnValue(of({ nombreCliente: 'Empresa ABC' }));
      await compilar();
      expect(component.clienteNombre()).toBe('Empresa ABC');
    });

    it('debería setear "Desconocido" cuando nombreCliente viene vacío', async () => {
      setup();
      clienteServiceMock.buscarPorId.mockReturnValue(of({ nombreCliente: '' }));
      await compilar();
      expect(component.clienteNombre()).toBe('Desconocido');
    });

    it('debería setear "Desconocido" cuando el servicio falla', async () => {
      setup();
      await compilar();
      clienteServiceMock.buscarPorId.mockReturnValue(throwError(() => new Error()));
      component.cargarCliente(99);
      expect(component.clienteNombre()).toBe('Desconocido');
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

    it('debería setear "Desconocido" cuando el servicio falla', () => {
      usuarioServiceMock.buscarPorId.mockReturnValue(throwError(() => new Error()));
      component.cargarUsuario(20);
      expect(component.usuarioNombre()).toBe('Desconocido');
    });

    it('debería setear "Desconocido" cuando nombre viene vacío', () => {
      usuarioServiceMock.buscarPorId.mockReturnValue(of({ nombre: '' }));
      component.cargarUsuario(20);
      expect(component.usuarioNombre()).toBe('Desconocido');
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

  // ── getTipoConfig ──────────────────────────────────────────────────────────

  describe('getTipoConfig()', () => {
    beforeEach(async () => {
      setup();
      await compilar();
    });

    const casos: { tipo: TipoAlerta; icon: string; color: string; bg: string }[] = [
      { tipo: 'INACTIVIDAD', icon: '⏳', color: '#856404', bg: '#fff3cd' },
      { tipo: 'VENCIMIENTO', icon: '⚠️', color: '#721c24', bg: '#f8d7da' },
      { tipo: 'SEGUIMIENTO', icon: '🔍', color: '#0c5460', bg: '#d1ecf1' },
      { tipo: 'OPORTUNIDAD', icon: '💡', color: '#155724', bg: '#d4edda' },
    ];

    casos.forEach(({ tipo, icon, color, bg }) => {
      it(`debería retornar la config correcta para ${tipo}`, () => {
        const cfg = component.getTipoConfig(tipo);
        expect(cfg.icon).toBe(icon);
        expect(cfg.color).toBe(color);
        expect(cfg.bg).toBe(bg);
      });
    });
  });

  // ── esAsesor ───────────────────────────────────────────────────────────────

  describe('esAsesor', () => {
    it('debería ser true cuando el rol es ASESOR', async () => {
      setup('ASESOR');
      await compilar();
      expect(component.esAsesor).toBe(true);
    });

    it('debería ser false cuando el rol es ADMINISTRADOR', async () => {
      setup('ADMINISTRADOR');
      await compilar();
      expect(component.esAsesor).toBe(false);
    });

    it('debería ser false cuando obtenerRol retorna null', async () => {
      authServiceMock.obtenerRol.mockReturnValue(null);
      alertaServiceMock.buscarPorId.mockReturnValue(of(alertaMock));
      clienteServiceMock.buscarPorId.mockReturnValue(of({ nombreCliente: 'X' }));
      usuarioServiceMock.buscarPorId.mockReturnValue(of({ nombre: 'X' }));
      authServiceMock.obtenerUsuario.mockReturnValue(null);
      await compilar();
      expect(component.esAsesor).toBe(false);
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
