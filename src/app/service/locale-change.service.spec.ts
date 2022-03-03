import { TestBed } from '@angular/core/testing';

import { LocaleChangeService } from './locale-change.service';

describe('LocaleChangeService', () => {
  let service: LocaleChangeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocaleChangeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
