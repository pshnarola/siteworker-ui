import { TestBed } from '@angular/core/testing';

import { ProjectJobSelectionService } from './project-job-selection.service';

describe('ProjectJobSelectionService', () => {
  let service: ProjectJobSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectJobSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
