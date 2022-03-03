import { TestBed } from '@angular/core/testing';

import { ApproveClientService } from './approve-client.service';

describe('ApproveClientService', () => {
  let service: ApproveClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApproveClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
