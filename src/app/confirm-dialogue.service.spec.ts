import { TestBed } from '@angular/core/testing';

import { ConfirmDialogueService } from './confirm-dialogue.service';

describe('ConfirmDialogueService', () => {
  let service: ConfirmDialogueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfirmDialogueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
