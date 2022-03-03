import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewViewAllWorkExperienceComponent } from './preview-view-all-work-experience.component';

describe('PreviewViewAllWorkExperienceComponent', () => {
  let component: PreviewViewAllWorkExperienceComponent;
  let fixture: ComponentFixture<PreviewViewAllWorkExperienceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewViewAllWorkExperienceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewViewAllWorkExperienceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
