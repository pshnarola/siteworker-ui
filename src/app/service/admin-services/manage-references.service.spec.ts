import { TestBed } from '@angular/core/testing';

import { ManageReferencesService } from './manage-references.service';

describe('ManageReferencesService', () => {
  let service: ManageReferencesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageReferencesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
