import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BellNotificationComponent } from './bell-notification.component';

describe('BellNotificationComponent', () => {
  let component: BellNotificationComponent;
  let fixture: ComponentFixture<BellNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BellNotificationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BellNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
