import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsesorDashboardComponent } from './asesor-dashboard.component';

describe('AsesorDashboardComponent', () => {
  let component: AsesorDashboardComponent;
  let fixture: ComponentFixture<AsesorDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsesorDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsesorDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
