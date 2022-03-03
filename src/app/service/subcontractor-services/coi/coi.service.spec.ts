import { TestBed } from '@angular/core/testing';

import { CoiService } from './coi.service';

describe('CoiService', () => {
  let service: CoiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
