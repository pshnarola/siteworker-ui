import { TestBed } from '@angular/core/testing';

import { ClientMsaService } from './client-msa.service';

describe('ClientMsaService', () => {
  let service: ClientMsaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientMsaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
