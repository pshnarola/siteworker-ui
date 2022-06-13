import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Paginator } from 'primeng/paginator';
import { Subscription } from 'rxjs';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { ProjectBidService } from 'src/app/service/subcontractor-services/project-bid/project-bid.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { JobsiteDetail } from '../../client/Vos/jobsitemodel';

@Component({
  selector: 'app-accept-project',
  templateUrl: './accept-project.component.html',
  styleUrls: ['./accept-project.component.css']
})
export class AcceptProjectComponent implements OnInit {
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  truncateLength = COMMON_CONSTANTS.TRUNCATE_LENGTH;

  projectDetail: any;
  isSelectedProject: boolean;
  selectedProject: any;
  subscription = new Subscription();
  first = 0;
  page = 0;

  estimatedStartDateDialog = false;
  estimatedStartDate = new Date();
  todayDate = new Date();
  estimatedStartDateForm: FormGroup;

  @ViewChild('paginator', { static: true }) paginator: Paginator

  columns = [
    { label: this.translator.instant('jobsite.title'), value: 'title' },
    { label: this.translator.instant('jobsite.desc'), value: 'description' },
    { label: this.translator.instant('cost'), value: 'cost' },
    { label: this.translator.instant('bid.amount'), value: 'bidAmount' },
    { label: this.translator.instant('city'), value: 'city' },
    { label: this.translator.instant('state'), value: 'state' },
    { label: this.translator.instant('zipcode'), value: 'zipCode' },
  ];

  loggedInUserId: any;
  queryParam;
  projectParams;
  jobsiteDetail: JobsiteDetail;
  jobsiteParams;
  isByJobsite = false;
  isByProject = false;
  hideAcceptRejectButton = false;
  projectStartDate: Date;
  projectCompletionDate: Date;
  projectBidDueDate: Date;

  constructor(
    private captionChangeService: HeaderManagementService,
    private translator: TranslateService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private confirmDialogService: ConfirmDialogueService,
    private projectBidService: ProjectBidService,
    private notificationService: UINotificationService,
  ) {
    this.loggedInUserId = this.localStorageService.getLoginUserId();

    this.captionChangeService.hideHeaderSubject.next(true);
  }

