import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewJobDetailsComponent } from './view-job-details.component';

describe('ViewJobDetailsComponent', () => {
  let component: ViewJobDetailsComponent;
  let fixture: ComponentFixture<ViewJobDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewJobDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewJobDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
