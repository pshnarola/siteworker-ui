import { TestBed } from '@angular/core/testing';

import { RantingAndReviewService } from './ranting-and-review.service';

describe('RantingAndReviewService', () => {
  let service: RantingAndReviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RantingAndReviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
