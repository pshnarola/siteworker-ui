import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewWorkerProfileExternalComponent } from './preview-worker-profile-external.component';

describe('PreviewWorkerProfileExternalComponent', () => {
  let component: PreviewWorkerProfileExternalComponent;
  let fixture: ComponentFixture<PreviewWorkerProfileExternalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewWorkerProfileExternalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewWorkerProfileExternalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
