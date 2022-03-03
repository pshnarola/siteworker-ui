import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingClientJobComponent } from './pending-client-job.component';

describe('PendingClientJobComponent', () => {
  let component: PendingClientJobComponent;
  let fixture: ComponentFixture<PendingClientJobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PendingClientJobComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingClientJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
