import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualificationBadgeComponent } from './qualification-badge.component';
import {
  QUALIFICATION_CONFIG,
  QualificationLevel,
} from '../../../../core/models/calificacion.model';

// ── Suite ──────────────────────────────────────────────────────────────────

describe('QualificationBadgeComponent', () => {
  let component: QualificationBadgeComponent;
  let fixture: ComponentFixture<QualificationBadgeComponent>;

  const montarCon = async (nivel: QualificationLevel) => {
    await TestBed.configureTestingModule({
      imports: [QualificationBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QualificationBadgeComponent);
    component = fixture.componentInstance;
    component.nivel = nivel;
    fixture.detectChanges();
  };

  // ── Creación ───────────────────────────────────────────────────────────────

  it('debería crearse', async () => {
    await montarCon('FRIO');
    expect(component).toBeTruthy();
  });

  // ── Getter config ──────────────────────────────────────────────────────────

  describe('config', () => {
    it('debería retornar la config de FRIO', async () => {
      await montarCon('FRIO');
      expect(component.config).toEqual(QUALIFICATION_CONFIG['FRIO']);
    });

    it('debería retornar la config de TIBIO', async () => {
      await montarCon('TIBIO');
      expect(component.config).toEqual(QUALIFICATION_CONFIG['TIBIO']);
    });

    it('debería retornar la config de CALIENTE', async () => {
      await montarCon('CALIENTE');
      expect(component.config).toEqual(QUALIFICATION_CONFIG['CALIENTE']);
    });

    it('debería retornar la config de VIP', async () => {
      await montarCon('VIP');
      expect(component.config).toEqual(QUALIFICATION_CONFIG['VIP']);
    });
  });

  // ── Valores del config ─────────────────────────────────────────────────────

  describe('valores de config por nivel', () => {
    it('FRIO debería tener label "Frío" e icono "❄️"', async () => {
      await montarCon('FRIO');
      expect(component.config.label).toBe('Frío');
      expect(component.config.icon).toBe('❄️');
    });

    it('TIBIO debería tener label "Tibio" e icono "🌤️"', async () => {
      await montarCon('TIBIO');
      expect(component.config.label).toBe('Tibio');
      expect(component.config.icon).toBe('🌤️');
    });

    it('CALIENTE debería tener label "Caliente" e icono "🔥"', async () => {
      await montarCon('CALIENTE');
      expect(component.config.label).toBe('Caliente');
      expect(component.config.icon).toBe('🔥');
    });

    it('VIP debería tener label "VIP" e icono "👑"', async () => {
      await montarCon('VIP');
      expect(component.config.label).toBe('VIP');
      expect(component.config.icon).toBe('👑');
    });
  });
});
