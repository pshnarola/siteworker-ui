import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveClientComponent } from './approve-client.component';

describe('ApproveClientComponent', () => {
  let component: ApproveClientComponent;
  let fixture: ComponentFixture<ApproveClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproveClientComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
