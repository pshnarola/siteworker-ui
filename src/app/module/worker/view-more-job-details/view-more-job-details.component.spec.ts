import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMoreJobDetailsComponent } from './view-more-job-details.component';

describe('ViewMoreJobDetailsComponent', () => {
  let component: ViewMoreJobDetailsComponent;
  let fixture: ComponentFixture<ViewMoreJobDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewMoreJobDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewMoreJobDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
