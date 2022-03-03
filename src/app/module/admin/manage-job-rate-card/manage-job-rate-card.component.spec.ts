import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageJobRateCardComponent } from './manage-job-rate-card.component';

describe('ManageJobRateCardComponent', () => {
  let component: ManageJobRateCardComponent;
  let fixture: ComponentFixture<ManageJobRateCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageJobRateCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageJobRateCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
