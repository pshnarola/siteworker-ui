import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver/dist/FileSaver';
import { Subscription } from 'rxjs';
import { JobsiteDetailService } from 'src/app/service/client-services/jobsite-details/jobsite-detail.service';
import { ProjectDetailService } from 'src/app/service/client-services/project-detail.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { MarkAsFavouriteService } from 'src/app/service/subcontractor-services/markAsFavourite/mark-as-favourite.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { ProjectDetail } from '../../client/Vos/projectDetailmodel';
import { ProjectBidDetail } from '../vos/ProjectBidDetail';
import { ProjectMarkAsFavourite } from '../vos/ProjectMarkAsFavourite';


@Component({
  selector: 'app-view-more-project-detail',
  templateUrl: './view-more-project-detail.component.html',
  styleUrls: ['./view-more-project-detail.component.css']
})
export class ViewMoreProjectDetailComponent implements OnInit, OnDestroy {

  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  truncateLength = COMMON_CONSTANTS.TRUNCATE_LENGTH;
  totalRecords;
  isShowAttachmentsDialog = false;
  attachmentList = [];
  loggedInUserId;
  loggedInUser;
  showMore = false;

  ////////////////
  filteredStateForJobsite = [];
  filteredCityForJobsite = [];
  filteredStatusForJobsite = [];
  jobsiteTitleParams;
  stateForJobsiteParams;
  cityForJobsiteParams;
  jobsiteTitle = [];
  cityArrayJobsite = [];
  stateArrayJobsite = [];
  statusFilterForJobsite = [];
  jobsiteKeyword: any;
  jobsitezipcode: any;
  costFlage = false;
  filterMapOfJobsite = new Map();
  filterMap = new Map();
  globalFilterOfJobsite;
  globalFilter;
  offset = 0;
  datatableParamofJobsite: DataTableParam;
  datatableParam: DataTableParam;

  columns = [
    { label: this.translator.instant('jobsite.title'), value: 'title', sortable: true },
    { label: this.translator.instant('description'), value: 'description', sortable: true },
    { label: this.translator.instant('city'), value: 'city', sortable: true },
    { label: this.translator.instant('state'), value: 'state', sortable: true },
    { label: this.translator.instant('zipcode'), value: 'zipCode', sortable: true },
    { label: this.translator.instant('bid.amount'), value: 'cost', sortable: true },
    { label: this.translator.instant('document'), value: 'document', sortable: false },
  ];

  id;
  isFavourite = false;
  projectMarkAsFavourite: ProjectMarkAsFavourite;
  projectDetail = new ProjectDetail();
  jobSiteDetail = [];
  jobsiteData: any[];
  queryParam: URLSearchParams;
  sortOrder = 0;
  sortField: any = 'created_date';

  projectBidDetail: ProjectBidDetail;

  projectBidDetailDto: ProjectBidDetail;

