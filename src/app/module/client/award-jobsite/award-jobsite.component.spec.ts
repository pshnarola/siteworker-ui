import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AwardJobsiteComponent } from './award-jobsite.component';

describe('AwardJobsiteComponent', () => {
  let component: AwardJobsiteComponent;
  let fixture: ComponentFixture<AwardJobsiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AwardJobsiteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AwardJobsiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
