import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineItemTemplateComponent } from './line-item-template.component';

describe('LineItemTemplateComponent', () => {
  let component: LineItemTemplateComponent;
  let fixture: ComponentFixture<LineItemTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LineItemTemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LineItemTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
