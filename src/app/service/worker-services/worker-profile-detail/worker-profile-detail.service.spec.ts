import { TestBed } from '@angular/core/testing';

import { WorkerProfileDetailService } from './worker-profile-detail.service';

describe('WorkerProfileDetailService', () => {
  let service: WorkerProfileDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkerProfileDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
