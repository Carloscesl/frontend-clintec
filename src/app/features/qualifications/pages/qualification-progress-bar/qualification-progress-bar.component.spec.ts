import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualificationProgressBarComponent } from './qualification-progress-bar.component';

describe('QualificationProgressBarComponent', () => {
  let component: QualificationProgressBarComponent;
  let fixture: ComponentFixture<QualificationProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QualificationProgressBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QualificationProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
