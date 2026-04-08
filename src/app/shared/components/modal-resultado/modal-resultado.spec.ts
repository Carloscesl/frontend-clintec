import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalResultado } from './modal-resultado';

describe('ModalResultado', () => {
  let component: ModalResultado;
  let fixture: ComponentFixture<ModalResultado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalResultado]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalResultado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
