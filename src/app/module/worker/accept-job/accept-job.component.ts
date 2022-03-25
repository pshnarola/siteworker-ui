import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { JobBidService } from 'src/app/service/worker-services/job-bid.service';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { WorkerSidebarJobListService } from 'src/app/shared/worker-sidebar-job-list.service';

@Component({
  selector: 'app-accept-job',
  templateUrl: './accept-job.component.html',
  styleUrls: ['./accept-job.component.css']
})
export class AcceptJobComponent implements OnInit {
  loggedInUserId: any;
  getJobBidDetailParams: { jobDetailId: any; workerId: any; };
  queryParam: any;
  jobBidDetail: any;
  jobBidScreeningQuestionAndAnswers = [];
  lat: any;
  lng: any;
  jobBidCertificates = [];
  jobCertificates = [];
  jobParams: { jobDetailId: any; workerId: any; };
  statusFlag = false;
  status: any;
  subscription = new Subscription();
  showMore = false;
  jobDescription: any;
  readMoreDialog = false;
  constructor(private captionChangeService: HeaderManagementService,
    private workerSideBarJobListService: WorkerSidebarJobListService,
    private jobBidService: JobBidService,
    private localStorageService: LocalStorageService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private confirmDialogService: ConfirmDialogueService,
    private router: Router) { }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.loggedInUserId = this.localStorageService.getLoginUserId();
    this.subscription.add(this.workerSideBarJobListService.workerSidebarJobChanged.subscribe(data => {
      this.showMore = false;
      let job = this.localStorageService.getItem('workerSelectedJob');
      if (job) {
        this.getJobBidDetailByJobAndWorker(job.id, this.loggedInUserId);
      }
      else {
        this.jobBidDetail = null;
      }
    }));
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.localStorageService.removeItem('workerSelectedJob');
    this.localStorageService.removeItem('workerSelectedJobFromNotification');
  }
  private prepareQueryParam(paramObject): URLSearchParams {
    const params = new URLSearchParams();
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  getJobBidDetailByJobAndWorker(jobId, workerId): void {
    this.getJobBidDetailParams = {
      jobDetailId: jobId,
      workerId,
    };
    this.queryParam = this.prepareQueryParam(this.getJobBidDetailParams);
    this.jobBidService.getJobBidDetailByJobAndWorker(this.queryParam).subscribe(data => {
      this.jobBidDetail = data.data;
      this.lat = this.jobBidDetail.jobBidDetail.jobDetail.latitude;
      this.lng = this.jobBidDetail.jobBidDetail.jobDetail.longitude;
      this.jobDescription = this.jobBidDetail.jobBidDetail.jobDetail.description.replace(/<[^>]*>/g, '');
      this.getJobBidScreeningQuestions(this.jobBidDetail);
      this.getJobBidCertificates(this.jobBidDetail);
      if (this.jobBidDetail.jobBidDetail.status === 'ACCEPTED' || this.jobBidDetail.jobBidDetail.status === 'REJECTED') {
        this.statusFlag = true;
      }
      else {
        this.statusFlag = false;
      }
    });
  }
  getJobBidScreeningQuestions(jobBidDetail): void {
    this.jobBidScreeningQuestionAndAnswers.length = 0;
    jobBidDetail.jobBidScreeningQuestion.forEach(element => {
      this.jobBidScreeningQuestionAndAnswers.push(element);
    });
  }
  getJobBidCertificates(jobBidDetail): void {
    this.jobBidCertificates.length = 0;
    this.jobCertificates.length = 0;
    jobBidDetail.jobBidCertificates.forEach(element => {
      this.jobBidCertificates.push(element.name);
    });
    jobBidDetail.jobCertificates.forEach(element => {
      this.jobCertificates.push(element.name);
    });
    this.jobCertificates = this.jobCertificates.filter(val => !this.jobBidCertificates.includes(val));
  }
  acceptJob(jobId): void {
    this.jobParams = {
      jobDetailId: jobId,
      workerId: this.loggedInUserId
    };
    this.queryParam = this.prepareQueryParam(this.jobParams);
    this.jobBidService.acceptJob(this.queryParam).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {
        this.notificationService.success(this.translator.instant('job.accepted'), '');
        this.localStorageService.removeItem('workerSelectedJob');
        this.workerSideBarJobListService.workerSidebarJobChanged.next(data.data.jobDetail);

        this.workerSideBarJobListService.refreshSidebarAfterAcceptReject.next('');
      }
    });
  }
  rejectJob(jobId): void {
    this.jobParams = {
      jobDetailId: jobId,
      workerId: this.loggedInUserId
    };
    this.queryParam = this.prepareQueryParam(this.jobParams);
    this.jobBidService.rejectJob(this.queryParam).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {
        this.notificationService.success(this.translator.instant('job.rejected'), '');
        this.localStorageService.removeItem('workerSelectedJob');
        this.workerSideBarJobListService.workerSidebarJobChanged.next(data.data.jobDetail);
        this.workerSideBarJobListService.refreshSidebarAfterAcceptReject.next('');
        this.workerSideBarJobListService.refreshSidebarAfterAcceptReject.next('');
      }
    });
  }
  openAcceptDialog(jobId): void {
    let options = null;
    let message;
    message = this.translator.instant('are.you.sure.you.want.to.accept.the.job?');
    options = {
      title: this.translator.instant('warning'),
      message,
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.acceptJob(jobId);
      }
      else {
        const currentUrl = this.router.url;
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl]);
        });
      }
    });

  }
  openRejectDialog(jobId): void {
    let options = null;
    let message;
    message = this.translator.instant('are.you.sure.you.want.to.reject.the.job?');
    options = {
      title: this.translator.instant('warning'),
      message,
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.rejectJob(jobId);
      }
      else {
        const currentUrl = this.router.url;
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl]);
        });
      }
    });

  }
  openselectJobDialog(): void {
    let options = null;
    options = {
      title: 'Suggestion',
      message: 'Please Select at least one Job',
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        let currentUrl = this.router.url;
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl]);
        });
      }
    });
  }
  openDialogReadMore(description) {
    this.readMoreDialog = true;
  }
  closeReadMoreDialog() {
    this.readMoreDialog = false;
  }
}
