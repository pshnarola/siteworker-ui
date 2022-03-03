import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewSubcontractorProfileComponent } from './preview-subcontractor-profile.component';

describe('PreviewSubcontractorProfileComponent', () => {
  let component: PreviewSubcontractorProfileComponent;
  let fixture: ComponentFixture<PreviewSubcontractorProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewSubcontractorProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewSubcontractorProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
