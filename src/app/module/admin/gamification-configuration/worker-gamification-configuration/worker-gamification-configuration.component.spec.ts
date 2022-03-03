import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerGamificationConfigurationComponent } from './worker-gamification-configuration.component';

describe('WorkerGamificationConfigurationComponent', () => {
  let component: WorkerGamificationConfigurationComponent;
  let fixture: ComponentFixture<WorkerGamificationConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkerGamificationConfigurationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerGamificationConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
