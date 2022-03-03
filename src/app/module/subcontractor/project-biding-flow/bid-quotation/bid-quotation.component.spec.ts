import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BidQuotationComponent } from './bid-quotation.component';

describe('BidQuotationComponent', () => {
  let component: BidQuotationComponent;
  let fixture: ComponentFixture<BidQuotationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BidQuotationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BidQuotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
