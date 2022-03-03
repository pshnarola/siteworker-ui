import { TestBed } from '@angular/core/testing';

import { ContentMSAService } from './content-msa.service';

describe('ContentMSAService', () => {
  let service: ContentMSAService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContentMSAService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
