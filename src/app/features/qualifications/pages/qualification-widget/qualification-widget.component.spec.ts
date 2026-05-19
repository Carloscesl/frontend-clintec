import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualificationWidgetComponent } from './qualification-widget.component';

describe('QualificationWidgetComponent', () => {
  let component: QualificationWidgetComponent;
  let fixture: ComponentFixture<QualificationWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QualificationWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QualificationWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
