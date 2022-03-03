import { TestBed } from '@angular/core/testing';

import { MarkAsFavouriteService } from './mark-as-favourite.service';

describe('MarkAsFavouriteService', () => {
  let service: MarkAsFavouriteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarkAsFavouriteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
