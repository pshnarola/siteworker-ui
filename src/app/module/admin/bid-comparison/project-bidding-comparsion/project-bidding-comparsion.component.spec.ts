import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectBiddingComparsionComponent } from './project-bidding-comparsion.component';

describe('ProjectBiddingComparsionComponent', () => {
  let component: ProjectBiddingComparsionComponent;
  let fixture: ComponentFixture<ProjectBiddingComparsionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectBiddingComparsionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectBiddingComparsionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
