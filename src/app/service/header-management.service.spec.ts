import { TestBed } from '@angular/core/testing';

import { HeaderManagementService } from './header-management.service';

describe('CaptionChangeService', () => {
  let service: HeaderManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeaderManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
