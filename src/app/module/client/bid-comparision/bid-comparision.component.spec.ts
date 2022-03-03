import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BidComparisionComponent } from './bid-comparision.component';

describe('BidComparisionComponent', () => {
  let component: BidComparisionComponent;
  let fixture: ComponentFixture<BidComparisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BidComparisionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BidComparisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
