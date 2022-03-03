import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ClipboardService } from 'ngx-clipboard';
import { Subscription } from 'rxjs';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { PostJobServiceService } from 'src/app/post-job-service.service';
import { JobDetailService } from 'src/app/service/client-services/job-detail/job-detail.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { UserService } from 'src/app/service/User.service';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { User } from 'src/app/shared/vo/User';
@Component({
  selector: 'app-view-job-details',
  templateUrl: './view-job-details.component.html',
  styleUrls: ['./view-job-details.component.css']
})
export class ViewJobDetailsComponent implements OnInit, OnDestroy {
  /*
    @author Vinita Jagwani
  */
  description;
  jobDetail;
  supervisorId;
  dataTableParam: DataTableParam;
  estimatedStartDate;
  pendingResponse = [];
  acceptedInvitations = [];
  pendingResponseData = [];
  jobData;
  retirement;
  id;
  showMore = false;
  certificates = [];
  status;
  queryParam;
  supervisorList;
  subscription = new Subscription();
  jobDetailForm: FormGroup;
  screeningQuestions;
  lat: void;
  lng: any;
  changeStatusParam;
  isSelectedJob: boolean;
  selectedJob: any;
  jobInvitees: any;
  statusFlag = false;
  mysupervisor;
  jobStatus;
  statusList = [
    { label: 'Canceled', value: 'CANCELLED' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
  ];
  filteredStatus: any[];
  filteredSupervisor: any[];
  hiredWorkers = [];
  offeredWorkers = [];
  jobInviteeData = [];
  disableStatusFlag = false;
  disableStatusFlag1 = false;
  loggedInUserId: any;
  supervisorParam: {};
  statusSelected: any;
  roleName: any;

  isContentToggled: boolean;
  nonEditedContent: string;
  content: string;
  limit: number;
  completeWords: boolean;

  show = false;
  readMoreDialog = false;
  jobDescription: any;
  externalLink;
  constructor(
    private captionChangeService: HeaderManagementService,
    private jobDetailService: JobDetailService,
    private projectJobSelectionService: ProjectJobSelectionService, private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private postJobService: PostJobServiceService,
    private userService: UserService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private localStorageService: LocalStorageService,
    private confirmDialogService: ConfirmDialogueService,
    private clipboardService: ClipboardService,
  ) {
    this.dataTableParam = new DataTableParam();
    this.dataTableParam = {
      offset: 0,
      size: 2,
      sortField: 'FIRST_NAME',
      sortOrder: 1,
      searchText: '{"ROLE_NAME": "SUPERVISOR"}'
    };
    this.loggedInUserId = this.localStorageService.getLoginUserId();
    this.disableStatusFlag = false;
    this.disableStatusFlag1 = false;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.getSupervisorList();
    this.checkRoleOfUser();
    this.postJobService.initializeJobDetailsForm();
    this.captionChangeService.hideHeaderSubject.next(true);
    this.route.queryParams.subscribe(
      (params: Params) => {
        // tslint:disable-next-line: no-string-literal
        this.id = params['id'];
      });
    this.getSelectedJobDetails();

  }

  checkRoleOfUser() {
    let loggedInUser = this.localStorageService.getLoginUserObject();
    this.roleName = loggedInUser.roles[0].roleName;
  }



  filterStatus(event): void {
    const filtered: any[] = [];
    const query = event.query;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.statusList.length; i++) {
      const statusData = this.statusList[i];
      if (statusData.label.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(statusData);
      }
    }


    this.filteredStatus = filtered;
    this.filteredStatus = this.filteredStatus.sort();

  }
  filterSupervisor(event): void {
    const filtered: any[] = [];
    const query = event.query;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.supervisorList.length; i++) {
      const supervisor = this.supervisorList[i];
      if (supervisor.firstName.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(supervisor);
      }
    }


    this.filteredSupervisor = filtered;
    this.filteredSupervisor = this.filteredSupervisor.sort();

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
  getSupervisorList(): void {
    this.userService.getSupervisorByClientAndIsActive(this.loggedInUserId).subscribe(data => {
      this.supervisorList = data.data;
    });
  }

