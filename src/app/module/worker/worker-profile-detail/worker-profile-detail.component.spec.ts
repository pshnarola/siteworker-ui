import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerProfileDetailComponent } from './worker-profile-detail.component';

describe('WorkerProfileDetailComponent', () => {
  let component: WorkerProfileDetailComponent;
  let fixture: ComponentFixture<WorkerProfileDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkerProfileDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerProfileDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
