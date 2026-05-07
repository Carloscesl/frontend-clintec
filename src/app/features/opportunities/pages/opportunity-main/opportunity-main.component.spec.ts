import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpportunityMainComponent } from './opportunity-main.component';

describe('OpportunityMainComponent', () => {
  let component: OpportunityMainComponent;
  let fixture: ComponentFixture<OpportunityMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpportunityMainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpportunityMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
