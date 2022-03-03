import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewJobsiteDetailComponent } from './preview-jobsite-detail.component';

describe('PreviewJobsiteDetailComponent', () => {
  let component: PreviewJobsiteDetailComponent;
  let fixture: ComponentFixture<PreviewJobsiteDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewJobsiteDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewJobsiteDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
