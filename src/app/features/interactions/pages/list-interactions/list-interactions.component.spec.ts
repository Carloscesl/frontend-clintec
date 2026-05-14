import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListInteractionsComponent } from './list-interactions.component';

describe('ListInteractionsComponent', () => {
  let component: ListInteractionsComponent;
  let fixture: ComponentFixture<ListInteractionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListInteractionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListInteractionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
