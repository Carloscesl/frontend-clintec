import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualificationProgressBarComponent } from './qualification-progress-bar.component';
import {
  QUALIFICATION_CONFIG,
  QualificationLevel,
} from '../../../../core/models/calificacion.model';

// ── Suite ──────────────────────────────────────────────────────────────────

describe('QualificationProgressBarComponent', () => {
  let component: QualificationProgressBarComponent;
  let fixture: ComponentFixture<QualificationProgressBarComponent>;

  const montarCon = async (nivel: QualificationLevel, puntaje: number) => {
    await TestBed.configureTestingModule({
      imports: [QualificationProgressBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QualificationProgressBarComponent);
    component = fixture.componentInstance;
    component.nivel = nivel;
    component.puntaje = puntaje;
    fixture.detectChanges();
  };

  // ── Creación ───────────────────────────────────────────────────────────────

  it('debería crearse', async () => {
    await montarCon('FRIO', 10);
    expect(component).toBeTruthy();
  });

  // ── Inputs ────────────────────────────────────────────────────────────────

  describe('inputs', () => {
    it('debería recibir el puntaje correctamente', async () => {
      await montarCon('CALIENTE', 65);
      expect(component.puntaje).toBe(65);
    });

    it('debería recibir el nivel correctamente', async () => {
      await montarCon('VIP', 90);
      expect(component.nivel).toBe('VIP');
    });
  });

  // ── Getter config ──────────────────────────────────────────────────────────

  describe('config', () => {
    it('debería retornar la config de FRIO', async () => {
      await montarCon('FRIO', 10);
      expect(component.config).toEqual(QUALIFICATION_CONFIG['FRIO']);
    });

    it('debería retornar la config de TIBIO', async () => {
      await montarCon('TIBIO', 35);
      expect(component.config).toEqual(QUALIFICATION_CONFIG['TIBIO']);
    });

    it('debería retornar la config de CALIENTE', async () => {
      await montarCon('CALIENTE', 60);
      expect(component.config).toEqual(QUALIFICATION_CONFIG['CALIENTE']);
    });

    it('debería retornar la config de VIP', async () => {
      await montarCon('VIP', 90);
      expect(component.config).toEqual(QUALIFICATION_CONFIG['VIP']);
    });
  });

  // ── Rangos del config ─────────────────────────────────────────────────────

  describe('rangos min/max del config', () => {
    it('FRIO debería tener min 0 y max 25', async () => {
      await montarCon('FRIO', 10);
      expect(component.config.min).toBe(0);
      expect(component.config.max).toBe(25);
    });

    it('TIBIO debería tener min 26 y max 50', async () => {
      await montarCon('TIBIO', 35);
      expect(component.config.min).toBe(26);
      expect(component.config.max).toBe(50);
    });

    it('CALIENTE debería tener min 51 y max 75', async () => {
      await montarCon('CALIENTE', 60);
      expect(component.config.min).toBe(51);
      expect(component.config.max).toBe(75);
    });

    it('VIP debería tener min 76 y max 100', async () => {
      await montarCon('VIP', 90);
      expect(component.config.min).toBe(76);
      expect(component.config.max).toBe(100);
    });
  });
});
