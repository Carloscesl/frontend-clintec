import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCierreComponent } from './modal-cierre.component';

describe('ModalCierreComponent', () => {
  let component: ModalCierreComponent;
  let fixture: ComponentFixture<ModalCierreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalCierreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalCierreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
