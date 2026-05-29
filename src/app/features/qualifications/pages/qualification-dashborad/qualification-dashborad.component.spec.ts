import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { vi } from 'vitest';
import { of } from 'rxjs';

import { QualificationDashboradComponent } from './qualification-dashborad.component';
import { CalificacionService } from '../../../../core/services/calificacion.service';
import { QualificationBadgeComponent } from '../qualification-badge/qualification-badge.component';
import { QualificationProgressBarComponent } from '../qualification-progress-bar/qualification-progress-bar.component';
import {
  QualificationClient,
  QualificationLevel,
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

const clientesMock: QualificationClient[] = [
  {
    id: 1,
    clienteId: 101,
    puntaje: 90,
    clasificacion: 'VIP',
    ultimaActualizacion: '2024-01-01',
    clienteNombre: 'Ana López',
  },
  {
    id: 2,
    clienteId: 102,
    puntaje: 60,
    clasificacion: 'CALIENTE',
    ultimaActualizacion: '2024-01-02',
    clienteNombre: 'Carlos Ruiz',
  },
  {
    id: 3,
    clienteId: 103,
    puntaje: 10,
    clasificacion: 'FRIO',
    ultimaActualizacion: '2024-01-03',
    clienteNombre: 'Pedro Gómez',
  },
];

const distribucionMock = {
  distribucion: { FRIO: 1, TIBIO: 0, CALIENTE: 1, VIP: 1 } as Record<QualificationLevel, number>,
};

const calificacionServiceMock = {
  findAll: vi.fn(),
  distribucion: vi.fn(),
  actualizarPuntaje: vi.fn(),
};

describe('QualificationDashboradComponent', () => {
  let component: QualificationDashboradComponent;
  let fixture: ComponentFixture<QualificationDashboradComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    calificacionServiceMock.findAll.mockReturnValue(of(clientesMock));
    calificacionServiceMock.distribucion.mockReturnValue(of(distribucionMock));
    calificacionServiceMock.actualizarPuntaje.mockReturnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [QualificationDashboradComponent],
      providers: [{ provide: CalificacionService, useValue: calificacionServiceMock }],
    })
      .overrideComponent(QualificationDashboradComponent, {
        remove: { imports: [QualificationBadgeComponent, QualificationProgressBarComponent] },
        add: { imports: [QualificationBadgeStub, QualificationProgressBarStub] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(QualificationDashboradComponent);
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

  it('debería iniciar con loading en true', () => {
    expect(component.loading()).toBe(true);
  });

  it('debería iniciar sin filtro activo', () => {
    expect(component.filtroActivo()).toBeNull();
  });

  it('debería iniciar sin edición activa', () => {
    expect(component.editando()).toBeNull();
  });

  it('debería exponer los niveles correctos', () => {
    expect(component.niveles).toEqual(['FRIO', 'TIBIO', 'CALIENTE', 'VIP']);
  });

  describe('cargarDatos() — éxito', () => {
    it('debería llamar a findAll y distribucion', () => {
      fixture.detectChanges();
      expect(calificacionServiceMock.findAll).toHaveBeenCalled();
      expect(calificacionServiceMock.distribucion).toHaveBeenCalled();
    });

    it('debería setear los clientes ordenados por puntaje descendente', () => {
      fixture.detectChanges();
      const puntajes = component.clientes().map((c) => c.puntaje);
      expect(puntajes).toEqual([...puntajes].sort((a, b) => b - a));
    });

    it('debería setear la distribución correctamente', () => {
      fixture.detectChanges();
      expect(component.distribucion()).toEqual(distribucionMock.distribucion);
    });

    it('debería poner loading en false', () => {
      fixture.detectChanges();
      expect(component.loading()).toBe(false);
    });
  });

  describe('clientesFiltrados', () => {
    it('debería retornar todos los clientes si no hay filtro activo', () => {
      fixture.detectChanges();
      expect(component.clientesFiltrados.length).toBe(clientesMock.length);
    });

    it('debería filtrar por nivel cuando hay un filtro activo', () => {
      fixture.detectChanges();
      component.filtroActivo.set('VIP');
      expect(component.clientesFiltrados.every((c) => c.clasificacion === 'VIP')).toBe(true);
    });

    it('debería retornar lista vacía si ningún cliente coincide con el filtro', () => {
      fixture.detectChanges();
      component.filtroActivo.set('TIBIO');
      expect(component.clientesFiltrados.length).toBe(0);
    });
  });

  describe('toggleFiltro()', () => {
    it('debería activar el filtro al seleccionar un nivel', () => {
      fixture.detectChanges();
      component.toggleFiltro('CALIENTE');
      expect(component.filtroActivo()).toBe('CALIENTE');
    });

    it('debería desactivar el filtro al seleccionar el mismo nivel activo', () => {
      fixture.detectChanges();
      component.filtroActivo.set('CALIENTE');
      component.toggleFiltro('CALIENTE');
      expect(component.filtroActivo()).toBeNull();
    });

    it('debería cambiar el filtro al seleccionar un nivel diferente', () => {
      fixture.detectChanges();
      component.filtroActivo.set('FRIO');
      component.toggleFiltro('VIP');
      expect(component.filtroActivo()).toBe('VIP');
    });
  });

  describe('iniciarEdicion()', () => {
    it('debería setear el estado de edición con clienteId y puntaje', () => {
      fixture.detectChanges();
      component.iniciarEdicion(clientesMock[0]);
      expect(component.editando()).toEqual({ clienteId: 101, puntaje: 90 });
    });
  });

  describe('guardarPuntaje()', () => {
    it('no debería hacer nada si editando es null', () => {
      fixture.detectChanges();
      component.guardarPuntaje();
      expect(calificacionServiceMock.actualizarPuntaje).not.toHaveBeenCalled();
    });

    it('debería llamar a actualizarPuntaje con los datos correctos', () => {
      fixture.detectChanges();
      component.editando.set({ clienteId: 101, puntaje: 95 });
      component.guardarPuntaje();
      expect(calificacionServiceMock.actualizarPuntaje).toHaveBeenCalledWith(101, 95);
    });

    it('debería limpiar la edición tras guardar', () => {
      fixture.detectChanges();
      component.editando.set({ clienteId: 101, puntaje: 95 });
      component.guardarPuntaje();
      expect(component.editando()).toBeNull();
    });

    it('debería recargar los datos tras guardar', () => {
      fixture.detectChanges();
      vi.clearAllMocks();
      calificacionServiceMock.findAll.mockReturnValue(of(clientesMock));
      calificacionServiceMock.distribucion.mockReturnValue(of(distribucionMock));
      calificacionServiceMock.actualizarPuntaje.mockReturnValue(of(void 0));
      component.editando.set({ clienteId: 101, puntaje: 95 });
      component.guardarPuntaje();
      expect(calificacionServiceMock.findAll).toHaveBeenCalled();
    });
  });

  describe('iniciales()', () => {
    it('debería retornar "?" si el nombre es undefined', () => {
      expect(component.iniciales(undefined)).toBe('?');
    });

    it('debería retornar "?" si el nombre está vacío', () => {
      expect(component.iniciales('')).toBe('?');
    });

    it('debería retornar las iniciales en mayúscula de un nombre compuesto', () => {
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
