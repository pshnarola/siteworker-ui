import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BidComparisonComponent } from './bid-comparison.component';

describe('BidComparisonComponent', () => {
  let component: BidComparisonComponent;
  let fixture: ComponentFixture<BidComparisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BidComparisonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BidComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
