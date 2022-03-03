import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewJobDetailsForExternalWorkerComponent } from './preview-job-details-for-external-worker.component';

describe('PreviewJobDetailsForExternalWorkerComponent', () => {
  let component: PreviewJobDetailsForExternalWorkerComponent;
  let fixture: ComponentFixture<PreviewJobDetailsForExternalWorkerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewJobDetailsForExternalWorkerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewJobDetailsForExternalWorkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