  ngOnInit(): void {
    this.getSelectedProjectDetails();
    this.captionChangeService.hideHeaderSubject.next(true);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getSelectedProjectDetails(): void {
    this.subscription.add(this.projectJobSelectionService.selectedProjectSubject.subscribe(data => {
      this.estimatedStartDate = new Date();
      const project = this.localStorageService.getItem('selectedProject');
      const projectFullData = this.localStorageService.getItem('selectedFullProjectDetail');
      if (project) {
        if (project.id === 'pid') {
          this.isSelectedProject = false;
          this.projectDetail = null;
        }
        else {
          this.projectDetail = project;
          this.setBidDetailOfJobsite();
          if (this.projectDetail !== null) {
            this.isSelectedProject = true;
            if (projectFullData) {
              if (projectFullData.biddingType === 'BY_JOBSITE') {
                this.isByJobsite = true;
              }
              else {
                this.isByProject = true;
                this.isByJobsite = false;
                this.hideAcceptRejectButton = false;

              }
            }
          }
        }
      }
      else {
        this.projectDetail = null;
      }
    }));
    this.subscription.add(this.projectJobSelectionService.selectedJobsiteSubject.subscribe(jobsiteData => {
      this.estimatedStartDate = new Date();
      const jobsite = this.localStorageService.getItem('selectedJobsite');
      if (jobsite) {
        if (jobsite.id === 'jid') {
          this.jobsiteDetail = null;
          if (this.isByJobsite) {
            this.hideAcceptRejectButton = true;
          }
          else {
            this.hideAcceptRejectButton = false;
          }
        }
        else {
          this.jobsiteDetail = jobsite;
          if (this.jobsiteDetail !== null) {
          }
          this.hideAcceptRejectButton = false;

        }
      }

    }));
  }

  setBidDetailOfJobsite() {
    let jobsiteFullDetail = this.localStorageService.getItem('selectedFullProjectDetail');
    if (jobsiteFullDetail.jobsites) {
      jobsiteFullDetail.jobsites.forEach(element => {
        this.projectDetail.jobsite.forEach(element1 => {
          if (element1.id === element.jobSiteDetail.id) {
            element1.bidAmount = element.subContractorCost;
          }
        });
      });
    }
  }

  paginate(event): void {
    this.first = event.first;
    this.size = event.rows;
    setTimeout(() => this.paginator.changePage(event.page));
  }

  private prepareQueryParam(paramObject): URLSearchParams {
    const params = new URLSearchParams();
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  onJobSiteClick(id): void {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_JOBSITE + "?jobsite=" + id);
  }

  acceptProject(projectId, estimatedStartDate): void {
    this.projectParams = {
      projectId,
      subContractorId: this.loggedInUserId,
      estimatedStartDate
    };
    this.queryParam = this.prepareQueryParam(this.projectParams);
    this.projectBidService.acceptProject(this.queryParam).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {
        this.notificationService.success(this.translator.instant('project.accepted'), '');
        this.localStorageService.removeItem('selectedProject');
        this.localStorageService.removeItem('selectedFullProjectDetail');
        this.localStorageService.removeItem('selectedJobsite');
        this.projectJobSelectionService.refreshSidebarAfterAcceptRejectProject.next('');
        this.hideDialog();
      } else {
        this.notificationService.error(data.errorCode, '');
      }
    });
  }

  rejectProject(projectId): void {
    this.projectParams = {
      projectId,
      subContractorId: this.loggedInUserId
    };
    this.queryParam = this.prepareQueryParam(this.projectParams);
    this.projectBidService.rejectProject(this.queryParam).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {
        this.notificationService.success(this.translator.instant('project.rejected'), '');
        this.localStorageService.removeItem('selectedProject');
        this.localStorageService.removeItem('selectedFullProjectDetail');
        this.localStorageService.removeItem('selectedJobsite');
        this.projectJobSelectionService.refreshSidebarAfterAcceptRejectProject.next('');
      } else {
        this.notificationService.error(data.errorCode, '');
      }
    });
  }

  acceptJobsite(jobSiteId, estimatedStartDate): void {
    this.jobsiteParams = {
      jobSiteId,
      subContractorId: this.loggedInUserId,
      estimatedStartDate
    };
    this.queryParam = this.prepareQueryParam(this.jobsiteParams);
    this.projectBidService.acceptJobsite(this.queryParam).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {
        this.notificationService.success(this.translator.instant('jobsite.accepted'), '');
        this.localStorageService.removeItem('selectedProject');
        this.localStorageService.removeItem('selectedFullProjectDetail');
        this.localStorageService.removeItem('selectedJobsite');
        this.projectJobSelectionService.refreshSidebarAfterAcceptRejectProject.next('');
        this.hideDialog();
      } else {
        this.notificationService.error(data.errorCode, '');
      }
    });
  }

  rejectJobsite(jobSiteId): void {
    this.jobsiteParams = {
      jobSiteId,
      subContractorId: this.loggedInUserId
    };
    this.queryParam = this.prepareQueryParam(this.jobsiteParams);
    this.projectBidService.rejectJobsite(this.queryParam).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {
        this.notificationService.success(this.translator.instant('jobsite.rejected'), '');
        this.localStorageService.removeItem('selectedProject');
        this.localStorageService.removeItem('selectedFullProjectDetail');
        this.localStorageService.removeItem('selectedJobsite');
        this.projectJobSelectionService.refreshSidebarAfterAcceptRejectProject.next('');
      } else {
        this.notificationService.error(data.errorCode, '');
      }
    });
  }

  openAcceptDialog(projectId, estimatedStartDate): void {
    if (estimatedStartDate) {
      let options = null;
      let message;
      message = this.translator.instant('are.you.sure.you.want.to.accept');
      options = {
        title: this.translator.instant('warning'),
        message,
        cancelText: this.translator.instant('dialog.cancel.text'),
        confirmText: this.translator.instant('dialog.confirm.text')
      };
      this.confirmDialogService.open(options);
      this.confirmDialogService.confirmed().subscribe(confirmed => {
        console.log('confirmed =>',confirmed);
        
        if (confirmed) {
          if (this.jobsiteDetail !== null && this.isByJobsite) {
            this.acceptJobsite(this.jobsiteDetail.id, estimatedStartDate);
          }
          else if (this.isByProject) {
            this.acceptProject(projectId, estimatedStartDate);
          }
        }
        else {
          const currentUrl = this.router.url;
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate([currentUrl]);
          });
        }
      });
    } else {
      this.notificationService.error('Estimated start date is mandatory', '');
    }
  }

  openRejectDialog(projectId): void {
    let options = null;
    let message;
    message = this.translator.instant('are.you.sure.you.want.to.reject');
    options = {
      title: this.translator.instant('warning'),
      message,
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        if (this.jobsiteDetail !== null && this.isByJobsite) {
          this.rejectJobsite(this.jobsiteDetail.id);
        }
        else if (this.isByProject) {
          this.rejectProject(projectId);
        }
      }
      else {
        const currentUrl = this.router.url;
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl]);
        });
      }
    });

  }

  addEstimatedStartDate() {
    this.estimatedStartDateDialog = true;
    this.estimatedStartDate = new Date();
  }

  hideDialog(): any {
    this.estimatedStartDateDialog = false;
    this.estimatedStartDate = new Date();
  }



}
