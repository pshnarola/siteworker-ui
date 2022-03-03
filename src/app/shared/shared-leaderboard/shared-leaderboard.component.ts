import { Component, Input, OnInit } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import { concatMap, groupBy, map, toArray } from 'rxjs/operators';
import { GamificationConfigurationService } from 'src/app/service/admin-services/gamification-configuration/gamification-configuration.service';
import { LeaderboardService } from 'src/app/shared/shared-leaderboard/leaderboard/leaderboard.service';
import { environment } from 'src/environments/environment';
import { COMMON_CONSTANTS } from '../CommonConstants';
import { CommonUtil } from '../CommonUtil';
import { PATH_CONSTANTS } from '../PathConstants';
import { DataTableParam } from '../vo/DataTableParam';
import { LeaderBoardDTO } from './LeaderBoardDTO';

@Component({
  selector: 'app-shared-leaderboard',
  templateUrl: './shared-leaderboard.component.html',
  styleUrls: ['./shared-leaderboard.component.css']
})
export class SharedLeaderboardComponent implements OnInit {
  month = '';
  @Input() public roleName: string;

  queryParam: URLSearchParams;
  datatableParam = new DataTableParam();
  userDatatableParam = new DataTableParam();
  totalRecords = 0;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  globalFilter: string;
  imagePath = environment.baseURL + '/file/getById?fileId=';

  leaderBoardData: any[];
  rankOneList = [];
  rankTwoList = [];
  rankThreeList = [];

  topTenUsers: LeaderBoardDTO[];
  topTenUsersGroupByPoint: any[];

  userGamificationDetail: any;

  columns = [
    { label: 'Profile Image', value: '', sortable: false },
    { label: 'Name', value: 'firstName', sortable: true },
    { label: 'Avg. Rating', value: 'avgRating', sortable: true },
    { label: 'Total Points', value: 'point', sortable: true },
  ];
  columnsForPowerAndYellowHardHat = [
    { label: 'Profile Image', value: '', sortable: false },
    { label: 'Name', value: 'firstName', sortable: true },
    { label: 'Total Points', value: 'point', sortable: true },
  ];
  giveAwayImageUrl = 'assets/images/giveAway.jpg';
  isOpenPowerUserDialog = false;
  isOpenYellowHardHatUserDialog = false;
  datatableParamForPowerUsers: { offset: number; size: number; sortField: string; sortOrder: number; searchText: string; };
  powerUserData: any;
  yellowHardHatUserData: any;
  datatableParamForYellowHardHatUsers: { offset: number; size: number; sortField: string; sortOrder: number; searchText: string; };

  constructor(
    private leaderboardService: LeaderboardService,
    private gamificationConfigurationService: GamificationConfigurationService
  ) {
    this.datatableParam = {
      offset: 0,
      size: 10,
      sortField: 'NAME',
      sortOrder: 1,
      searchText: null
    };
  }

  ngOnInit(): void {
    this.getMonth();
    this.setDefaultCriteria();
    this.getAllTimeTopTenUsers();
    this.loadDataByRoleName();
  }

  loadDataByRoleName(): void {
    switch (this.roleName) {
      case 'SUBCONTRACTOR':
        this.loadSubcontractorData();
        break;
      case 'WORKER':
        this.loadWorkerData();
        break;
      case 'CLIENT':
        this.loadClientData();
        break;

      default:
        break;
    }
  }

  getMonth() {
    let myVariable = new Date();
    let makeDate = new Date(myVariable);
    makeDate.setMonth(makeDate.getMonth() - 1);
    this.month = makeDate.toString();
  }

  setDefaultCriteria() {
    let filterMap = new Map();
    filterMap.set('ROLE', this.roleName);
    filterMap.set('RANK', '');
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParam = {
      offset: 0,
      size: 10000,
      sortField: '',
      sortOrder: 1,
      searchText: this.globalFilter
    };
    this.getLeaderboardData();
  }

