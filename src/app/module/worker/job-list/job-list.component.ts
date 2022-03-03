import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Params, Router } from '@angular/router';
import { JobDetailService } from 'src/app/service/client-services/job-detail/job-detail.service';
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

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css']
})
export class JobListComponent implements OnInit, OnDestroy {
  jobs;
  dataTableParam: DataTableParam;
  queryParam;
  jobDetail;
  description;
  perDiem = false;
  mileage = false;
  showMore = false;
  totalRecords = 0;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  offset = 0;
  sortOrder;
  sortField: 'CREATED_DATE';
  length;
  descriptionList = [];
  loggedInUserId: any;
  filterMap = new Map();
  globalFilter: any;
  employementType = [];
  statusFilter = [];
  startDate: Date;
  endDate: Date;
  dateFlag: boolean;
  miles: any;
  title = [];
  cityList = [];
  regionList = [];
  stateList = [];
  postedByList = [];
  lengthOfJobs: any;
  jobDescription: any;
  readMoreDialog = false;
  descriptionData: any;
  data: any;
  constructor(
    private jobDetailService: JobDetailService,
    private captionChangeService: HeaderManagementService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private filterLeftPanelService: FilterLeftPanelDataService,
    private dateHelperService: DateHelperService,
    private notificationService: UINotificationService) {
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.JOBS_LISTING);
    this.projectJobSelectionService.hideJobListFilter.next(false);
    this.dataTableParam = new DataTableParam();

  }
  ngOnDestroy(): void {
    this.projectJobSelectionService.hideJobListFilter.next(true);
  }

  ngOnInit(): void {
    this.loggedInUserId = this.localStorageService.getLoginUserId();
    this.filterLeftPanelService.jobListFilter.subscribe(e => {
      this.data = e;
      this.setFilter(e);
    });
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.JOBS_LISTING);
    this.getJobListCustom();

  }
  setFilter(e): void {
    this.filterMap.clear();
    this.filterMap.set('JOB_LISTING_ID', this.loggedInUserId);
    this.filterMap.set('STATUS', 'POSTED');
    this.filterMap.set('MARKET_TYPE', 'OPEN_MARKET_REQUEST');
    this.filterMap.set('PUBLIC_AVAILABLE_FOR_WORKER', this.loggedInUserId);
    this.statusFilter.length = 0;
    this.title.length = 0;
    this.postedByList.length = 0;
    this.cityList.length = 0;
    this.stateList.length = 0;
    this.regionList.length = 0;
    this.employementType.length = 0;
    if (e.city) {
      e.city.forEach(element => {
        this.cityList.push(element);
        this.filterMap.set('CITY', this.cityList.toString());
      });
    }
    if (e.state) {
      e.state.forEach(element => {
        this.stateList.push(element);
        this.filterMap.set('STATE', this.stateList.toString());
      });
    }
    if (e.region) {
      e.region.forEach(element => {
        this.regionList.push(element);
        this.filterMap.set('REGION', this.regionList.toString());
      });
    }
    if (e.dateRange) {
      this.startDate = e.dateRange[0];
      this.dateHelperService.setStartDate(this.startDate);
      const datePipe = new DatePipe('en-US');
      const value = datePipe.transform(this.startDate, 'yyyy-MM-dd HH:mm:ss');
      this.filterMap.set('ESTIMATED_START_DATE', value);
      this.endDate = e.dateRange[1];
      if (this.endDate) {
        this.dateHelperService.setEndDate(this.endDate);
        const valueEnd = datePipe.transform(this.endDate, 'yyyy-MM-dd HH:mm:ss');
        this.filterMap.set('ESTIMATED_END_DATE', valueEnd);
      } else {
        this.dateFlag = true;
        this.notificationService.error('Enter appropriate dateRange', '');
      }
    }

    if (e.keyword !== '') {
      this.filterMap.set('KEY_WORD', e.keyword);
    }
    if (e.jobTitle) {
      e.jobTitle.forEach(element => {
        this.title.push(element);
        this.filterMap.set('TITLE', this.title.toString());
      });
    }
    if (e.employmentType) {
      e.employmentType.forEach(element => {
        this.employementType.push(element.value);
        this.filterMap.set('EMPLOYMENT_TYPE', this.employementType.toString());
      });
    }
    if (e.miles !== '') {
      this.filterMap.set('MILES', e.miles);
    }
    if (e.location !== '') {
      this.filterMap.set('LOCATION', e.location);
    }
    if (e.postedBy.length !== 0) {
      e.postedBy.forEach(element => {
        this.postedByList.push(element.id);
      });
      this.filterMap.set('USER_ID', this.postedByList.toString());
    }
    if (!this.dateFlag) {
      const jsonObject = {};
      this.filterMap.forEach((value, key) => {
        jsonObject[key] = value;
      });
      this.globalFilter = JSON.stringify(jsonObject);
      this.dataTableParam = {
        offset: this.offset,
        size: this.size,
        sortField: '',
        sortOrder: -1,
        searchText: this.globalFilter
      };
      // tslint:disable-next-line: max-line-length
      if (e.city?.length || e.state?.length || e.region?.length || e.dateRange || e.keyword || e.jobTitle?.length || e.employmentType?.length || e.location || e.postedBy?.length) {
        this.getJobList();
      } else {
        this.getJobListCustom();
      }
    }
  }
  getJobList(): void {
    this.filterMap.set('STATUS', 'POSTED');
    this.filterMap.set('MARKET_TYPE', 'OPEN_MARKET_REQUEST');
    this.filterMap.set('PUBLIC_AVAILABLE_FOR_WORKER', this.loggedInUserId);
    this.filterMap.set('JOB_LISTING_ID', this.loggedInUserId);

    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: this.offset,
      size: this.size,
      sortField: '',
      sortOrder: -1,
      searchText: this.globalFilter
    };

    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.jobDetailService.getJobDetailList(this.queryParam).subscribe(data => {
      if (data.data?.result) {
        this.jobDetail = data.data.result;
        this.lengthOfJobs = this.jobDetail.length;
        this.offset = data.data.first;
        this.totalRecords = data.data.totalRecords;
        this.jobDetail.forEach(element => {
          this.length = element.description.length;
          this.descriptionList.push(element.description);
          this.perDiem = element.isPerDiem;
          this.mileage = element.isPayForMilage;
        });
        this.showMore = false;
      }

      else {
        this.jobDetail = [];
        this.lengthOfJobs = this.jobDetail?.length;
        this.offset = data.data?.first;
        this.totalRecords = data.data?.totalRecords;
      }
    });
  }
  getJobListCustom(): void {
    this.filterMap.set('STATUS', 'POSTED');
    this.filterMap.set('MARKET_TYPE', 'OPEN_MARKET_REQUEST');
    this.filterMap.set('PUBLIC_AVAILABLE_FOR_WORKER', this.loggedInUserId);
    this.filterMap.set('JOB_LISTING_ID', this.loggedInUserId);

    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: this.offset,
      size: this.size,
      sortField: '',
      sortOrder: -1,
      searchText: this.globalFilter
    };

    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.jobDetailService.getJobDetailCustom(this.queryParam).subscribe(data => {
      if (data.data?.result) {
        this.jobDetail = data.data.result;
        this.lengthOfJobs = this.jobDetail.length;
        this.offset = data.data.first;
        this.totalRecords = data.data.totalRecords;
        this.jobDetail.forEach(element => {
          this.length = element.description.length;
          this.descriptionList.push(element.description);
          this.perDiem = element.isPerDiem;
          this.mileage = element.isPayForMilage;
        });
        this.showMore = false;
      }
      else {
        this.jobDetail = [];
        this.lengthOfJobs = this.jobDetail?.length;
        this.offset = data.data?.first;
        this.totalRecords = data.data?.totalRecords;
      }
    });
  }
  public paginate(event: any): void {
    this.filterMap.set('STATUS', 'POSTED');
    this.filterMap.set('MARKET_TYPE', 'OPEN_MARKET_REQUEST');
    this.filterMap.set('PUBLIC_AVAILABLE_FOR_WORKER', this.loggedInUserId);
    this.filterMap.set('JOB_LISTING_ID', this.loggedInUserId);
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.offset = event.first / event.rows;
    this.dataTableParam = {
      offset: this.offset,
      size: this.size = event.rows ? event.rows : this.size,
      sortField: 'CREATED_DATE',
      sortOrder: -1,
      searchText: this.globalFilter
    };

    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    if (this.data) {
      // tslint:disable-next-line: max-line-length
      if (this.data.city?.length || this.data.state?.length || this.data.region?.length || this.data.dateRange || this.data.keyword || this.data.jobTitle?.length || this.data.employmentType?.length || this.data.location || this.data.postedBy?.length) {
        this.jobDetailService.getJobDetailList(this.queryParam).subscribe(data => {
          this.jobDetail = data.data.result;
          this.jobDetail.forEach(element => {
            this.description = element.description;
            this.perDiem = element.isPerDiem;
            this.mileage = element.isPayForMilage;
          });
          this.showMore = false;


        });
      } else {
        this.getJobListCustom();
      }
    } else {
      this.getJobListCustom();
    }
  }
  openDialogReadMore(description) {
    this.descriptionData = description;
    this.readMoreDialog = true;
  }
  closeReadMoreDialog() {
    this.readMoreDialog = false;
  }
  prepareQueryParam(paramObject): Params {
    // tslint:disable-next-line: new-parens
    const params = new URLSearchParams;
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }
  onViewMore(job): void {
    this.router.navigate([PATH_CONSTANTS.VIEW_MORE_JOB_DETAILS]
      , {
        queryParams: { id: job.id },
      });
  }
  getFullName(data: User) {
    return data.firstName + ' ' + data.lastName;
  }
}
