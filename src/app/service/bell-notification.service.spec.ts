import { TestBed } from '@angular/core/testing';

import { BellNotificationService } from './bell-notification.service';

describe('BellNotificationService', () => {
  let service: BellNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BellNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
