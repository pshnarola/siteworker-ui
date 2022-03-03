import { TestBed } from '@angular/core/testing';

import { NoOfEmployeesService } from './no-of-employees.service';

describe('NoOfEmployeesService', () => {
  let service: NoOfEmployeesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NoOfEmployeesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
