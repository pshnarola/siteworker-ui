import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewViewAllProjectComponent } from './preview-view-all-project.component';

describe('PreviewViewAllProjectComponent', () => {
  let component: PreviewViewAllProjectComponent;
  let fixture: ComponentFixture<PreviewViewAllProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewViewAllProjectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewViewAllProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