  subscription = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private captionChangeService: HeaderManagementService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private _projectDetailService: ProjectDetailService,
    private _jobSiteDetailService: JobsiteDetailService,
    private localStorageService: LocalStorageService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private _notificationService: UINotificationService,
    private filterLeftPanelService: FilterLeftPanelDataService,
    private markAsFavouriteService: MarkAsFavouriteService,
  ) {
    this.projectMarkAsFavourite = new ProjectMarkAsFavourite();
    this.projectBidDetailDto = new ProjectBidDetail();


    this.loggedInUser = this.localStorageService.getLoginUserObject();
    this.loggedInUserId = this.localStorageService.getLoginUserId();
    this.captionChangeService.hideHeaderSubject.next(true);
    this.projectJobSelectionService.showJobsiteListFilter.next(true);
    this.route.queryParams.subscribe(
      (params: Params) => {
        this.id = params.user;
        this.getProjectById(this.id);
        this.getProjectByIdAndUserId();
      });
  }

  ngOnDestroy(): void {
    this.projectJobSelectionService.showSubcontractorSidebarList.next(true);
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.projectJobSelectionService.showJobsiteListFilter.next(true);
    this.subscription.add(this.filterLeftPanelService.jobSiteListFilter.subscribe(data => {
      this.filterJobsite(data);
    }));
  }

  showDialog(list) {
    this.isShowAttachmentsDialog = true;
    this.attachmentList = list;
  }

  hideDialog() {
    this.isShowAttachmentsDialog = false;
    this.attachmentList = [];
  }

  downloadAttachments(id) {
    this._projectDetailService.downloadJobsiteAttachments(id).subscribe(
      data => {
        const blob = new Blob([data], { type: 'application/zip' });
        const fileName = 'jobsite-attachments.zip';
        saveAs(blob, fileName);
      },
      (error) => {
        this._notificationService.error(this.translator.instant('common.error'), '');
      });
  }

  markAsFavourite() {
    if (this.projectMarkAsFavourite.id !== undefined) {
      this.projectMarkAsFavourite.id = this.projectMarkAsFavourite.id;
      this.projectMarkAsFavourite.subContractor = this.loggedInUser;
      this.projectMarkAsFavourite.projectDetail = this.projectDetail;
      this.projectMarkAsFavourite.createdBy = this.loggedInUserId;
      this.projectMarkAsFavourite.updatedBy = this.loggedInUserId;
      this.projectMarkAsFavourite.hasMarkedFavourite = !this.isFavourite;
      this.markAsFavouriteService.UpdateMarkAsFavourite(this.projectMarkAsFavourite).subscribe(
        data => {
          if (data.statusCode === '200') {
            this.getProjectByIdAndUserId();
            if (data.data.hasMarkedFavourite) {
              this.notificationService.success(this.translator.instant('marked.as.favourite'), '');
            } else {
              this.notificationService.success(this.translator.instant('removed.from.favourite'), '');
            }
          } else {
            this.notificationService.error(data.message, '');
          }
        });
    } else {
      this.projectMarkAsFavourite = new ProjectMarkAsFavourite();
      this.projectMarkAsFavourite.subContractor = this.loggedInUser;
      this.projectMarkAsFavourite.projectDetail = this.projectDetail;
      this.projectMarkAsFavourite.createdBy = this.loggedInUserId;
      this.projectMarkAsFavourite.updatedBy = this.loggedInUserId;
      this.projectMarkAsFavourite.hasMarkedFavourite = true;
      this.markAsFavouriteService.AddMarkAsFavourite(this.projectMarkAsFavourite).subscribe(
        data => {
          if (data.statusCode === '200') {
            this.getProjectByIdAndUserId();
            this.notificationService.success(this.translator.instant('marked.as.favourite'), '');
          } else {
            this.notificationService.error(data.message, '');
          }
        });
    }
  }

  getProjectByIdAndUserId() {
    const filterMap = new Map();
    filterMap.set('SUBCONTRACTOR_ID', this.loggedInUserId);
    filterMap.set('PROJECT_DETAIL_ID', this.id);
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParam = {
      offset: this.offset,
      size: 1,
      sortField: 'CREATED_DATE',
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.markAsFavouriteService.checkProjectsIsFavourite(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.data.result.length !== 0) {
            this.isFavourite = data.data.result[0].hasMarkedFavourite;
            this.projectMarkAsFavourite = data.data.result[0];
          } else {
            this.projectMarkAsFavourite = new ProjectMarkAsFavourite();
          }
        }
      });
  }

  getProjectById(id) {
    this._projectDetailService.getProjectByProjectId(id).subscribe(
      data => {
        this.projectDetail = data.data;
        this.getJobsiteListByProjectId();
      }
    );
  }

  private prepareQueryParam(paramObject): URLSearchParams {
    const params = new URLSearchParams();
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  getJobsiteListByProjectId() {
    this.globalFilter = `{"PROJECT_ID":"${this.id}"}`;
    this.datatableParam = {
      offset: this.offset,
      size: this.projectDetail.jobsite.length,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this._jobSiteDetailService.getJobsiteDetailList(this.queryParam).subscribe(
      data => {
        this.jobSiteDetail = data.data.result;
        this.totalRecords = data.data.totalRecords;
      }
    );
  }

  goToJobsite(id) {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_JOBSITE + '?jobsite=' + id);
  }

  goToBid() {
    this.localStorageService.removeItem('selectedFullProjectDetail');
    this.localStorageService.setItem('selectedProject', this.projectDetail, false);
    if (!this.isFavourite) {
      this.localStorageService.setItem('viewMoreProjectDetail', this.projectDetail, false);
    }
    this.router.navigate([PATH_CONSTANTS.SELECT_JOBSITE]);
  }

  public filterJobsite(jobsiteFilerFormGroup: FormGroup): void {
    this.jobsiteData = [];
    this.jobsiteTitle.length = 0;
    this.cityArrayJobsite.length = 0;
    this.stateArrayJobsite.length = 0;
    this.costFlage = false;
    this.filterMapOfJobsite.clear();

    this.filterMapOfJobsite.set('PROJECT_ID', this.id);
    if (jobsiteFilerFormGroup.value.jobSiteTitle) {
      jobsiteFilerFormGroup.value.jobSiteTitle.forEach(element => {
        this.jobsiteTitle.push(element);
        this.filterMapOfJobsite.set('TITLE', this.jobsiteTitle.toString());
      });
    }
    if (jobsiteFilerFormGroup.value.state) {
      jobsiteFilerFormGroup.value.state.forEach(element => {
        this.stateArrayJobsite.push(element);
        this.filterMapOfJobsite.set('STATE', this.stateArrayJobsite.toString());
      });
    }
    if (jobsiteFilerFormGroup.value.city) {
      jobsiteFilerFormGroup.value.city.forEach(element => {
        this.cityArrayJobsite.push(element);
        this.filterMapOfJobsite.set('CITY', this.cityArrayJobsite.toString());
      });
    }

    if (jobsiteFilerFormGroup.value.zipCode) {
      this.filterMapOfJobsite.set('ZIP_CODE', jobsiteFilerFormGroup.value.zipCode);
    }

    if (jobsiteFilerFormGroup.value.min) {
      this.filterMapOfJobsite.set('GREATER_THAN_COST', jobsiteFilerFormGroup.value.min);
    }

    if (jobsiteFilerFormGroup.value.max) {
      this.filterMapOfJobsite.set('LESS_THAN_COST', jobsiteFilerFormGroup.value.max);
    }

    const jsonObject = {};
    this.filterMapOfJobsite.forEach((value, key) => {
      jsonObject[key] = value;
    });

    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParamofJobsite = {
      offset: this.offset,
      size: this.projectDetail?.jobsite.length,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };

    this.queryParam = this.prepareQueryParam(this.datatableParamofJobsite);
    this._jobSiteDetailService.getJobsiteDetailList(this.queryParam).subscribe(
      data => {
        if (data.data.totalRecord !== 0) {
          this.jobSiteDetail = data.data.result;
          this.totalRecords = data.data.totalRecords;
          this.filterMapOfJobsite.clear();
        } else {
          this.jobSiteDetail = null;
          this.filterMapOfJobsite.clear();
        }
      },
      error => {
        this._notificationService.error(this.translator.instant('common.error'), '');
      });

  }

}
