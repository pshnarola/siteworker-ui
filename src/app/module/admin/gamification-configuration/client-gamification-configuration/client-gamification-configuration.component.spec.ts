import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientGamificationConfigurationComponent } from './client-gamification-configuration.component';

describe('ClientGamificationConfigurationComponent', () => {
  let component: ClientGamificationConfigurationComponent;
  let fixture: ComponentFixture<ClientGamificationConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientGamificationConfigurationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientGamificationConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