  getLeaderboardData() {
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.leaderboardService.getLeaderboard(this.queryParam).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {
        if (data.data.result?.length) {
          this.leaderBoardData = data.data.result;
        }
        data.data.result?.forEach(element => {
          if (element.userRank === 1) {
            this.rankOneList.push(element);
          }
          if (element.userRank === 2) {
            this.rankTwoList.push(element);
          }
          if (element.userRank === 3) {
            this.rankThreeList.push(element);
          }
        });
      }
    });
  }

  // tslint:disable-next-line: typedef
  prepareQueryParam(paramObject) {
    // tslint:disable-next-line: new-parens
    const params = new URLSearchParams;
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  async getAllTimeTopTenUsers(): Promise<any> {
    this.leaderboardService.getAllTimeTopTenUsers(this.roleName).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {
        this.topTenUsers = data.data;
        this.groupBy(this.topTenUsers);
      }
    });
  }

  loadSubcontractorData() {
    this.queryParam = this.prepareQueryParam(this.userDatatableParam);
    this.gamificationConfigurationService.getSubcontractorGamificationConfigurationList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          if (data.data.result?.length) {
            this.userGamificationDetail = data.data.result[0];
          } else {
            this.userGamificationDetail = null;
          }
        }
      },
      error => {

      }
    );
  }

  loadWorkerData() {
    this.queryParam = this.prepareQueryParam(this.userDatatableParam);
    this.gamificationConfigurationService.getWorkerGamificationConfigurationList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          if (data.data.result?.length) {
            this.userGamificationDetail = data.data.result[0];
          } else {
            this.userGamificationDetail = null;
          }
        }
      },
      error => {

      }
    );
  }

  loadClientData() {
    this.queryParam = this.prepareQueryParam(this.userDatatableParam);
    this.gamificationConfigurationService.getClientGamificationConfigurationList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          if (data.data.result?.length) {
            this.userGamificationDetail = data.data.result[0];
          } else {
            this.userGamificationDetail = null;
          }
        }
      },
      error => {

      }
    );
  }

  groupBy(topTenUsers: LeaderBoardDTO[]): void {
    const freshUserList = [];
    const records = topTenUsers;
    const pipedRecords = new Subject();
    const result = pipedRecords.pipe(
      groupBy(
        (x: LeaderBoardDTO) => x.point,
        null,
        null,
        () => new ReplaySubject()
      ),
      concatMap(
        object => object.pipe(
          toArray(),
          map(obj =>
            ({ key: object.key, value: obj })
          ))
      )
    );

    result.subscribe(x => {
      freshUserList.push(x);
    });

    records.forEach(x => pipedRecords.next(x));
    pipedRecords.complete();
    this.rearrangeList(freshUserList);
  }

  rearrangeList(topTenUsersGroupByPoint: any[]): void {
    let count = 0;
    const finalUserList = [];
    topTenUsersGroupByPoint.forEach(
      user => {
        count++;
        user.value.forEach(element => {
          element.rank = count;
          finalUserList.push(element);
        });
      }
    );
    this.topTenUsers = finalUserList;
  }
  redirectToProfile(id): void {
    switch (this.roleName) {
      case 'SUBCONTRACTOR':
        CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_SUBCONTRACTOR_PROFILE + '?user=' + id);
        break;
      case 'WORKER':
        CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_WORKER_PROFILE + '?user=' + id);
        break;
      case 'CLIENT':
        CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_CLIENT_PROFILE + '?user=' + id);
        break;

      default:
        break;
    }
  }
  onOpenPowerUserDialog(): void {
    this.isOpenPowerUserDialog = true;
    this.setDefaultCriteriaForPowerUsers();
  }
  onHidePowerUserDialog($event): void {
    this.isOpenPowerUserDialog = false;
  }
  onOpenYellowHardHatUserDialog(): void {
    this.isOpenYellowHardHatUserDialog = true;
    this.setDefaultCriteriaForYellowHardHatUsers();
  }
  onHideYellowHardHatUserDialog($event): void {
    this.isOpenYellowHardHatUserDialog = false;
  }
  setDefaultCriteriaForPowerUsers(): void {
    let filterMap = new Map();
    filterMap.set('ROLE', this.roleName);
    filterMap.set('POWER_USER', '');
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParamForPowerUsers = {
      offset: 0,
      size: 10000,
      sortField: '',
      sortOrder: 1,
      searchText: this.globalFilter
    };
    this.getPowerUsers();
  }
  getPowerUsers(): void {
    this.queryParam = this.prepareQueryParam(this.datatableParamForPowerUsers);
    this.leaderboardService.getLeaderboard(this.queryParam).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {
        if (data.data.result?.length) {
          this.powerUserData = data.data.result;
        }
      }
    });
  }
  setDefaultCriteriaForYellowHardHatUsers(): void {
    let filterMap = new Map();
    filterMap.set('ROLE', this.roleName);
    filterMap.set('YELLOW_HARD_HAT', '');
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParamForYellowHardHatUsers = {
      offset: 0,
      size: 10000,
      sortField: '',
      sortOrder: 1,
      searchText: this.globalFilter
    };
    this.getYellowHardHatUsers();
  }
  getYellowHardHatUsers(): void {
    this.queryParam = this.prepareQueryParam(this.datatableParamForYellowHardHatUsers);
    this.leaderboardService.getLeaderboard(this.queryParam).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {
        if (data.data.result?.length) {
          this.yellowHardHatUserData = data.data.result;
        }
      }
    });
  }
}
