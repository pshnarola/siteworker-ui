import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcontractorGamificationConfigurationComponent } from './subcontractor-gamification-configuration.component';

describe('SubcontractorGamificationConfigurationComponent', () => {
  let component: SubcontractorGamificationConfigurationComponent;
  let fixture: ComponentFixture<SubcontractorGamificationConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubcontractorGamificationConfigurationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubcontractorGamificationConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
