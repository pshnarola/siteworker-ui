import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareLineItemComponent } from './compare-line-item.component';

describe('CompareLineItemComponent', () => {
  let component: CompareLineItemComponent;
  let fixture: ComponentFixture<CompareLineItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompareLineItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompareLineItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
