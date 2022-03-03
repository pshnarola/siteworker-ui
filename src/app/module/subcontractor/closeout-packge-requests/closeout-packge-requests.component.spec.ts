import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseoutPackgeRequestsComponent } from './closeout-packge-requests.component';

describe('CloseoutPackgeRequestsComponent', () => {
  let component: CloseoutPackgeRequestsComponent;
  let fixture: ComponentFixture<CloseoutPackgeRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloseoutPackgeRequestsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseoutPackgeRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
