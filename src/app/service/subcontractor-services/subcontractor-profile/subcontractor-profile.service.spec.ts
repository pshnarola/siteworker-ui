import { TestBed } from '@angular/core/testing';

import { SubcontractorProfileService } from './subcontractor-profile.service';

describe('SubcontractorProfileService', () => {
  let service: SubcontractorProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubcontractorProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
