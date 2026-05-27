import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { vi } from 'vitest';
import { of } from 'rxjs';

import { QualificationWidgetComponent } from './qualification-widget.component';
import { CalificacionService } from '../../../../core/services/calificacion.service';
import { QualificationBadgeComponent } from '../qualification-badge/qualification-badge.component';
import { QualificationProgressBarComponent } from '../qualification-progress-bar/qualification-progress-bar.component';
import {
  QualificationClient,
  QualificationHistory,
} from '../../../../core/models/calificacion.model';

@Component({ selector: 'app-qualification-badge', template: '', standalone: true })
class QualificationBadgeStub {
  @Input() nivel: any;
}

@Component({ selector: 'app-qualification-progress-bar', template: '', standalone: true })
class QualificationProgressBarStub {
  @Input() puntaje: any;
  @Input() nivel: any;
}

const calificacionMock: QualificationClient = {
  id: 1,
  clienteId: 101,
  puntaje: 80,
  clasificacion: 'VIP',
  ultimaActualizacion: '2024-01-01',
  clienteNombre: 'Ana López',
};

const historialMock: QualificationHistory[] = [
  {
    id: 1,
    clienteId: 101,
    puntajeAnterior: 70,
    puntajeNuevo: 80,
    motivo: 'VENTA_CERRADA',
    fecha: '2024-01-01',
  },
  {
    id: 2,
    clienteId: 101,
    puntajeAnterior: 60,
    puntajeNuevo: 70,
    motivo: 'INTERACCION_LLAMADA',
    fecha: '2023-12-01',
  },
  {
    id: 3,
    clienteId: 101,
    puntajeAnterior: 50,
    puntajeNuevo: 60,
    motivo: 'ETAPA_PROPUESTA',
    fecha: '2023-11-01',
  },
  {
    id: 4,
    clienteId: 101,
    puntajeAnterior: 40,
    puntajeNuevo: 50,
    motivo: 'INACTIVIDAD_AUTOMATICA',
    fecha: '2023-10-01',
  },
  {
    id: 5,
    clienteId: 101,
    puntajeAnterior: 30,
    puntajeNuevo: 40,
    motivo: 'OTRO_MOTIVO',
    fecha: '2023-09-01',
  },
  {
    id: 6,
    clienteId: 101,
    puntajeAnterior: 20,
    puntajeNuevo: 30,
    motivo: 'ETAPA_NEGOCIACION',
    fecha: '2023-08-01',
  },
];

const calificacionServiceMock = {
  findByClienteId: vi.fn(),
  historialPorCliente: vi.fn(),
  actualizarPuntaje: vi.fn(),
};

describe('QualificationWidgetComponent', () => {
  let component: QualificationWidgetComponent;
  let fixture: ComponentFixture<QualificationWidgetComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    calificacionServiceMock.findByClienteId.mockReturnValue(of(calificacionMock));
    calificacionServiceMock.historialPorCliente.mockReturnValue(of(historialMock));
    calificacionServiceMock.actualizarPuntaje.mockReturnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [QualificationWidgetComponent],
      providers: [{ provide: CalificacionService, useValue: calificacionServiceMock }],
    })
      .overrideComponent(QualificationWidgetComponent, {
        remove: { imports: [QualificationBadgeComponent, QualificationProgressBarComponent] },
        add: { imports: [QualificationBadgeStub, QualificationProgressBarStub] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(QualificationWidgetComponent);
    component = fixture.componentInstance;
    component.clienteId = 101;
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

  it('debería iniciar sin calificación', () => {
    expect(component.calificacion()).toBeNull();
  });

  it('debería iniciar con historial vacío', () => {
    expect(component.historial()).toEqual([]);
  });

  it('debería iniciar sin modo edición', () => {
    expect(component.editando()).toBe(false);
  });

  it('debería iniciar con nuevoPuntaje en 0', () => {
    expect(component.nuevoPuntaje()).toBe(0);
  });

  it('puedeEditar debería ser false por defecto', () => {
    expect(component.puedeEditar).toBe(false);
  });

  describe('cargar() — éxito', () => {
    it('debería llamar a findByClienteId con el clienteId correcto', () => {
      fixture.detectChanges();
      expect(calificacionServiceMock.findByClienteId).toHaveBeenCalledWith(101);
    });

    it('debería llamar a historialPorCliente con el clienteId correcto', () => {
      fixture.detectChanges();
      expect(calificacionServiceMock.historialPorCliente).toHaveBeenCalledWith(101);
    });

    it('debería setear la calificación correctamente', () => {
      fixture.detectChanges();
      expect(component.calificacion()).toEqual(calificacionMock);
    });

    it('debería setear nuevoPuntaje con el puntaje del cliente', () => {
      fixture.detectChanges();
      expect(component.nuevoPuntaje()).toBe(80);
    });

    it('debería limitar el historial a los últimos 5 registros', () => {
      fixture.detectChanges();
      expect(component.historial().length).toBe(5);
    });
  });

  describe('guardar()', () => {
    it('debería llamar a actualizarPuntaje con el clienteId y el nuevo puntaje', () => {
      fixture.detectChanges();
      component.nuevoPuntaje.set(95);
      component.guardar();
      expect(calificacionServiceMock.actualizarPuntaje).toHaveBeenCalledWith(101, 95);
    });

    it('debería desactivar el modo edición tras guardar', () => {
      fixture.detectChanges();
      component.editando.set(true);
      component.guardar();
      expect(component.editando()).toBe(false);
    });

    it('debería recargar los datos tras guardar', () => {
      fixture.detectChanges();
      vi.clearAllMocks();
      calificacionServiceMock.findByClienteId.mockReturnValue(of(calificacionMock));
      calificacionServiceMock.historialPorCliente.mockReturnValue(of(historialMock));
      calificacionServiceMock.actualizarPuntaje.mockReturnValue(of(void 0));
      component.guardar();
      expect(calificacionServiceMock.findByClienteId).toHaveBeenCalledWith(101);
    });
  });

  describe('motivoLabel()', () => {
    it('debería retornar "🏆 Venta cerrada" para VENTA_CERRADA', () => {
      expect(component.motivoLabel('VENTA_CERRADA')).toBe('🏆 Venta cerrada');
    });

    it('debería retornar "⏰ Inactividad" para INACTIVIDAD_AUTOMATICA', () => {
      expect(component.motivoLabel('INACTIVIDAD_AUTOMATICA')).toBe('⏰ Inactividad');
    });

    it('debería formatear motivos que empiezan con INTERACCION_', () => {
      expect(component.motivoLabel('INTERACCION_LLAMADA')).toBe('💬 llamada');
    });

    it('debería retornar "📈 Avance de etapa" para motivos que empiezan con ETAPA_', () => {
      expect(component.motivoLabel('ETAPA_PROPUESTA')).toBe('📈 Avance de etapa');
    });

    it('debería retornar el motivo sin cambios si no coincide con ningún patrón', () => {
      expect(component.motivoLabel('OTRO_MOTIVO')).toBe('OTRO_MOTIVO');
    });
  });
});
