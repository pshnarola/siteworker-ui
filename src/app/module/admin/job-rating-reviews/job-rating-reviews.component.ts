import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { concatMap, groupBy, map, toArray } from 'rxjs/operators';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { RantingAndReviewService } from 'src/app/service/rating-and-review/ranting-and-review.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { JobDetails } from '../../client/post-job/job-details';
import { ClientRatingDTO } from '../client-rating-dto';
import { RatingDTO } from '../rating-dto';
import { WorkerRatingDTO } from '../worker-rating-dto';

@Component({
  selector: 'app-job-rating-reviews',
  templateUrl: './job-rating-reviews.component.html',
  styleUrls: ['./job-rating-reviews.component.css']
})
export class JobRatingReviewsComponent implements OnInit {
  columns = [
    { label: 'Given by Client to Worker', value: 'clientToWorker', sortable: true },
    { label: 'Given by Worker to Client', value: 'workerToClient', sortable: true }
  ];
  myForm: FormGroup;
  status = [{ label: 'All', value: 'All' },
  { label: 'Reported to Admin', value: 'REPORTED_TO_ADMIN' }];
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  totalRecords;
  datatableParam = new DataTableParam();
  jobDetail: JobDetails;
  globalFilter;
  queryParam: URLSearchParams;
  jobRatingAndReviewList = [];
  rating = 4;
  submittedByClientRatingList = [];
  submittedByworkerRatingList = [];
  submittedToworkerRatingList = [];
  submittedToclientRatingList = [];
  ratingDTO: RatingDTO[] = [];
  clientRatingDTO = new ClientRatingDTO();
  workerRatingDTO = new WorkerRatingDTO();
  filterFlag: boolean;
  groupedJobRating: any[] = [];
  isFilterOpened = false;
  subscription = new Subscription();

  //subadmin 
  userAccess: any;
  showButtons = true;
  btnDisabled = false;

