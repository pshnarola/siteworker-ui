import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AwardProjectComponent } from './award-project.component';

describe('AwardProjectComponent', () => {
  let component: AwardProjectComponent;
  let fixture: ComponentFixture<AwardProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AwardProjectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AwardProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
