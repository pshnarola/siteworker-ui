import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewWorkerProfileComponent } from './preview-worker-profile.component';

describe('PreviewWorkerProfileComponent', () => {
  let component: PreviewWorkerProfileComponent;
  let fixture: ComponentFixture<PreviewWorkerProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewWorkerProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewWorkerProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
