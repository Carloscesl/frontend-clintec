import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualificationPriorityPanelComponent } from './qualification-priority-panel.component';

describe('QualificationPriorityPanelComponent', () => {
  let component: QualificationPriorityPanelComponent;
  let fixture: ComponentFixture<QualificationPriorityPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QualificationPriorityPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QualificationPriorityPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
