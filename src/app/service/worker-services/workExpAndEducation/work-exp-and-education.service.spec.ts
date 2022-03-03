import { TestBed } from '@angular/core/testing';

import { WorkExpAndEducationService } from './work-exp-and-education.service';

describe('WorkExpAndEducationService', () => {
  let service: WorkExpAndEducationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkExpAndEducationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
