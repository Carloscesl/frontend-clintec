import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualificationDashboradComponent } from './qualification-dashborad.component';

describe('QualificationDashboradComponent', () => {
  let component: QualificationDashboradComponent;
  let fixture: ComponentFixture<QualificationDashboradComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QualificationDashboradComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QualificationDashboradComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
