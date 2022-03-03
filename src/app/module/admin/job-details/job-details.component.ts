import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { ClipboardService } from 'ngx-clipboard';
import { Subscription } from 'rxjs';
import { PostJobServiceService } from 'src/app/post-job-service.service';
import { JobDetailService } from 'src/app/service/client-services/job-detail/job-detail.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';

@Component({
  selector: 'app-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.css']
})
export class JobDetailsComponent implements OnInit {

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
    { label: 'Canceled', value: 'CANCELED' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
  ];
  filteredStatus: any[];
  filteredSupervisor: any[];
  hiredWorkers = [];
  offeredWorkers = [];
  jobInviteeData = [];
  loggedInUserId: any;
  supervisorParam: {};
  statusSelected: any;
  jobDescription: any;
  readMoreDialog = false;
  externalLink;

  constructor(
    private captionChangeService: HeaderManagementService,
    private jobDetailService: JobDetailService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private route: ActivatedRoute,
    private postJobService: PostJobServiceService,
    private localStorageService: LocalStorageService,
    private clipboardService: ClipboardService,
    private notificationService: UINotificationService) {

    this.loggedInUserId = this.localStorageService.getLoginUserId();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.localStorageService.removeItem('workerSelectedJob');
  }

  ngOnInit(): void {
    this.postJobService.initializeJobDetailsForm();
    this.captionChangeService.hideHeaderSubject.next(true);
    this.route.queryParams.subscribe(
      (params: Params) => {
        // tslint:disable-next-line: no-string-literal
        this.id = params['id'];
      });
    this.getSelectedJobDetails();

  }
  getSelectedJobDetails(): void {
    this.subscription.add(this.projectJobSelectionService.selectedJobSubject.subscribe(data => {
      this.showMore = false;
      const job = this.localStorageService.getSelectedJob();
      this.jobStatus = job.status;
      if (job.id === 'jobId') {
        this.isSelectedJob = false;
        this.selectedJob = null;
      }
      else {
        this.selectedJob = job;
        if (this.selectedJob !== null) {
          this.externalLink = CommonUtil.createExternalURLForJob(this.selectedJob.title, this.selectedJob.id);
          this.jobDescription = this.selectedJob.description.replace(/<[^>]*>/g, '');
          this.isSelectedJob = true;
          this.lat = this.selectedJob.latitude;
          this.lng = this.selectedJob.longitude;
          if (this.selectedJob.status === 'IN_PROGRESS') {
            this.statusList = [
              { label: 'Canceled', value: 'CANCELED' },
              { label: 'Completed', value: 'COMPLETED' }
            ];
          }
          else {
            this.statusList = [
              { label: 'Canceled', value: 'CANCELED' },
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
    }));
  }

  redirectToWorker(id): void {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_WORKER_PROFILE + "?user=" + id);
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
