import { TestBed } from '@angular/core/testing';

import { OportunidadService } from './oportunidad.service';

describe('OportunidadService', () => {
  let service: OportunidadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OportunidadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
