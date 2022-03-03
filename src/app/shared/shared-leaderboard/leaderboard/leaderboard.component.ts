import { Component, OnInit } from '@angular/core';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { User } from '../../vo/User';
import { LeaderboardService } from './leaderboard.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
  roleNameSub = 'SUBCONTRACTOR';
  roleNameClient = 'CLIENT';
  roleNameWorker = 'WORKER';
  clientAccess: any;
  user: User;
  rolename: any;

  cumulativePoints: number;

  constructor(
    private captionChangeService: HeaderManagementService,
    private localStorageService: LocalStorageService,
    private leaderboardService: LeaderboardService) {
    this.user = this.localStorageService.getLoginUserObject();
    if (this.user != null) {
      this.rolename = this.user.roles[0].roleName;
    }
  }

  ngOnInit(): void {
    this.clientAccess = this.localStorageService.getItem('userAccess');
    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.getAllTimeTopTenUsers();
  }

  handleChange(event): any {

  }

  getAllTimeTopTenUsers(): void {
    this.leaderboardService.getLoggedInUserPoints(this.user?.id).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {
        this.cumulativePoints = data.data ? data.data : 0;
      }
    });
  }
  ngOnDestroy(): void {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(false);
  }
}
