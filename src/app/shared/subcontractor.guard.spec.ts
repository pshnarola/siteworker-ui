import { TestBed } from '@angular/core/testing';

import { SubcontractorGuard } from './subcontractor.guard';

describe('SubcontractorGuard', () => {
  let guard: SubcontractorGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(SubcontractorGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
