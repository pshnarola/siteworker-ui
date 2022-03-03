import { TestBed } from '@angular/core/testing';

import { BasicDetailService } from './basic-detail.service';

describe('BasicDetailService', () => {
  let service: BasicDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BasicDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
