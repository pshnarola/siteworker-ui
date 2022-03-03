import { TestBed } from '@angular/core/testing';

import { LoginAsService } from './login-as.service';

describe('LoginAsService', () => {
  let service: LoginAsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginAsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
