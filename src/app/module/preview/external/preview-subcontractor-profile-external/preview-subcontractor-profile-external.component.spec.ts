import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewSubcontractorProfileExternalComponent } from './preview-subcontractor-profile-external.component';

describe('PreviewSubcontractorProfileExternalComponent', () => {
  let component: PreviewSubcontractorProfileExternalComponent;
  let fixture: ComponentFixture<PreviewSubcontractorProfileExternalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewSubcontractorProfileExternalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewSubcontractorProfileExternalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
