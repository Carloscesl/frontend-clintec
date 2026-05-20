import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalProbabilidadComponent } from './modal-probabilidad.component';

describe('ModalProbabilidadComponent', () => {
  let component: ModalProbabilidadComponent;
  let fixture: ComponentFixture<ModalProbabilidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalProbabilidadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalProbabilidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
