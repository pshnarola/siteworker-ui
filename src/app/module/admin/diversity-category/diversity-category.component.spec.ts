import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiversityCategoryComponent } from './diversity-category.component';

describe('DiversityCategoryComponent', () => {
  let component: DiversityCategoryComponent;
  let fixture: ComponentFixture<DiversityCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiversityCategoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiversityCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
