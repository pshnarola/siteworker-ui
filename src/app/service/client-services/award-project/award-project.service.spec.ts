import { TestBed } from '@angular/core/testing';

import { AwardProjectService } from './award-project.service';

describe('AwardProjectService', () => {
  let service: AwardProjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AwardProjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
