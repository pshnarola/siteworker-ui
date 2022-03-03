import { TestBed } from '@angular/core/testing';

import { OshaService } from './osha.service';

describe('OshaService', () => {
  let service: OshaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OshaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
