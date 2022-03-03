import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLineItemComponent } from './add-line-item.component';

describe('AddLineItemComponent', () => {
  let component: AddLineItemComponent;
  let fixture: ComponentFixture<AddLineItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddLineItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddLineItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
