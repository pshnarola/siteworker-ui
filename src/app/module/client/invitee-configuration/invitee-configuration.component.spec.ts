import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteeConfigurationComponent } from './invitee-configuration.component';

describe('InviteeConfigurationComponent', () => {
  let component: InviteeConfigurationComponent;
  let fixture: ComponentFixture<InviteeConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InviteeConfigurationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InviteeConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
