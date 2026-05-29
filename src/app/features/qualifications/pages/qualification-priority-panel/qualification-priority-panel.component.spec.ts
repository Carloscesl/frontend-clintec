import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { QualificationPriorityPanelComponent } from './qualification-priority-panel.component';
import { CalificacionService } from '../../../../core/services/calificacion.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { QualificationBadgeComponent } from '../qualification-badge/qualification-badge.component';
import { QualificationProgressBarComponent } from '../qualification-progress-bar/qualification-progress-bar.component';
import { QualificationClient } from '../../../../core/models/calificacion.model';

@Component({ selector: 'app-qualification-badge', template: '', standalone: true })
class QualificationBadgeStub {
  @Input() nivel: any;
}

@Component({ selector: 'app-qualification-progress-bar', template: '', standalone: true })
class QualificationProgressBarStub {
  @Input() puntaje: any;
  @Input() nivel: any;
}

const calificacionesMock: QualificationClient[] = [
  { id: 1, clienteId: 101, puntaje: 95, clasificacion: 'VIP', ultimaActualizacion: '2024-01-01' },
  { id: 2, clienteId: 102, puntaje: 80, clasificacion: 'VIP', ultimaActualizacion: '2024-01-02' },
  {
    id: 3,
    clienteId: 103,
    puntaje: 70,
    clasificacion: 'CALIENTE',
    ultimaActualizacion: '2024-01-03',
  },
];

const clienteMock = (id: number) => ({
  clienteId: id,
  nombreCliente: `Cliente ${id}`,
  empresa: `Empresa ${id}`,
});

const calificacionServiceMock = { findTopN: vi.fn() };
const clienteServiceMock = { buscarPorId: vi.fn() };

describe('QualificationPriorityPanelComponent', () => {
  let component: QualificationPriorityPanelComponent;
  let fixture: ComponentFixture<QualificationPriorityPanelComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    calificacionServiceMock.findTopN.mockReturnValue(of(calificacionesMock));
    clienteServiceMock.buscarPorId.mockImplementation((id: number) => of(clienteMock(id)));

    await TestBed.configureTestingModule({
      imports: [QualificationPriorityPanelComponent],
      providers: [
        { provide: CalificacionService, useValue: calificacionServiceMock },
        { provide: ClienteService, useValue: clienteServiceMock },
      ],
    })
      .overrideComponent(QualificationPriorityPanelComponent, {
        remove: { imports: [QualificationBadgeComponent, QualificationProgressBarComponent] },
        add: { imports: [QualificationBadgeStub, QualificationProgressBarStub] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(QualificationPriorityPanelComponent);
    component = fixture.componentInstance;
    (component as any).config = {
      FRIO: { color: 'blue', bg: 'blue', icon: '❄️', label: 'Frio' },
      TIBIO: { color: 'orange', bg: 'orange', icon: '🌤️', label: 'Tibio' },
      CALIENTE: { color: 'red', bg: 'red', icon: '🔥', label: 'Caliente' },
      VIP: { color: 'purple', bg: 'purple', icon: '👑', label: 'VIP' },
    };
  });

  it('debería crearse', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('debería iniciar con top5 vacío', () => {
    expect(component.top5()).toEqual([]);
  });

  describe('ngOnInit() — éxito', () => {
    it('debería llamar a findTopN con 5', () => {
      fixture.detectChanges();
      expect(calificacionServiceMock.findTopN).toHaveBeenCalledWith(5);
    });

    it('debería llamar a buscarPorId por cada calificación', () => {
      fixture.detectChanges();
      expect(clienteServiceMock.buscarPorId).toHaveBeenCalledTimes(calificacionesMock.length);
    });

    it('debería poblar top5 con los datos combinados', () => {
      fixture.detectChanges();
      expect(component.top5().length).toBe(calificacionesMock.length);
    });

    it('debería asignar clienteNombre correctamente', () => {
      fixture.detectChanges();
      expect(component.top5()[0].clienteNombre).toBe('Cliente 101');
    });

    it('debería asignar clienteEmpresa correctamente', () => {
      fixture.detectChanges();
      expect(component.top5()[0].clienteEmpresa).toBe('Empresa 101');
    });

    it('debería asignar clienteIniciales correctamente', () => {
      fixture.detectChanges();
      expect(component.top5()[0].clienteIniciales).toBeTruthy();
    });
  });

  describe('ngOnInit() — lista vacía', () => {
    it('debería dejar top5 vacío si findTopN retorna []', () => {
      calificacionServiceMock.findTopN.mockReturnValue(of([]));
      fixture.detectChanges();
      expect(component.top5()).toEqual([]);
    });

    it('no debería llamar a buscarPorId si no hay calificaciones', () => {
      calificacionServiceMock.findTopN.mockReturnValue(of([]));
      fixture.detectChanges();
      expect(clienteServiceMock.buscarPorId).not.toHaveBeenCalled();
    });
  });

  describe('ngOnInit() — error en findTopN', () => {
    it('no debería lanzar error si falla el servicio', () => {
      calificacionServiceMock.findTopN.mockReturnValue(throwError(() => new Error('Error de red')));
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('debería mantener top5 vacío si ocurre un error', () => {
      calificacionServiceMock.findTopN.mockReturnValue(throwError(() => new Error('Error de red')));
      fixture.detectChanges();
      expect(component.top5()).toEqual([]);
    });
  });

  describe('ngOnInit() — cliente sin nombre o empresa', () => {
    it('debería usar "Sin nombre" si el cliente no tiene nombreCliente', () => {
      clienteServiceMock.buscarPorId.mockReturnValue(of({ clienteId: 101 }));
      fixture.detectChanges();
      expect(component.top5()[0].clienteNombre).toBe('Sin nombre');
    });

    it('debería usar cadena vacía si el cliente no tiene empresa', () => {
      clienteServiceMock.buscarPorId.mockReturnValue(of({ clienteId: 101, nombreCliente: 'Ana' }));
      fixture.detectChanges();
      expect(component.top5()[0].clienteEmpresa).toBe('');
    });
  });

  describe('iniciales()', () => {
    it('debería retornar "?" si el nombre es undefined', () => {
      expect(component.iniciales(undefined)).toBe('?');
    });

    it('debería retornar "?" si el nombre es vacío', () => {
      expect(component.iniciales('')).toBe('?');
    });

    it('debería retornar las iniciales en mayúscula', () => {
      expect(component.iniciales('Ana López')).toBe('AL');
    });

    it('debería tomar solo las dos primeras palabras', () => {
      expect(component.iniciales('Carlos Alberto Ruiz')).toBe('CA');
    });

    it('debería manejar nombres de una sola palabra', () => {
      expect(component.iniciales('Pedro')).toBe('P');
    });
  });
});
