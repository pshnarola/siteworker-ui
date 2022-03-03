import { TestBed } from '@angular/core/testing';

import { GamificationConfigurationService } from './gamification-configuration.service';

describe('GamificationConfigurationService', () => {
  let service: GamificationConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GamificationConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
