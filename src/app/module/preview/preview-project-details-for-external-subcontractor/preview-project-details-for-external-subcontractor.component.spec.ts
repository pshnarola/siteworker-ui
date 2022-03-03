import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewProjectDetailsForExternalSubcontractorComponent } from './preview-project-details-for-external-subcontractor.component';

describe('PreviewProjectDetailsForExternalSubcontractorComponent', () => {
  let component: PreviewProjectDetailsForExternalSubcontractorComponent;
  let fixture: ComponentFixture<PreviewProjectDetailsForExternalSubcontractorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewProjectDetailsForExternalSubcontractorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewProjectDetailsForExternalSubcontractorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
