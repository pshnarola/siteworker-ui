import { TestBed } from '@angular/core/testing';

import { UpdatedService } from './updated.service';

describe('UpdatedService', () => {
  let service: UpdatedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UpdatedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
