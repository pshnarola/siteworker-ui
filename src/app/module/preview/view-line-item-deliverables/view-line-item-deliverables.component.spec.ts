import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLineItemDeliverablesComponent } from './view-line-item-deliverables.component';

describe('ViewLineItemDeliverablesComponent', () => {
  let component: ViewLineItemDeliverablesComponent;
  let fixture: ComponentFixture<ViewLineItemDeliverablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewLineItemDeliverablesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewLineItemDeliverablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
