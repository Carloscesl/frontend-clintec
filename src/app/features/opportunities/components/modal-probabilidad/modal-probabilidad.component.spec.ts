import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { ModalProbabilidadComponent } from './modal-probabilidad.component';
import { OportunidadService } from '../../../../core/services/oportunidad.service';

// ── Mocks de servicios ─────────────────────────────────────────────────────

const oportunidadServiceMock = { ajustarProbabilidad: vi.fn() };

// ── Suite ──────────────────────────────────────────────────────────────────

describe('ModalProbabilidadComponent', () => {
  let component: ModalProbabilidadComponent;
  let fixture: ComponentFixture<ModalProbabilidadComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [ModalProbabilidadComponent],
      providers: [{ provide: OportunidadService, useValue: oportunidadServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalProbabilidadComponent);
    component = fixture.componentInstance;

    component.oportunidadId = 1;
    component.etapa = 'PROPUESTA';
    component.probabilidadActual = 50;
  });

  // ── Creación ───────────────────────────────────────────────────────────────

  it('debería crearse', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ── Estado inicial ─────────────────────────────────────────────────────────

  it('debería iniciar con guardando en false', () => {
    fixture.detectChanges();
    expect(component.guardando()).toBe(false);
  });

  it('debería iniciar sin error', () => {
    fixture.detectChanges();
    expect(component.error()).toBeNull();
  });

  it('debería parchear el formulario con probabilidadActual en ngOnInit', () => {
    fixture.detectChanges();
    expect(component.form.get('probabilidad')?.value).toBe(50);
  });

  // ── rango ──────────────────────────────────────────────────────────────────

  describe('rango', () => {
    it('debería retornar min: 41, max: 60, default: 50 para etapa PROPUESTA', () => {
      fixture.detectChanges();
      expect(component.rango).toEqual({ min: 41, max: 60, default: 50 });
    });
  });

  // ── valorActual ────────────────────────────────────────────────────────────

  describe('valorActual', () => {
    it('debería retornar el valor actual del formulario', () => {
      fixture.detectChanges();
      component.form.patchValue({ probabilidad: 55 });
      expect(component.valorActual).toBe(55);
    });
  });

  // ── getColor() ─────────────────────────────────────────────────────────────

  describe('getColor()', () => {
    beforeEach(() => fixture.detectChanges());

    it('debería retornar azul para valor 10 (<=20)', () => {
      expect(component.getColor(10)).toBe('#3B82F6');
    });

    it('debería retornar púrpura para valor 30 (<=40)', () => {
      expect(component.getColor(30)).toBe('#A855F7');
    });

    it('debería retornar cyan para valor 55 (<=60)', () => {
      expect(component.getColor(55)).toBe('#06B6D4');
    });

    it('debería retornar amarillo para valor 75 (<=85)', () => {
      expect(component.getColor(75)).toBe('#F59E0B');
    });

    it('debería retornar verde para valor 90 (>85)', () => {
      expect(component.getColor(90)).toBe('#10B981');
    });
  });

  // ── resetearDefault() ──────────────────────────────────────────────────────

  describe('resetearDefault()', () => {
    it('debería setear el formulario al valor default del rango de la etapa', () => {
      fixture.detectChanges();
      component.form.patchValue({ probabilidad: 55 });
      component.resetearDefault();
      expect(component.form.get('probabilidad')?.value).toBe(50);
    });
  });

  // ── submit() — formulario inválido ─────────────────────────────────────────

  describe('submit() — formulario inválido', () => {
    it('no debería llamar al servicio si el formulario es inválido', () => {
      fixture.detectChanges();
      component.form.patchValue({ probabilidad: null });
      component.submit();
      expect(oportunidadServiceMock.ajustarProbabilidad).not.toHaveBeenCalled();
    });

    it('debería marcar el control como touched si el formulario es inválido', () => {
      fixture.detectChanges();
      component.form.patchValue({ probabilidad: null });
      component.submit();
      expect(component.f['probabilidad'].touched).toBe(true);
    });
  });

  // ── submit() — éxito ───────────────────────────────────────────────────────

  describe('submit() — éxito', () => {
    beforeEach(() => {
      oportunidadServiceMock.ajustarProbabilidad.mockReturnValue(of({ probabilidad: 55 }));
      fixture.detectChanges();
      component.form.patchValue({ probabilidad: 55 });
    });

    it('debería llamar a ajustarProbabilidad con id y valor correctos', () => {
      component.submit();
      expect(oportunidadServiceMock.ajustarProbabilidad).toHaveBeenCalledWith(1, 55);
    });

    it('debería emitir el evento guardado con la nueva probabilidad', () => {
      const spy = vi.fn();
      component.guardado.subscribe(spy);
      component.submit();
      expect(spy).toHaveBeenCalledWith(55);
    });

    it('debería poner guardando en false tras el éxito', () => {
      component.submit();
      expect(component.guardando()).toBe(false);
    });
  });

  // ── submit() — error ───────────────────────────────────────────────────────

  describe('submit() — error', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.form.patchValue({ probabilidad: 55 });
    });

    it('debería setear el mensaje de error del servidor', () => {
      oportunidadServiceMock.ajustarProbabilidad.mockReturnValue(
        throwError(() => ({ error: { message: 'Error del servidor' } })),
      );
      component.submit();
      expect(component.error()).toBe('Error del servidor');
    });

    it('debería usar mensaje genérico si no hay error.message', () => {
      oportunidadServiceMock.ajustarProbabilidad.mockReturnValue(throwError(() => ({ error: {} })));
      component.submit();
      expect(component.error()).toBe('Error al actualizar la probabilidad');
    });

    it('debería poner guardando en false tras el error', () => {
      oportunidadServiceMock.ajustarProbabilidad.mockReturnValue(throwError(() => ({ error: {} })));
      component.submit();
      expect(component.guardando()).toBe(false);
    });
  });
});
