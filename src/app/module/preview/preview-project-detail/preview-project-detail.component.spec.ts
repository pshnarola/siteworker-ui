import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewProjectDetailComponent } from './preview-project-detail.component';

describe('PreviewProjectDetailComponent', () => {
  let component: PreviewProjectDetailComponent;
  let fixture: ComponentFixture<PreviewProjectDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewProjectDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewProjectDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
