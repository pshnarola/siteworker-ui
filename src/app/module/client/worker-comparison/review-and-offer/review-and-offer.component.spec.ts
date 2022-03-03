import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewAndOfferComponent } from './review-and-offer.component';

describe('ReviewAndOfferComponent', () => {
  let component: ReviewAndOfferComponent;
  let fixture: ComponentFixture<ReviewAndOfferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReviewAndOfferComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewAndOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
