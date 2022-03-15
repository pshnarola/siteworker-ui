import { DatePipe } from '@angular/common';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit } from '@angular/core';
import { Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ClientProfileService } from 'src/app/service/client-services/client-profile/client-profile.service';
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
export class JobListComponent implements OnInit {
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
  sortField: 'UPDATED_DATE';
  length;
  descriptionList = [];
  loggedInUser: User;
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
    private router: Router,
    private localStorageService: LocalStorageService,
    private jobDetailService: JobDetailService,
    private filterLeftPanelService: FilterLeftPanelDataService,
    private dateHelperService: DateHelperService,
    private notificationService: UINotificationService,

    private translator: TranslateService,
    private _clientProfile: ClientProfileService,

    private captionChangeService: HeaderManagementService,
    private projectJobSelectionService: ProjectJobSelectionService
  ) {
    this.loggedInUser = this.localStorageService.getLoginUserObject() as User;
    this.loggedInUserId = this.loggedInUser.id;
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.JOBS_LISTING);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.dataTableParam = new DataTableParam();

  }
  ngOnDestroy(): void {

  }

  ngOnInit(): void {
    this.setFilter();
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.JOBS_LISTING);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.getJobListCustom();

  }

  setFilter(): void {
    this.filterMap.clear();
    this.filterMap.set('USER_ID', this.loggedInUserId);
    this.filterMap.set('WITHOUT_COMPLETED', 'COMPLETED');
    this.filterMap.set('WITHOUT_CANCELLED', 'CANCELLED');
    this.statusFilter.length = 0;
    this.title.length = 0;
    this.postedByList.length = 0;
    this.cityList.length = 0;
    this.stateList.length = 0;
    this.regionList.length = 0;
    this.employementType.length = 0;
  }

  getJobList(): void {
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: this.offset,
      size: this.size,
      sortField: 'UPDATED_DATE',
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
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: this.offset,
      size: this.size,
      sortField: 'UPDATED_DATE',
      sortOrder: -1,
      searchText: this.globalFilter
    };

    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.jobDetailService.getJobDetailListForSidebar(this.queryParam).subscribe(data => {
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
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.offset = event.first / event.rows;
    this.dataTableParam = {
      offset: this.offset,
      size: this.size = event.rows ? event.rows : this.size,
      sortField: 'UPDATED_DATE',
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
    this.localStorageService.setItem('selectedJob', job);
    this.router.navigate([PATH_CONSTANTS.VIEW_JOB_DETAILS]);
  }

}