  getSelectedJobDetails(): void {
    this.subscription.add(this.projectJobSelectionService.selectedJobSubject.subscribe(data => {
      this.showMore = false;
      const job = this.localStorageService.getSelectedJob();
      if (job) {
        if (job.id === 'jobId') {
          this.isSelectedJob = false;
          this.selectedJob = null;
        }
        else {
          this.selectedJob = job;
          if (this.selectedJob !== null) {
            this.externalLink = CommonUtil.createExternalURLForJob(this.selectedJob.title, this.selectedJob.id);
            this.jobDescription = this.selectedJob.description.replace(/<[^>]*>/g, '');
            this.show = false;
            this.isSelectedJob = true;
            this.lat = this.selectedJob.latitude;
            this.lng = this.selectedJob.longitude;
            if (this.selectedJob.status === 'COMPLETED' || this.selectedJob.status === 'CANCELLED' || this.selectedJob.status === 'DRAFT') {
              this.disableStatusFlag1 = true;
            } else {
              this.disableStatusFlag1 = false;
              this.disableStatusFlag = false;
            }
            if (this.selectedJob.status === 'IN_PROGRESS') {
              this.statusList = [
                { label: 'Canceled', value: 'CANCELLED' },
                { label: 'Completed', value: 'COMPLETED' }
              ];
            }
            else {
              this.statusList = [
                { label: 'Canceled', value: 'CANCELLED' },
                { label: 'Completed', value: 'COMPLETED' },
                { label: 'In Progress', value: 'IN_PROGRESS' },
              ];
            }
            // tslint:disable-next-line: no-shadowed-variable
            this.jobDetailService.getJobId(this.selectedJob.id).subscribe(data => {
              this.certificates = data.data.certificates;
              this.screeningQuestions = data.data.screeningQuestions;
              this.jobInvitees = data.data.jobInvitees;
              this.hiredWorkers = data.data.hiredWorker;
              this.offeredWorkers = data.data.offeredWorkers;
              this.pendingResponseData.length = 0;
              this.acceptedInvitations.length = 0;
              data.data.jobInvitees.forEach(jobInvitee => {

                if (jobInvitee.status === 'PENDING') {
                  this.pendingResponseData.push(jobInvitee);
                } else if (jobInvitee.status === 'ACCEPTED' || jobInvitee.status === 'ACCEPTED_PENDING') {
                  this.acceptedInvitations.push(jobInvitee);
                }
              });
            });
          }
        }
      }
    }));
  }
  initializeForm(): void {
    this.jobDetailForm = this.formBuilder.group({
      id: [],
      status: []
    });
  }
  assignSupervisor(jobId, event): void {
    this.statusFlag = false;
    this.supervisorParam = {
      jobDetailId: jobId,
      supervisorId: event.id
    };
    this.queryParam = this.prepareQueryParam(this.supervisorParam);
    this.jobDetailService.assignSupervisor(this.queryParam).subscribe(data => {
      if (data.message === 'OK' && data.statusCode === '200') {
        this.notificationService.success(this.translator.instant('job.assigned.to.supervisor'), '');
        this.projectJobSelectionService.addJobSubject.next(data.data);
      }
    });
  }
  openSupervisorDialog(jobId, event): void {
    let options = null;
    let message;
    message = this.translator.instant('are.you.sure.you.want.to.assign.the.supervisor');
    options = {
      title: this.translator.instant('warning'),
      message,
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.assignSupervisor(jobId, event);
      }
      else {
        const currentUrl = this.router.url;
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl]);
        });
      }
    });

  }
  setStatus(status): void {
    this.statusFlag = true;
    this.status = status.value;
    if (this.status === 'IN_PROGRESS') {
      this.statusList = [
        { label: 'Canceled', value: 'CANCELLED' },
        { label: 'Completed', value: 'COMPLETED' }
      ];
    }
    if (this.status === 'CANCELLED' || this.status === 'COMPLETED') {
      this.disableStatusFlag = true;
    }
    else {
      this.disableStatusFlag = false;
    }
    this.changeStatusParam = {
      id: this.selectedJob.id,
      status: this.status
    };
    this.queryParam = this.prepareQueryParam(this.changeStatusParam);
    this.jobDetailService.setStatus(this.queryParam).subscribe(data => {
      if (data.message === 'OK' && data.statusCode === '200') {
        this.notificationService.success(this.translator.instant('job.status.updated'), '');
        this.projectJobSelectionService.addJobSubject.next(data.data);
      }
    });
  }
  redirectToWorker(id): void {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_WORKER_PROFILE + "?user=" + id);
  }
  openDialog(event): void {
    let options = null;
    let message;
    if (event.value === 'IN_PROGRESS') {
      message = this.translator.instant('no.of.opening.doesnot.match.accepted');
    }
    else {
      message = this.translator.instant('are.you.sure.you.want.to.change.the.status');
    }
    options = {
      title: this.translator.instant('warning'),
      message,
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.setStatus(event);
      }
      else {
        const currentUrl = this.router.url;
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl]);
        });
      }
    });
  }
  getFullName(data: User) {
    return data.firstName + ' ' + data.lastName;
  }
  openDialogReadMore(description) {
    this.readMoreDialog = true;
  }
  closeReadMoreDialog() {
    this.readMoreDialog = false;
  }
  copyExternalLink() {
    this.clipboardService.copyFromContent(this.externalLink);
    this.notificationService.success('Copied to clipboard', '');
  }
}
