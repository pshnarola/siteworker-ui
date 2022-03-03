import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { JobDetailService } from 'src/app/service/client-services/job-detail/job-detail.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { JobBidService } from 'src/app/service/worker-services/job-bid.service';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';

@Component({
  selector: 'app-view-more-job-details',
  templateUrl: './view-more-job-details.component.html',
  styleUrls: ['./view-more-job-details.component.css']
})
export class ViewMoreJobDetailsComponent implements OnInit {
  /*
    @author Vinita Jagwani
  */
  description;
  jobDetail;
  estimatedStartDate;
  pendingResponse = [];
  acceptedInvitations = [];
  pendingResponseData;
  jobData;
  retirement;
  id;
  showMore = false;
  certificates = [];
  status;
  subscription = new Subscription();
  jobDetailForm: FormGroup;
  screeningQuestions;
  perDiem;
  mileage;
  text: string;
  textLength = 10;
  show = false;
  linkColor: string;
  public showMoreText: string;
  public hide = true;
  public showOnlyText = false;
  lat: any;
  long: any;
  lng: any;
  markAsFavouriteParams;
  loginUserId: any;
  queryParam: URLSearchParams;
  checkParams;

  isFavourite: boolean;
  jobDescription: any;
  readMoreDialog = false;
  constructor(
    private captionChangeService: HeaderManagementService,
    private jobDetailService: JobDetailService,
    private route: ActivatedRoute,
    private router: Router,
    private localStorageService: LocalStorageService,
    private jobBidService: JobBidService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private confirmDialogueService: ConfirmDialogueService) {
    this.route.queryParams.subscribe(
      (params: Params) => {
        // tslint:disable-next-line: no-string-literal
        this.id = params['id'];
        this.getJobById(this.id);
      });
    this.loginUserId = this.localStorageService.getLoginUserId();
    this.checkParams = {
      jobDetailId: this.id,
      workerId: this.loginUserId,
    };
    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(true);
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.route.queryParams.subscribe(
      (params: Params) => {
        // tslint:disable-next-line: no-string-literal
        this.id = params['id'];
        this.getJobById(this.id);
      });
    this.isFavourite = this.checkJobIsFavourite();

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
  ngOnDestroy(): void {
    this.captionChangeService.hideSidebarSubject.next(false);
    this.captionChangeService.hideHeaderSubject.next(false);
  }

  checkJobIsFavourite(): boolean {
    this.checkParams = {
      jobDetailId: this.id,
      workerId: this.loginUserId,
    };
    this.queryParam = this.prepareQueryParam(this.checkParams);
    this.jobBidService.checkJobIsFavourite(this.queryParam).subscribe(data => {
      this.isFavourite = data.data;
    });
    return this.isFavourite;
  }
  markAsFavourite(): void {
    if (this.isFavourite === true) {
      this.markAsFavouriteParams = {
        jobDetailId: this.id,
        workerId: this.loginUserId,
        markAsFavourite: !this.isFavourite
      };
      this.queryParam = this.prepareQueryParam(this.markAsFavouriteParams);

      this.jobBidService.markAsFavourite(this.queryParam).subscribe(data => {
        if (data.statusCode === '200') {
          this.notificationService.success(this.translator.instant('removed.from.favourite'), 'Removed');
          this.isFavourite = false;
        }
      });
    }
    else {
      this.markAsFavouriteParams = {
        jobDetailId: this.id,
        workerId: this.loginUserId,
        markAsFavourite: true
      };
      this.queryParam = this.prepareQueryParam(this.markAsFavouriteParams);

      this.jobBidService.markAsFavourite(this.queryParam).subscribe(data => {
        if (data.statusCode === '200') {
          this.notificationService.success(this.translator.instant('marked.as.favourite'), '');
          this.isFavourite = true;

        }
      });
    }

  }
  applyForJob(): void {
    this.checkParams = {
      jobDetailId: this.id,
      workerId: this.loginUserId,
    };
    this.queryParam = this.prepareQueryParam(this.checkParams);
    this.jobBidService.startBidding(this.queryParam).subscribe(data => {
      if (data.statusCode === '200') {
        this.localStorageService.setItem('workerSelectedJob', data.data.jobDetail);
        this.router.navigate([PATH_CONSTANTS.APPLY_JOB]);
      }
    });

  }

  checkIfjobDetailsChanged(id, updatedDate): any {
    this.jobDetailService.checkIfJobDetailsChanged(id).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {
        if (data.data) {
          const updatedDateFromDb = data.data;
          if (updatedDate === updatedDateFromDb) {
            this.applyForJob();
          } else {
            this.openDialogToReapply();
          }
        } else {
          this.notificationService.error(data.message, '');
          setTimeout(() => {
            this.router.navigate([PATH_CONSTANTS.WOKER_JOB_LISTING]);
          }, 2000);
        }
      } else {
        this.notificationService.error(data.message, '');
        setTimeout(() => {
          this.router.navigate([PATH_CONSTANTS.WOKER_JOB_LISTING]);
        }, 2000);
      }
    });
  }

  openDialogToReapply(): void {
    let options = null;
    options = {
      title: 'Job details changed',
      message: 'While bidding, Job details have been updated by client. Please reapply after verifying updated details.',
      confirmText: this.translator.instant('dialog.confirm.text'),
    };
    this.confirmDialogueService.open(options);
    this.confirmDialogueService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        setTimeout(() => {
          this.router.navigate([PATH_CONSTANTS.WOKER_JOB_LISTING]);
        }, 1000);
      }
    });
  }


  getJobById(id): void {
    this.jobDetailService.getJobId(id).subscribe(data => {
      this.jobDetail = data.data;
      this.jobDescription = this.jobDetail.jobDetail.description.replace(/<[^>]*>/g, '');
      this.description = this.jobDetail.jobDetail.description;
      this.showMore = false;
      this.certificates = this.jobDetail.certificates;
      this.perDiem = this.jobDetail.jobDetail.isPerDiem;
      this.mileage = this.jobDetail.jobDetail.isPayForMilage;
      this.lat = this.jobDetail.jobDetail.latitude;
      this.lng = this.jobDetail.jobDetail.longitude;


      const date = new Date(this.jobDetail.jobDetail.estimatedStartDate);
      this.jobDetail.jobInvitees.forEach((jobInvitee: { status: string; }) => {
        if (jobInvitee.status === 'PENDING') {
          this.pendingResponse.forEach(pendingResponse => {
            this.pendingResponseData = pendingResponse;
          });
        } else {
          this.acceptedInvitations.push(this.jobDetail.jobInvitees);
        }
      });
    });


  }

  openDialogReadMore(description) {
    this.readMoreDialog = true;
  }
  closeReadMoreDialog() {
    this.readMoreDialog = false;
  }

}
