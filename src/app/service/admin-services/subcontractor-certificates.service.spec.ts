import { TestBed } from '@angular/core/testing';

import { SubcontractorCertificatesService } from './subcontractor-certificates.service';

describe('SubcontractorCertificatesService', () => {
  let service: SubcontractorCertificatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubcontractorCertificatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
