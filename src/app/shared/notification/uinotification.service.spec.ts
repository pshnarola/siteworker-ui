import { TestBed } from '@angular/core/testing';

import { UINotificationService } from './uinotification.service';

describe('UINotificationService', () => {
  let service: UINotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UINotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
