import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptJobComponent } from './accept-job.component';

describe('AcceptJobComponent', () => {
  let component: AcceptJobComponent;
  let fixture: ComponentFixture<AcceptJobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcceptJobComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AcceptJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
