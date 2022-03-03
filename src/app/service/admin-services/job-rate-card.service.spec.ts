import { TestBed } from '@angular/core/testing';

import { JobRateCardService } from './job-rate-card.service';

describe('JobRateCardService', () => {
  let service: JobRateCardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JobRateCardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
