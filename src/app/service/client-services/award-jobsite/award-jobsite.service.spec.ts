import { TestBed } from '@angular/core/testing';

import { AwardJobsiteService } from './award-jobsite.service';

describe('AwardJobsiteService', () => {
  let service: AwardJobsiteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AwardJobsiteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
