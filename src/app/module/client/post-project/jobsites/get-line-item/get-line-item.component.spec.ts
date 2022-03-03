import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetLineItemComponent } from './get-line-item.component';

describe('GetLineItemComponent', () => {
  let component: GetLineItemComponent;
  let fixture: ComponentFixture<GetLineItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GetLineItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GetLineItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
