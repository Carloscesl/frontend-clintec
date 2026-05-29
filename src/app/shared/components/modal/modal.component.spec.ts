import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { BehaviorSubject } from 'rxjs';
import { firstValueFrom } from 'rxjs';

import { ModalComponent } from './modal.component';
import { ModalService } from '../../services/modal.service';

// ── Mocks ──────────────────────────────────────────────────────────────────

const visibleSubject = new BehaviorSubject<boolean>(false);
const messageSubject = new BehaviorSubject<string>('');
const typeSubject = new BehaviorSubject<'success' | 'error' | 'warning'>('success');

const modalServiceMock = {
  visible$: visibleSubject.asObservable(),
  message$: messageSubject.asObservable(),
  type$: typeSubject.asObservable(),
  close: vi.fn(),
};

// ── Suite ──────────────────────────────────────────────────────────────────

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();

    visibleSubject.next(false);
    messageSubject.next('');
    typeSubject.next('success');

    await TestBed.configureTestingModule({
      imports: [ModalComponent],
      providers: [{ provide: ModalService, useValue: modalServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Creación ─────────────────────────────────────────────────────────────

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  // ── Observables del servicio ──────────────────────────────────────────────

  describe('exposición de observables del servicio', () => {
    it('debería exponer visible$ del servicio', async () => {
      const visible = await firstValueFrom(component.visible$);
      expect(visible).toBe(false);
    });

    it('debería reflejar cambios en visible$', async () => {
      visibleSubject.next(true);
      const visible = await firstValueFrom(component.visible$);
      expect(visible).toBe(true);
    });

    it('debería exponer message$ del servicio', async () => {
      messageSubject.next('Mensaje de prueba');
      const message = await firstValueFrom(component.message$);
      expect(message).toBe('Mensaje de prueba');
    });

    it('debería exponer type$ del servicio', async () => {
      typeSubject.next('error');
      const type = await firstValueFrom(component.type$);
      expect(type).toBe('error');
    });
  });

  // ── close() ───────────────────────────────────────────────────────────────

  describe('close()', () => {
    it('debería llamar a modalService.close() al invocar close()', () => {
      component.close();
      expect(modalServiceMock.close).toHaveBeenCalledTimes(1);
    });

    it('debería delegar completamente el cierre al servicio', () => {
      component.close();
      component.close();
      expect(modalServiceMock.close).toHaveBeenCalledTimes(2);
    });
  });
});
