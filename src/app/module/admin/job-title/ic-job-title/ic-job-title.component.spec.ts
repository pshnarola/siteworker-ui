import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IcJobTitleComponent } from './ic-job-title.component';

describe('IcJobTitleComponent', () => {
  let component: IcJobTitleComponent;
  let fixture: ComponentFixture<IcJobTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IcJobTitleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IcJobTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
