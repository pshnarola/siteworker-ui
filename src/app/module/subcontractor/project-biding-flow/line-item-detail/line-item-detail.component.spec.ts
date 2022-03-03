import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineItemDetailComponent } from './line-item-detail.component';

describe('LineItemDetailComponent', () => {
  let component: LineItemDetailComponent;
  let fixture: ComponentFixture<LineItemDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LineItemDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LineItemDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
