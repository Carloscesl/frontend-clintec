import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualificationBadgeComponent } from './qualification-badge.component';

describe('QualificationBadgeComponent', () => {
  let component: QualificationBadgeComponent;
  let fixture: ComponentFixture<QualificationBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QualificationBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QualificationBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
