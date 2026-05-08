import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpportunityAsesorComponent } from './opportunity-asesor.component';

describe('OpportunityAsesorComponent', () => {
  let component: OpportunityAsesorComponent;
  let fixture: ComponentFixture<OpportunityAsesorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpportunityAsesorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OpportunityAsesorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
