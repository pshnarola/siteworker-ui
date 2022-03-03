import { TestBed } from '@angular/core/testing';

import { ProjectBidService } from './project-bid.service';

describe('ProjectBidService', () => {
  let service: ProjectBidService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectBidService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
