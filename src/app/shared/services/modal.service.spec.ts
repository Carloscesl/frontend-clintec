import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { firstValueFrom } from 'rxjs';

import { ModalService } from './modal.service';

// ── Suite ──────────────────────────────────────────────────────────────────

describe('ModalService', () => {
  let service: ModalService;

  beforeEach(() => {
    vi.useFakeTimers();

    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Creación ─────────────────────────────────────────────────────────────

  it('debería crearse', () => {
    expect(service).toBeTruthy();
  });

  // ── Estado inicial ────────────────────────────────────────────────────────

  describe('estado inicial', () => {
    it('debería iniciar con visible$ en false', async () => {
      const visible = await firstValueFrom(service.visible$);
      expect(visible).toBe(false);
    });

    it('debería iniciar con message$ vacío', async () => {
      const message = await firstValueFrom(service.message$);
      expect(message).toBe('');
    });

    it('debería iniciar con type$ en "success"', async () => {
      const type = await firstValueFrom(service.type$);
      expect(type).toBe('success');
    });
  });

  // ── show() ────────────────────────────────────────────────────────────────

  describe('show()', () => {
    it('debería poner visible$ en true al llamar show()', async () => {
      service.show('Mensaje de prueba');
      const visible = await firstValueFrom(service.visible$);
      expect(visible).toBe(true);
    });

    it('debería emitir el mensaje correcto en message$', async () => {
      service.show('Operación exitosa');
      const message = await firstValueFrom(service.message$);
      expect(message).toBe('Operación exitosa');
    });

    it('debería usar "success" como tipo por defecto', async () => {
      service.show('Mensaje sin tipo');
      const type = await firstValueFrom(service.type$);
      expect(type).toBe('success');
    });

    it('debería emitir el tipo "error" cuando se especifica', async () => {
      service.show('Algo salió mal', 'error');
      const type = await firstValueFrom(service.type$);
      expect(type).toBe('error');
    });

    it('debería emitir el tipo "warning" cuando se especifica', async () => {
      service.show('Advertencia', 'warning');
      const type = await firstValueFrom(service.type$);
      expect(type).toBe('warning');
    });

    it('debería cerrar automáticamente después de 3000ms', async () => {
      service.show('Mensaje temporal');
      vi.advanceTimersByTime(3000);
      const visible = await firstValueFrom(service.visible$);
      expect(visible).toBe(false);
    });

    it('no debería cerrar antes de los 3000ms', async () => {
      service.show('Mensaje temporal');
      vi.advanceTimersByTime(2999);
      const visible = await firstValueFrom(service.visible$);
      expect(visible).toBe(true);
    });
  });

  // ── close() ───────────────────────────────────────────────────────────────

  describe('close()', () => {
    it('debería poner visible$ en false al llamar close()', async () => {
      service.show('Mensaje de prueba');
      service.close();
      const visible = await firstValueFrom(service.visible$);
      expect(visible).toBe(false);
    });

    it('debería poder cerrarse antes del timeout automático', async () => {
      service.show('Mensaje de prueba');
      vi.advanceTimersByTime(1000);
      service.close();
      const visible = await firstValueFrom(service.visible$);
      expect(visible).toBe(false);
    });
  });
});
