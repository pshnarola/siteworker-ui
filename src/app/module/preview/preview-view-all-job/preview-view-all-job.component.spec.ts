import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewViewAllJobComponent } from './preview-view-all-job.component';

describe('PreviewViewAllJobComponent', () => {
  let component: PreviewViewAllJobComponent;
  let fixture: ComponentFixture<PreviewViewAllJobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewViewAllJobComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewViewAllJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
