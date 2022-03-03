import { TestBed } from '@angular/core/testing';

import { ProjectDetailService } from './project-detail.service';

describe('ProjectDetailService', () => {
  let service: ProjectDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
