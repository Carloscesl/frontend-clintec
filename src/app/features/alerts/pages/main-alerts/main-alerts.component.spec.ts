import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainAlertsComponent } from './main-alerts.component';

describe('MainAlertsComponent', () => {
  let component: MainAlertsComponent;
  let fixture: ComponentFixture<MainAlertsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainAlertsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainAlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
