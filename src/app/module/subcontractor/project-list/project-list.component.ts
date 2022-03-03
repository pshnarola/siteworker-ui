import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { ProjectDetail } from '../../client/Vos/projectDetailmodel';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectListComponent implements OnInit, OnDestroy {
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
    this.loggedInUserId = this.localStorageService.getLoginUserId();

    this.projectJobSelectionService.showProjectFilterList.next(true);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.PROJECT_LIST);

  }

  ngOnInit(): void {
    this.projectJobSelectionService.showProjectFilterList.next(true);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.PROJECT_LIST);
    this.loadMatchMakingProjectList();
    this.subscription.add(this.filterLeftPanelService.projectListFilter.subscribe(data => {
      this.setProjectListFilter(data);
    }));
  }

  ngOnDestroy(): void {
    this.projectJobSelectionService.showSubcontractorSidebarList.next(true);
  }

  redirectToViewMore(id) {
    this.router.navigate([PATH_CONSTANTS.VIEW_MORE_PROJECT_DETAIL], { queryParams: { user: id } });
  }

  private prepareQueryParam(paramObject): URLSearchParams {
    const params = new URLSearchParams();
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  selectOrder(event) {
    if (this.filterData || this.selectedOrder) {
      if (
        this.filterData?.state?.length ||
        this.filterData?.region?.length ||
        this.filterData?.projectTitle?.length ||
        this.filterData?.industryType?.length ||
        this.filterData?.clientName?.length ||
        this.filterData?.isBidNegotiable ||
        this.filterData?.min ||
        this.filterData?.max ||
        this.filterData?.startDate?.length ||
        this.filterData?.postDate?.length ||
        this.filterData?.dueDate?.length ||
        this.filterData?.estimatedDate?.length ||
        this.selectedOrder?.field
      ) {
        this.dataTableParam = {
          offset: this.offset,
          size: this.size,
          sortField: this.selectedOrder?.field ? this.selectedOrder?.field : 'COST',
          sortOrder: this.selectedOrder?.value ? this.selectedOrder?.value : 0,
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
      } else {
        this.loadMatchMakingProjectList();
      }
    } else {
      this.loadMatchMakingProjectList();
    }
  }

  loadProjectList() {

    this.filterMap.clear();
    this.filterMap.set('STATUS', 'POSTED');
    this.filterMap.set('SUBCONTRACTOR_LISTING_ID', this.loggedInUserId);
    this.filterMap.set('MARKET_TYPE', 'OPEN_MARKET_REQUEST');
    this.filterMap.set('PUBLIC_AVAILABLE_FOR_SUBCONTRACTOR', this.loggedInUserId);
    const date = new Date();
    const datePipe = new DatePipe('en-US');
    const valueOfDate = datePipe.transform(date, 'yyyy-MM-dd 00:00:00');
    this.filterMap.set('BID_DUE_DATE_GREATER_THAN_EQUAL', valueOfDate);

    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: this.offset,
      size: this.size,
      sortField: this.selectedOrder?.field ? this.selectedOrder?.field : 'COST',
      sortOrder: this.selectedOrder?.value ? this.selectedOrder?.value : 0,
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

  loadMatchMakingProjectList() {
    this.selectedOrder = null;
    this.filterMap.clear();

    this.filterMap.set('STATUS', 'POSTED');
    this.filterMap.set('SUBCONTRACTOR_LISTING_ID', this.loggedInUserId);
    this.filterMap.set('MARKET_TYPE', 'OPEN_MARKET_REQUEST');
    this.filterMap.set('PUBLIC_AVAILABLE_FOR_SUBCONTRACTOR', this.loggedInUserId);
    const date = new Date();
    const datePipe = new DatePipe('en-US');
    const valueOfDate = datePipe.transform(date, 'yyyy-MM-dd 00:00:00');
    this.filterMap.set('BID_DUE_DATE_GREATER_THAN_EQUAL', valueOfDate);

    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: this.offset,
      size: this.size,
      sortField: this.selectedOrder?.field ? this.selectedOrder?.field : 'COST',
      sortOrder: this.selectedOrder?.value ? this.selectedOrder?.value : 0,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.projectDetailService.getAllProjectsByMatchMaking(this.queryParam).subscribe(
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
    this.filterMap.set('STATUS', 'POSTED');
    this.filterMap.set('MARKET_TYPE', 'OPEN_MARKET_REQUEST');
    this.filterMap.set('SUBCONTRACTOR_LISTING_ID', this.loggedInUserId);
    this.filterMap.set('PUBLIC_AVAILABLE_FOR_SUBCONTRACTOR', this.loggedInUserId);
    const date = new Date();
    const datePipe = new DatePipe('en-US');
    const valueOfDate = datePipe.transform(date, 'yyyy-MM-dd 00:00:00');
    this.filterMap.set('BID_DUE_DATE_GREATER_THAN_EQUAL', valueOfDate);
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
      sortOrder: this.selectedOrder?.value ? this.selectedOrder?.value : 1,
      searchText: this.globalFilter
    };

    if (this.filterData || this.selectedOrder) {
      if (
        this.filterData?.state?.length ||
        this.filterData?.region?.length ||
        this.filterData?.projectTitle?.length ||
        this.filterData?.industryType?.length ||
        this.filterData?.clientName?.length ||
        this.filterData?.isBidNegotiable ||
        this.filterData?.min ||
        this.filterData?.max ||
        this.filterData?.startDate?.length ||
        this.filterData?.postDate?.length ||
        this.filterData?.dueDate?.length ||
        this.filterData?.estimatedDate?.length ||
        this.selectedOrder?.field
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
    } else {
      this.loadMatchMakingProjectList();
    }
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
    const datePipe = new DatePipe('en-US');
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
    this.filterMap.set('STATUS', 'POSTED');
    this.filterMap.set('MARKET_TYPE', 'OPEN_MARKET_REQUEST');
    this.filterMap.set('SUBCONTRACTOR_LISTING_ID', this.loggedInUserId);
    this.filterMap.set('PUBLIC_AVAILABLE_FOR_SUBCONTRACTOR', this.loggedInUserId);
    const date = new Date();
    const valueOfDate = datePipe.transform(date, 'yyyy-MM-dd 00:00:00');
    this.filterMap.set('BID_DUE_DATE_GREATER_THAN_EQUAL', valueOfDate);

    if (e) {
      this.filterData = e;
    }

    if (e.state) {
      e.state.forEach(element => {
        this.stateList.push(element);
        this.filterMap.set('STATE_NAME', this.stateList.toString());
      });
    }
    if (e.region) {
      e.region.forEach(element => {
        this.regionList.push(element);
        this.filterMap.set('REGION_NAME', this.regionList.toString());
      });
    }
    if (e.projectTitle) {
      e.projectTitle.forEach(element => {
        this.titleList.push(element);
        this.filterMap.set('PROJECT_TITLE', this.titleList.toString());
      });
    }
    if (e.industryType) {
      e.industryType.forEach(element => {
        this.industryTypeList.push(element);
        this.filterMap.set('INDUSTRY_NAME', this.industryTypeList.toString());
      });
    }
    if (e.clientName) {
      e.clientName.forEach(element => {
        this.clientList.push(element);
        this.filterMap.set('COMPANY_NAME', this.clientList.toString());
      });
    }
    if (e.isBidNegotiable) {
      if (e.isBidNegotiable.value === 'true') {
        this.filterMap.set('IS_BID_NEGOTIABLE', true);
      }
      else if (e.isBidNegotiable.value === 'false') {
        this.filterMap.set('IS_BID_NEGOTIABLE', false);
      }
    }
    if (e.min) {
      this.filterMap.set('GREATER_THAN_COST', e.min);
    }
    if (e.max) {
      this.filterMap.set('LESS_THAN_COST', e.max);
    }

    if (e.startDate) {
      this.startDate = e.startDate[0];
      this.dateHelperService.setStartDate(this.startDate);
      const value = datePipe.transform(this.startDate, 'yyyy-MM-dd HH:mm:ss');
      this.filterMap.set('START_DATE_ONE', value);
      this.endDate = e.startDate[1];
      if (this.endDate) {
        this.dateHelperService.setEndDate(this.endDate);
        const valueEnd = datePipe.transform(this.endDate, 'yyyy-MM-dd HH:mm:ss');
        this.filterMap.set('START_DATE_TWO', valueEnd);
      } else {
        this.dateFlag = true;
      }
    }
    if (e.postDate) {
      this.postedStartDate = e.postDate[0];
      this.dateHelperService.setStartDate(this.postedStartDate);
      const value = datePipe.transform(this.postedStartDate, 'yyyy-MM-dd HH:mm:ss');
      this.filterMap.set('POSTED_DATE_ONE', value);
      this.postedEndDate = e.postDate[1];
      if (this.postedEndDate) {
        this.dateHelperService.setEndDate(this.postedEndDate);
        const valueEnd = datePipe.transform(this.postedEndDate, 'yyyy-MM-dd HH:mm:ss');
        this.filterMap.set('POSTED_DATE_TWO', valueEnd);
      } else {
        this.dateFlag1 = true;
      }
    }
    if (e.dueDate) {
      this.dueStartDate = e.dueDate[0];
      this.dateHelperService.setStartDate(this.dueStartDate);
      const value = datePipe.transform(this.dueStartDate, 'yyyy-MM-dd HH:mm:ss');
      this.filterMap.set('DUE_DATE_ONE', value);
      this.dueEndDate = e.dueDate[1];
      if (this.dueEndDate) {
        this.dateHelperService.setEndDate(this.dueEndDate);
        const valueEnd = datePipe.transform(this.dueEndDate, 'yyyy-MM-dd HH:mm:ss');
        this.filterMap.set('DUE_DATE_TWO', valueEnd);
      }
      else {
        this.dateFlag2 = true;
      }

    }
    if (e.estimatedDate) {
      this.estimatedStartDate = e.estimatedDate[0];
      this.dateHelperService.setStartDate(this.estimatedStartDate);
      const value = datePipe.transform(this.estimatedStartDate, 'yyyy-MM-dd HH:mm:ss');
      this.filterMap.set('ESTIMATED_END_DATE_ONE', value);
      this.estimatedEndDate = e.estimatedDate[1];
      if (this.estimatedEndDate) {
        this.dateHelperService.setEndDate(this.estimatedEndDate);
        const valueEnd = datePipe.transform(this.estimatedEndDate, 'yyyy-MM-dd HH:mm:ss');
        this.filterMap.set('ESTIMATED_END_DATE_TWO', valueEnd);
      }
      else {
        this.dateFlag3 = true;
      }
    }

    if (!this.dateFlag && !this.dateFlag1 && !this.dateFlag2 && !this.dateFlag3) {

      const jsonObject = {};
      this.filterMap.forEach((value, key) => {
        jsonObject[key] = value;
      });
      this.globalFilter = JSON.stringify(jsonObject);
      this.dataTableParam = {
        offset: 0,
        size: this.size,
        sortField: this.selectedOrder?.field ? this.selectedOrder?.field : 'COST',
        sortOrder: this.selectedOrder?.value ? this.selectedOrder?.value : 0,
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
