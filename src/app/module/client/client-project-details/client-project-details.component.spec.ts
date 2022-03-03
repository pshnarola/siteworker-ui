import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientProjectDetailsComponent } from './client-project-details.component';

describe('ClientProjectDetailsComponent', () => {
  let component: ClientProjectDetailsComponent;
  let fixture: ComponentFixture<ClientProjectDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientProjectDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientProjectDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
