import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GerenteDashboard } from './gerente-dashboard';

describe('GerenteDashboard', () => {
  let component: GerenteDashboard;
  let fixture: ComponentFixture<GerenteDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GerenteDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GerenteDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
