import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMoreProjectDetailComponent } from './view-more-project-detail.component';

describe('ViewMoreProjectDetailComponent', () => {
  let component: ViewMoreProjectDetailComponent;
  let fixture: ComponentFixture<ViewMoreProjectDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewMoreProjectDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewMoreProjectDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
