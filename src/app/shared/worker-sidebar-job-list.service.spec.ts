import { TestBed } from '@angular/core/testing';

import { WorkerSidebarJobListService } from './worker-sidebar-job-list.service';

describe('WorkerSidebarJobListService', () => {
  let service: WorkerSidebarJobListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkerSidebarJobListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
