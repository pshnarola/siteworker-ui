import { TestBed } from '@angular/core/testing';

import { ChangeRequestService } from './change-request.service';

describe('ChangeRequestService', () => {
  let service: ChangeRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChangeRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
