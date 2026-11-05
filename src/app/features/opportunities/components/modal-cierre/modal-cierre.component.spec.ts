import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ModalCierreComponent } from './modal-cierre.component';
import { OportunidadResponse } from '../../../../core/models/oportunidad.model';

// ── Datos de prueba ────────────────────────────────────────────────────────

const oportunidadMock: OportunidadResponse = {
  idOportunidad: 1,
  clienteId: 10,
  asesorId: 5,
  descripcion: 'Oportunidad de prueba',
  valorEstimado: 50000,
  probabilidad: 90,
  etapa: 'CIERRE_GANADO',
  estado: 'ACTIVA',
  esPotencial: false,
  ventaId: null,
  fechaCierreEstimada: '2024-12-31T00:00:00',
  fechaCreacion: '2024-01-01T00:00:00',
  fechaActualizacion: '2024-06-01T00:00:00',
};

// ── Suite ──────────────────────────────────────────────────────────────────

describe('ModalCierreComponent', () => {
  let component: ModalCierreComponent;
  let fixture: ComponentFixture<ModalCierreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalCierreComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalCierreComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('oportunidad', oportunidadMock);
    fixture.componentRef.setInput('tipoCierre', 'CIERRE_GANADO');
  });

  // ── Creación ───────────────────────────────────────────────────────────────

  it('debería crearse', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ── Getters — CIERRE_GANADO ────────────────────────────────────────────────

  describe('getters con tipoCierre CIERRE_GANADO', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('tipoCierre', 'CIERRE_GANADO');
      fixture.detectChanges();
    });

    it('esGanado debería ser true', () => {
      expect(component.esGanado).toBe(true);
    });

    it('titulo debería indicar cierre ganado', () => {
      expect(component.titulo).toBe('OPPORTUNITIES.CLOSE_MODAL.TITLE_WON');
    });

    it('mensaje debería confirmar éxito', () => {
      expect(component.mensaje).toBe('OPPORTUNITIES.CLOSE_MODAL.MSG_WON');
    });

    it('colorHeader debería usar color verde', () => {
      expect(component.colorHeader).toContain('#10b981');
    });
  });

  // ── Getters — CIERRE_PERDIDO ───────────────────────────────────────────────

  describe('getters con tipoCierre CIERRE_PERDIDO', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('tipoCierre', 'CIERRE_PERDIDO');
      fixture.detectChanges();
    });

    it('esGanado debería ser false', () => {
      expect(component.esGanado).toBe(false);
    });

    it('titulo debería indicar cierre perdido', () => {
      expect(component.titulo).toBe('OPPORTUNITIES.CLOSE_MODAL.TITLE_LOST');
    });

    it('mensaje debería indicar sin éxito', () => {
      expect(component.mensaje).toBe('OPPORTUNITIES.CLOSE_MODAL.MSG_LOST');
    });

    it('colorHeader debería usar color rojo', () => {
      expect(component.colorHeader).toContain('#ef4444');
    });
  });

  // ── confirmar() ────────────────────────────────────────────────────────────

  describe('confirmar()', () => {
    it('debería emitir GANADA cuando tipoCierre es CIERRE_GANADO', () => {
      fixture.componentRef.setInput('tipoCierre', 'CIERRE_GANADO');
      fixture.detectChanges();

      const spy = vi.fn();
      component.confirmado.subscribe(spy);

      component.confirmar();
      expect(spy).toHaveBeenCalledWith('GANADA');
    });

    it('debería emitir PERDIDA cuando tipoCierre es CIERRE_PERDIDO', () => {
      fixture.componentRef.setInput('tipoCierre', 'CIERRE_PERDIDO');
      fixture.detectChanges();

      const spy = vi.fn();
      component.confirmado.subscribe(spy);

      component.confirmar();
      expect(spy).toHaveBeenCalledWith('PERDIDA');
    });
  });

  // ── cerrar() ───────────────────────────────────────────────────────────────

  describe('cerrar()', () => {
    it('debería emitir el evento cancelado', () => {
      fixture.detectChanges();
      const spy = vi.fn();
      component.cancelado.subscribe(spy);

      component.cerrar();
      expect(spy).toHaveBeenCalled();
    });
  });
});
