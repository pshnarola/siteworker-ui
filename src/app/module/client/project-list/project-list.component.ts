import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ProjectDetailService } from 'src/app/service/client-services/project-detail.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { DateHelperService } from 'src/app/service/date-helper.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { User } from 'src/app/shared/vo/User';
import { ProjectDetail } from '../Vos/projectDetailmodel';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {
  loggedInUser: User;
  loggedInUserId: any;
  filterMap = new Map();
  totalRecords = 0;
  dataTableParam: DataTableParam;
  queryParam;
  globalFilter = null;
  offset = 0;
  projectDetailList: ProjectDetail[] = [];
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  title: any[] = [];
  startDate: Date;
  endDate: Date;
  dueStartDate: Date;
  dueEndDate: Date;
  estimatedStartDate: Date;
  estimatedEndDate: Date;
  postedEndDate: Date;
  postedStartDate: Date;
  isBidNegotiable;
  titleList = [];
  regionList = [];
  stateList = [];
  industryTypeList = [];
  clientList = [];

  subscription = new Subscription();

  orderBy = [
    { name: 'Cost High-Low', value: 0, field: 'COST' },
    { name: 'Cost Low-High', value: 1, field: 'COST' },
    { name: 'Post Date - Most Recent First', value: 0, field: 'POSTED_DATE_ONE' }
  ];

  selectedOrder;
  dateFlag = false;
  dateFlag1 = false;
  dateFlag2 = false;
  dateFlag3 = false;

  filterData: any = null;

  constructor(
    private projectJobSelectionService: ProjectJobSelectionService,
    private router: Router,
    private captionChangeService: HeaderManagementService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private projectDetailService: ProjectDetailService,
    private localStorageService: LocalStorageService,
    private filterLeftPanelService: FilterLeftPanelDataService,
    private dateHelperService: DateHelperService
  ) {
    this.loggedInUser = this.localStorageService.getLoginUserObject() as User;
    this.loggedInUserId = this.loggedInUser.id;

    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.PROJECT_LIST);
    this.captionChangeService.hideSidebarSubject.next(true);

  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.PROJECT_LIST);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.loadMatchMakingProjectList();
    this.subscription.add(this.filterLeftPanelService.projectListFilter.subscribe(data => {
      this.setProjectListFilter(data);
    }));
  }

  ngOnDestroy(): void {
  }

  redirectToViewMore(projectData) {
    this.localStorageService.setItem("selectedProject", projectData);
    this.router.navigate([PATH_CONSTANTS.CLIENT_PROJECT_DETAILS]);
  }

  private prepareQueryParam(paramObject): URLSearchParams {
    const params = new URLSearchParams();
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  loadMatchMakingProjectList() {
    this.selectedOrder = null;
    this.filterMap.clear();

    this.filterMap.set('USER_ID', this.loggedInUserId);
    this.filterMap.set('WITHOUT_CANCELLED', 'CANCELLED');
    this.filterMap.set('WITHOUT_COMPLETED', 'COMPLETED');
    // this.filterMap.set('WITHOUT_COPIED', 'COPIED');

    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: this.offset,
      size: this.size,
      sortField: this.selectedOrder?.field ? this.selectedOrder?.field : 'UPDATED_DATE',
      sortOrder: this.selectedOrder?.value ? this.selectedOrder?.value : -1,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.projectDetailService.getProjectByUserIdForSidebar(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          if (data.data?.result) {
            this.offset = data.data.first;
            this.totalRecords = data.data.totalRecords;
            this.projectDetailList = data.data.result;
          } else {
            this.offset = data.data.first;
            this.totalRecords = data.data.totalRecords;
            this.projectDetailList = [];
          }
        }
      });
  }

  public paginate(event: any): void {
    this.filterMap.set('USER_ID', this.loggedInUserId);
    this.filterMap.set('WITHOUT_CANCELLED', 'CANCELLED');
    this.filterMap.set('WITHOUT_COMPLETED', 'COMPLETED');
    // this.filterMap.set('WITHOUT_COPIED', 'COPIED');

    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);

    this.offset = event.first / event.rows;
    this.dataTableParam = {
      offset: this.offset,
      size: this.size = event.rows ? event.rows : this.size,
      sortField: this.selectedOrder?.field ? this.selectedOrder?.field : 'CREATED_DATE',
      sortOrder: this.selectedOrder?.value ? this.selectedOrder?.value : -1,
      searchText: this.globalFilter
    };

    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.projectDetailService.getAllProject(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          if (data.data?.result) {
            this.offset = data.data.first;
            this.totalRecords = data.data.totalRecords;
            this.projectDetailList = data.data.result;
          } else {
            this.offset = data.data.first;
            this.totalRecords = data.data.totalRecords;
            this.projectDetailList = [];
          }
        }
      });
  }

  calculateDiffInDays(dateSent) {
    const currentDate: any = new Date();
    dateSent = new Date(dateSent);
    const days = Math.floor((currentDate - dateSent) / (1000 * 60 * 60 * 24));
    return days;
  }

  calculateDiffInMinutes(dateSent) {
    const currentDate: any = new Date();
    dateSent = new Date(dateSent);
    const days = Math.floor((currentDate - dateSent) / (1000 * 60) % 60);
    return days;
  }

  calculateDiffInHours(dateSent) {
    const currentDate: any = new Date();
    dateSent = new Date(dateSent);
    const days = Math.floor((currentDate - dateSent) / (1000 * 60 * 60) % 24);
    return days;
  }

  setProjectListFilter(e) {
    this.filterMap.clear();
    this.title.length = 0;
    this.clientList.length = 0;
    this.titleList.length = 0;
    this.regionList.length = 0;
    this.stateList.length = 0;
    this.industryTypeList.length = 0;
    this.dateFlag = false;
    this.dateFlag1 = false;
    this.dateFlag2 = false;
    this.dateFlag3 = false;
    this.filterMap.set('USER_ID', this.loggedInUserId);
    this.filterMap.set('WITHOUT_CANCELLED', 'CANCELLED');
    this.filterMap.set('WITHOUT_COMPLETED', 'COMPLETED');
    // this.filterMap.set('WITHOUT_COPIED', 'COPIED');

    if (!this.dateFlag && !this.dateFlag1 && !this.dateFlag2 && !this.dateFlag3) {

      const jsonObject = {};
      this.filterMap.forEach((value, key) => {
        jsonObject[key] = value;
      });
      this.globalFilter = JSON.stringify(jsonObject);
      this.dataTableParam = {
        offset: 0,
        size: this.size,
        sortField: this.selectedOrder?.field ? this.selectedOrder?.field : 'UPDATED_DATE',
        sortOrder: this.selectedOrder?.value ? this.selectedOrder?.value : -1,
        searchText: this.globalFilter
      };

      if (
        e.state?.length ||
        e.region?.length ||
        e.projectTitle?.length ||
        e.industryType?.length ||
        e.clientName?.length ||
        e.isBidNegotiable ||
        e.min ||
        e.max ||
        e.startDate?.length ||
        e.postDate?.length ||
        e.dueDate?.length ||
        e.estimatedDate?.length
      ) {
        this.queryParam = this.prepareQueryParam(this.dataTableParam);
        this.projectDetailService.getAllProject(this.queryParam).subscribe(
          data => {
            if (data.statusCode === '200' && data.message === 'OK') {
              if (data.data?.result) {
                this.offset = data.data.first;
                this.totalRecords = data.data.totalRecords;
                this.projectDetailList = data.data.result;
              } else {
                this.offset = data.data.first;
                this.totalRecords = data.data.totalRecords;
                this.projectDetailList = [];
              }
            }
          });
      } else {
        this.loadMatchMakingProjectList();
      }
    }
    else {
      this.notificationService.error('Enter appropriate dateRange', '');
    }
  }
}
