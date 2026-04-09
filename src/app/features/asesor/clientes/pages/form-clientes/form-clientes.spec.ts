import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormClientes } from './form-clientes';

describe('FormClientes', () => {
  let component: FormClientes;
  let fixture: ComponentFixture<FormClientes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormClientes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormClientes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