  constructor(
    private captionChangeService: HeaderManagementService,
    private formBuilder: FormBuilder,
    private projectJobSelectionService: ProjectJobSelectionService,
    private localStorageService: LocalStorageService,
    private ratingReviewService: RantingAndReviewService,
    private notificationService: UINotificationService,
    private router: Router,
    private confirmDialogService: ConfirmDialogueService,
    private translator: TranslateService,) {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.datatableParam = {
      offset: 0,
      size: this.size,
      sortField: '',
      sortOrder: 1,
      searchText: null
    };
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.subscription.add(this.projectJobSelectionService.selectedJobSubject.subscribe(e => {
      const job = this.localStorageService.getSelectedJob();
      this.jobDetail = job;
      if (this.jobDetail) {
        if (this.jobDetail.id !== 'jobId') {
          this.getRatingReviewList(this.jobDetail.id);
        }
        else {
          this.getRatingReviewList();
        }
      }
      else {
        this.getRatingReviewList();
      }
    }));
    // this.getRatingReviewList();
    this.initializeForm();

    this.userAccess = this.localStorageService.getItem('userAccess');
    if (this.userAccess) {
      this.menuAccess();
    }

  }
  menuAccess(): void {
    const accessPermission = this.userAccess.filter(e => e.menuName == 'Jobs');
    if (accessPermission[0].canModify) {
      this.showButtons = true;
      this.btnDisabled = false;
    }
    else {
      this.showButtons = false;
      this.btnDisabled = true;
    }
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  onFilterOpen(): void {
    this.isFilterOpened = !this.isFilterOpened;
  }
  initializeForm(): void {
    this.myForm = this.formBuilder.group({
      status: []
    });
  }
  groupBy(): void {
    this.groupedJobRating = [];
    const records = this.jobRatingAndReviewList;

    const pipedRecords = new Subject();
    const result = pipedRecords.pipe(
      groupBy(
        (x: any) => x.jobDetail.id,
        null,
        null,
        () => new ReplaySubject()
      ),
      concatMap(
        object => object.pipe(
          toArray(),
          map(obj =>
            ({ key: object.key, value: obj })
          ))
      )
    );

    result.subscribe(x => {
      this.groupedJobRating.push(x);
    });

    records.forEach(x => { pipedRecords.next(x); });
    pipedRecords.complete();

  }
  filter(): void {
    this.filterFlag = true;

    this.getRatingReviewList(this.jobDetail.id);
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
  clear() {
    this.filterFlag = false;
    this.myForm.reset();
    this.getRatingReviewList(this.jobDetail.id);
  }
  getRatingReviewList(id?): void {
    const filterMap = new Map();
    if (this.filterFlag) {
      if (this.myForm.value.status === 'REPORTED_TO_ADMIN') {
        filterMap.set('IS_REPORT_TO_ADMIN', true);
      }
    }
    if (this.jobDetail) {
      if (this.jobDetail.id !== 'jobId') {
        filterMap.set('JOB_ID', id);
      }
    }
    filterMap.set('POST_TYPE', 'JOBS');
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);

    this.datatableParam = {
      offset: 0,
      size: 10000,
      sortField: '',
      sortOrder: 1,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.ratingDTO = [];
    this.jobRatingAndReviewList.length = 0;
    this.ratingReviewService.getRatingReviewList(this.queryParam).subscribe(
      data => {

        this.ratingDTO = [];
        this.jobRatingAndReviewList.length = 0;
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.jobRatingAndReviewList = data.data.result;

            this.groupBy();
            this.groupedJobRating.forEach(data => {
              this.submittedByClientRatingList.length = 0;
              this.submittedByworkerRatingList.length = 0;
              this.submittedToclientRatingList.length = 0;
              this.submittedToworkerRatingList.length = 0;
              data.value.forEach(dataElement => {
                if (dataElement.submittedBy.roles[0].roleName === 'CLIENT') {
                  this.submittedByClientRatingList.push(dataElement);
                }
                if (dataElement.submittedBy.roles[0].roleName === 'WORKER') {
                  this.submittedByworkerRatingList.push(dataElement);
                }
                if (dataElement.submittedTo.roles[0].roleName === 'WORKER') {
                  this.submittedToworkerRatingList.push(dataElement);
                }
                if (dataElement.submittedTo.roles[0].roleName === 'CLIENT') {
                  this.submittedToclientRatingList.push(dataElement);
                }
              });
              this.submittedByClientRatingList.forEach(elementClientBy => {
                this.submittedByworkerRatingList.forEach(elementWorkerBy => {
                  if ((elementClientBy.submittedBy.id === elementWorkerBy.submittedTo.id) &&
                    (elementClientBy.submittedTo.id === elementWorkerBy.submittedBy.id)) {
                    const temp = {
                      clientRating: {
                        rating: elementClientBy.rating,
                        ratingText: elementClientBy.ratingText,
                        name: elementClientBy.submittedBy.firstName,
                        createdDate: elementClientBy.createdDate,
                        submittedBy: elementClientBy
                      },
                      workerRating: {
                        rating: elementWorkerBy.rating,
                        ratingText: elementWorkerBy.ratingText,
                        name: elementWorkerBy.submittedBy.firstName,
                        createdDate: elementWorkerBy.createdDate,
                        submittedBy: elementWorkerBy
                      }
                    };
                    this.ratingDTO.push(temp);
                  }
                });
              });

              this.submittedToclientRatingList.forEach((element) => {
                if (!this.submittedByClientRatingList.some((item) => item.submittedTo.id === element.submittedBy.id)) {
                  const temp1 = {
                    clientRating: {
                      rating: null,
                      ratingText: null,
                      name: null,
                      createdDate: null,
                      submittedBy: element
                    },
                    workerRating: {
                      rating: element.rating,
                      ratingText: element.ratingText,
                      name: element.submittedBy.firstName,
                      createdDate: element.createdDate,
                      submittedBy: element
                    }
                  };
                  this.ratingDTO.push(temp1);
                }
              });

              this.submittedToworkerRatingList.forEach((element) => {
                if (!this.submittedByworkerRatingList.some((item) => item.submittedBy.id === element.submittedTo.id)) {
                  const temp2 = {
                    clientRating: {
                      rating: element.rating,
                      ratingText: element.ratingText,
                      name: element.submittedBy.firstName,
                      createdDate: element.createdDate,
                      submittedBy: element
                    },
                    workerRating: {
                      rating: null,
                      ratingText: null,
                      name: null,
                      createdDate: null,
                      submittedBy: element
                    }
                  };
                  this.ratingDTO.push(temp2);
                }
              });
            });

            // this.ratingDTO = this.ratingDTO.filter((el, i, a) => i === a.indexOf(el));
            // let set = new Set(this.ratingDTO);
            // 
            // this.ratingDTO = [...set];
            // this.ratingDTO = this.ratingDTO.filter((element, i) => i === this.ratingDTO.indexOf(element))

            this.totalRecords = this.ratingDTO.length;
          }
        } else {
          this.notificationService.error(data, '');
        }
      },
      error => {

      }
    );
  }
  acceptRating(data) {

    this.ratingReviewService.acceptRatingReview(data.submittedBy.id).subscribe(e => {

      if (e.statusCode === '200' && e.message === 'OK') {
        this.notificationService.success(this.translator.instant('review.accepted'), '');
        if (this.jobDetail.id !== 'jobId') {
          this.getRatingReviewList(this.jobDetail.id);
        }
        else {
          this.getRatingReviewList();
        }
      }
    });
  }
  rejectRating(data) {

    this.ratingReviewService.rejectRatingReview(data.submittedBy.id).subscribe(e => {

      if (e.statusCode === '200' && e.message === 'OK') {
        this.notificationService.success(this.translator.instant('review.rejected'), '');
        if (this.jobDetail.id !== 'jobId') {
          this.getRatingReviewList(this.jobDetail.id);
        }
        else {
          this.getRatingReviewList();
        }
      }
    });
  }
  openAcceptDialog(data) {
    let options = null;
    const message = this.translator.instant('are.you.sure.you.want.to.accept');
    options = {
      title: this.translator.instant('warning'),
      message,
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')

    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.acceptRating(data);
      }
    });
  }
  openRejectDialog(data) {
    let options = null;
    const message = this.translator.instant('are.you.sure.you.want.to.reject');
    options = {
      title: this.translator.instant('warning'),
      message,
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')

    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.rejectRating(data);
      }
    });
  }
}
