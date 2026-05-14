import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailModalAlertsComponent } from './detail-modal-alerts.component';

describe('DetailModalAlertsComponent', () => {
  let component: DetailModalAlertsComponent;
  let fixture: ComponentFixture<DetailModalAlertsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailModalAlertsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailModalAlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
