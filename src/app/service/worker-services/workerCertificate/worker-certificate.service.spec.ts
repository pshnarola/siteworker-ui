import { TestBed } from '@angular/core/testing';

import { WorkerCertificateService } from './worker-certificate.service';

describe('WorkerCertificateService', () => {
  let service: WorkerCertificateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkerCertificateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
