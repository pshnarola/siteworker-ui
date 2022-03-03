import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamificationConfigurationComponent } from './gamification-configuration.component';

describe('GamificationConfigurationComponent', () => {
  let component: GamificationConfigurationComponent;
  let fixture: ComponentFixture<GamificationConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GamificationConfigurationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GamificationConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
