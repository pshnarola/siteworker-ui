import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedLeaderboardComponent } from './shared-leaderboard.component';

describe('SharedLeaderboardComponent', () => {
  let component: SharedLeaderboardComponent;
  let fixture: ComponentFixture<SharedLeaderboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SharedLeaderboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SharedLeaderboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
