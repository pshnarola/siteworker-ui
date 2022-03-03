import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewJobsiteListComponent } from './preview-jobsite-list.component';

describe('PreviewJobsiteListComponent', () => {
  let component: PreviewJobsiteListComponent;
  let fixture: ComponentFixture<PreviewJobsiteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewJobsiteListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewJobsiteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
