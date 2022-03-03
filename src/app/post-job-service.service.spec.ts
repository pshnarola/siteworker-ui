import { TestBed } from '@angular/core/testing';

import { PostJobServiceService } from './post-job-service.service';

describe('PostJobServiceService', () => {
  let service: PostJobServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostJobServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
