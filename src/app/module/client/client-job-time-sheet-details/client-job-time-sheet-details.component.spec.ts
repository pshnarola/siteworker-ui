import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientJobTimeSheetDetailsComponent } from './client-job-time-sheet-details.component';

describe('ClientJobTimeSheetDetailsComponent', () => {
  let component: ClientJobTimeSheetDetailsComponent;
  let fixture: ComponentFixture<ClientJobTimeSheetDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientJobTimeSheetDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientJobTimeSheetDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
