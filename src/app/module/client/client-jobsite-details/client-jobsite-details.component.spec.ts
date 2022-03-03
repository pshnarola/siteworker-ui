import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientJobsiteDetailsComponent } from './client-jobsite-details.component';

describe('ClientJobsiteDetailsComponent', () => {
  let component: ClientJobsiteDetailsComponent;
  let fixture: ComponentFixture<ClientJobsiteDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientJobsiteDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientJobsiteDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
