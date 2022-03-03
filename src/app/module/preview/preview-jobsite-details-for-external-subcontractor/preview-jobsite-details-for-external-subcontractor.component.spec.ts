import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewJobsiteDetailsForExternalSubcontractorComponent } from './preview-jobsite-details-for-external-subcontractor.component';

describe('PreviewJobsiteDetailsForExternalSubcontractorComponent', () => {
  let component: PreviewJobsiteDetailsForExternalSubcontractorComponent;
  let fixture: ComponentFixture<PreviewJobsiteDetailsForExternalSubcontractorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewJobsiteDetailsForExternalSubcontractorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewJobsiteDetailsForExternalSubcontractorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
