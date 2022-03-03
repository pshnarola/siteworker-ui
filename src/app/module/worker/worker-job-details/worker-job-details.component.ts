import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { JobBidService } from 'src/app/service/worker-services/job-bid.service';
import { WorkerSidebarJobListService } from 'src/app/shared/worker-sidebar-job-list.service';

@Component({
  selector: 'app-worker-job-details',
  templateUrl: './worker-job-details.component.html',
  styleUrls: ['./worker-job-details.component.css']
})
export class WorkerJobDetailsComponent implements OnInit {
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
  readMoreDialog = false;
  jobDescription: any;
  constructor(
    private captionChangeService: HeaderManagementService,
    private workerSideBarJobListService: WorkerSidebarJobListService,
    private jobBidService: JobBidService,
    private localStorageService: LocalStorageService,
  ) { }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.loggedInUserId = this.localStorageService.getLoginUserId();
    this.subscription.add(this.workerSideBarJobListService.workerSidebarJobChanged.subscribe(data => {
      this.showMore = false;
      let job = this.localStorageService.getItem('workerSelectedJob');
      this.getJobBidDetailByJobAndWorker(data.id, this.loggedInUserId);
    }));
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.captionChangeService.hideHeaderSubject.next(false);
    this.localStorageService.removeItem('workerSelectedJob');
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
  openDialogReadMore(description) {
    this.readMoreDialog = true;
  }
  closeReadMoreDialog() {
    this.readMoreDialog = false;
  }
}
