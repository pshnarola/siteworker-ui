import { TestBed } from '@angular/core/testing';

import { AuthGaurdClientGuard } from './auth-gaurd-client.guard';

describe('AuthGaurdClientGuard', () => {
  let guard: AuthGaurdClientGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AuthGaurdClientGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
