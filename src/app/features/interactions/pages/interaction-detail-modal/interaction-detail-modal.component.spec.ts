import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractionDetailModalComponent } from './interaction-detail-modal.component';

describe('InteractionDetailModalComponent', () => {
  let component: InteractionDetailModalComponent;
  let fixture: ComponentFixture<InteractionDetailModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InteractionDetailModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InteractionDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
