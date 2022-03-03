import { TestBed } from '@angular/core/testing';

import { PreviewServicesService } from './preview-services.service';

describe('PreviewServicesService', () => {
  let service: PreviewServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreviewServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
