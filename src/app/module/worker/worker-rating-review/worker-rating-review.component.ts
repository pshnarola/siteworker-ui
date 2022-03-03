import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ProjectDetailService } from 'src/app/service/client-services/project-detail.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { RantingAndReviewService } from 'src/app/service/rating-and-review/ranting-and-review.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { RatingAndReview } from 'src/app/shared/vo/ratingAndReview';
import { User } from 'src/app/shared/vo/User';
import { WorkerSidebarJobListService } from 'src/app/shared/worker-sidebar-job-list.service';
import { JobDetails } from '../../client/post-job/job-details';

@Component({
  selector: 'app-worker-rating-review',
  templateUrl: './worker-rating-review.component.html',
  styleUrls: ['./worker-rating-review.component.css']
})
export class WorkerRatingReviewComponent implements OnInit {
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  loading = false;
  myForm: FormGroup;
  rate;
  temp = [];

  postType;
  offset: Number = 0;
  totalRecords;
  sortField = 'CREATED_DATE';
  sortOrder = 0;
  jobId;

  globalFilter = null;
  filterMap = new Map();
  queryParam;
  submitRatingQueryParam;
  submitRatingAndReview = [];
  jobSubmitRatingAndReview = [];
  ratingAndReviewList: RatingAndReview[] = [];
  ratingAndReviewListProject: RatingAndReview[] = [];
  jobRatingAndReviewList: RatingAndReview[] = [];
  jobRatingAndReviewListSubmitted: RatingAndReview[] = [];
  ratingAndReviewDTO: RatingAndReview;
  jobDTO: JobDetails;
  totalRecordsForSubmit = 0;
  isReportedToadmin = false;
  editMode = false;
  submitted = false;
  loginUserId: any;
  loginUser: User;

  datatableParam: DataTableParam = {
    offset: this.offset,
    size: this.size,
    sortField: this.sortField.toUpperCase(),
    sortOrder: this.sortOrder,
    searchText: this.globalFilter
  };

  submitRatingdatatableParam: DataTableParam = {
    offset: this.offset,
    size: 10,
    sortField: this.sortField.toUpperCase(),
    sortOrder: this.sortOrder,
    searchText: this.globalFilter
  };
  jobColumns = [
    { label: this.translator.instant('job.title'), value: 'TITLE', sortable: true },
    { label: this.translator.instant('client'), value: 'FIRST_NAME', sortable: true },
    { label: this.translator.instant('rating'), value: 'rating', sortable: false },
    { label: this.translator.instant('public.review'), value: 'review', sortable: false },
  ];
  editReviewDialog = false;
  editReviewForm: FormGroup;
  submittedEdit = false;
  subscription = new Subscription();
  offset1: Number = 0;
  flag = 0;
  constructor(
    private formBuilder: FormBuilder,
    public ratingReviewService: RantingAndReviewService,
    private captionChangeService: HeaderManagementService,
    private localStorageService: LocalStorageService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private workerSideBarJobListService: WorkerSidebarJobListService,
    private projectDetailService: ProjectDetailService) {
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.CLIENT_RATING_AND_REVIEW);
    this.filterMap.set('POST_TYPE', 'JOBS');
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParam = {
      offset: this.offset,
      size: this.size,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loginUserId = this.localStorageService.getLoginUserId();
    this.loginUser = this.localStorageService.getLoginUserObject();
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.CLIENT_RATING_AND_REVIEW);
    this.initializeForm(this.submitRatingAndReview);
    this.flag = 0;
    this.subscription.add(this.workerSideBarJobListService.workerSidebarJobChanged.subscribe(data => {
      this.handleChange();
    }));
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.localStorageService.removeItem('workerSelectedJob');
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
  loadRatingReviewList(datatableParam?): void {
    this.queryParam = this.prepareQueryParam(datatableParam);
    this.ratingReviewService.getRatingReviewList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.jobRatingAndReviewList = data.data.result;
            this.jobRatingAndReviewListSubmitted = data.data.result;
            this.totalRecords = data.data.totalRecords;
          }
        } else {
          this.notificationService.error(data, '');
        }
      },
      error => {
      }
    );
  }
  handleChange(e?) {
    this.filterMap.clear();
    if (this.localStorageService.getItem('workerSelectedJob')) {
      const job = this.localStorageService.getItem('workerSelectedJob');
      this.jobId = job.id;
      if (this.jobId !== 'jobId') {
        this.filterMap.set('JOB_ID', this.jobId);
      }
      this.filterMap.set('POST_TYPE', 'JOBS');
    }
    this.filterMap.set('IS_ACCEPTED_BY_ADMIN', false);
    this.filterMap.set('POST_TYPE', 'JOBS');
    if (e) {
      const index = e.index;
      switch (index) {
        case 0:
          this.flag = 0;
          if (this.jobId !== 'jobId') {
            this.filterMap.set('JOB_ID', this.jobId);
          }
          this.filterMap.set('SUBMITTED_TO', this.loginUserId);
          const jsonObject = {};
          this.filterMap.forEach((value, key) => {
            jsonObject[key] = value;
          });
          this.globalFilter = JSON.stringify(jsonObject);
          this.datatableParam = {
            offset: this.offset,
            size: this.size,
            sortField: this.sortField.toUpperCase(),
            sortOrder: this.sortOrder,
            searchText: this.globalFilter
          };
          this.loadRatingReviewList(this.datatableParam);
          break;
        case 1:
          this.flag = 1;
          if (this.jobId !== 'jobId') {
            this.filterMap.set('JOB_ID', this.jobId);
          }
          this.filterMap.set('SUBMITTED_BY', this.loginUserId);
          const jsonObject1 = {};
          this.filterMap.forEach((value, key) => {
            jsonObject1[key] = value;
          });
          this.globalFilter = JSON.stringify(jsonObject1);
          this.datatableParam = {
            offset: this.offset,
            size: this.size,
            sortField: this.sortField.toUpperCase(),
            sortOrder: this.sortOrder,
            searchText: this.globalFilter
          };
          this.loadRatingReviewList(this.datatableParam);
          break;
        case 2:
          this.flag = 2;
          if (this.jobId && this.jobId !== 'jobId') {
            this.loadJobSubmitRatingReviewListByUserIdAndJobId();
          }
          else {
            this.loadJobSubmitRatingReviewListByUserId();
          }
          break;
      }
      const jsonObject = {};
      this.filterMap.forEach((value, key) => {
        jsonObject[key] = value;
      });
      this.globalFilter = JSON.stringify(jsonObject);
      this.datatableParam = {
        offset: this.offset,
        size: this.size,
        sortField: this.sortField.toUpperCase(),
        sortOrder: this.sortOrder,
        searchText: this.globalFilter
      };
      this.loadRatingReviewList(this.datatableParam);
    }
    else if (e === undefined && this.jobId) {
      if (this.jobId !== 'jobId') {
        this.filterMap.set('JOB_ID', this.jobId);
        if (this.flag === 0) {
          this.filterMap.set('SUBMITTED_TO', this.loginUserId);
          const jsonObject = {};
          this.filterMap.forEach((value, key) => {
            jsonObject[key] = value;
          });
          this.globalFilter = JSON.stringify(jsonObject);
          this.datatableParam = {
            offset: this.offset,
            size: this.size,
            sortField: this.sortField.toUpperCase(),
            sortOrder: this.sortOrder,
            searchText: this.globalFilter
          };
          this.loadRatingReviewList(this.datatableParam);
        }
        else if (this.flag === 1) {
          this.filterMap.set('SUBMITTED_BY', this.loginUserId);
          const jsonObject = {};
          this.filterMap.forEach((value, key) => {
            jsonObject[key] = value;
          });
          this.globalFilter = JSON.stringify(jsonObject);
          this.datatableParam = {
            offset: this.offset,
            size: this.size,
            sortField: this.sortField.toUpperCase(),
            sortOrder: this.sortOrder,
            searchText: this.globalFilter
          };
          this.loadRatingReviewList(this.datatableParam);
        }
        else if (this.flag === 2) {
          this.loadJobSubmitRatingReviewListByUserIdAndJobId();
        }
      }
      else {
        if (this.flag === 0) {
          this.filterMap.set('SUBMITTED_TO', this.loginUserId);
          const jsonObject = {};
          this.filterMap.forEach((value, key) => {
            jsonObject[key] = value;
          });
          this.globalFilter = JSON.stringify(jsonObject);
          this.datatableParam = {
            offset: this.offset,
            size: this.size,
            sortField: this.sortField.toUpperCase(),
            sortOrder: this.sortOrder,
            searchText: this.globalFilter
          };
          this.loadRatingReviewList(this.datatableParam);
        }
        else if (this.flag === 1) {
          this.filterMap.set('SUBMITTED_BY', this.loginUserId);
          const jsonObject = {};
          this.filterMap.forEach((value, key) => {
            jsonObject[key] = value;
          });
          this.globalFilter = JSON.stringify(jsonObject);
          this.datatableParam = {
            offset: this.offset,
            size: this.size,
            sortField: this.sortField.toUpperCase(),
            sortOrder: this.sortOrder,
            searchText: this.globalFilter
          };
          this.loadRatingReviewList(this.datatableParam);
        }
        else if (this.flag === 2) {
          this.loadJobSubmitRatingReviewListByUserId();
        }
      }
    }
    else {
      if (this.jobId !== 'jobId') {
        this.filterMap.set('JOB_ID', this.jobId);
        if (this.flag === 0) {
          this.filterMap.set('SUBMITTED_TO', this.loginUserId);
          const jsonObject = {};
          this.filterMap.forEach((value, key) => {
            jsonObject[key] = value;
          });
          this.globalFilter = JSON.stringify(jsonObject);
          this.datatableParam = {
            offset: this.offset,
            size: this.size,
            sortField: this.sortField.toUpperCase(),
            sortOrder: this.sortOrder,
            searchText: this.globalFilter
          };
          this.loadRatingReviewList(this.datatableParam);
        }
        else if (this.flag === 1) {
          this.filterMap.set('SUBMITTED_BY', this.loginUserId);
          const jsonObject = {};
          this.filterMap.forEach((value, key) => {
            jsonObject[key] = value;
          });
          this.globalFilter = JSON.stringify(jsonObject);
          this.datatableParam = {
            offset: this.offset,
            size: this.size,
            sortField: this.sortField.toUpperCase(),
            sortOrder: this.sortOrder,
            searchText: this.globalFilter
          };
          this.loadRatingReviewList(this.datatableParam);
        }
        else if (this.flag === 2) {
          this.loadJobSubmitRatingReviewListByUserIdAndJobId();
        }
      }
      else {
        if (this.flag === 0) {
          this.filterMap.set('SUBMITTED_TO', this.loginUserId);
          const jsonObject = {};
          this.filterMap.forEach((value, key) => {
            jsonObject[key] = value;
          });
          this.globalFilter = JSON.stringify(jsonObject);
          this.datatableParam = {
            offset: this.offset,
            size: this.size,
            sortField: this.sortField.toUpperCase(),
            sortOrder: this.sortOrder,
            searchText: this.globalFilter
          };
          this.loadRatingReviewList(this.datatableParam);
        }
        else if (this.flag === 1) {
          this.filterMap.set('SUBMITTED_BY', this.loginUserId);
          const jsonObject = {};
          this.filterMap.forEach((value, key) => {
            jsonObject[key] = value;
          });
          this.globalFilter = JSON.stringify(jsonObject);
          this.datatableParam = {
            offset: this.offset,
            size: this.size,
            sortField: this.sortField.toUpperCase(),
            sortOrder: this.sortOrder,
            searchText: this.globalFilter
          };
          this.loadRatingReviewList(this.datatableParam);
        }
        else if (this.flag === 2) {
          this.loadJobSubmitRatingReviewListByUserId();
        }
      }

    }
  }
  calculateDiffInDays(datePosted): boolean {
    const currentDate: any = new Date();
    datePosted = new Date(datePosted);
    const days = Math.floor((currentDate - datePosted) / (1000 * 60 * 60 * 24));
    if (days > 30) {
      return false;
    }
    else {
      return true;
    }
  }
  loadJobSubmitRatingReviewListByUserId(): void {
    this.submitRatingQueryParam = this.prepareQueryParam(this.submitRatingdatatableParam);
    this.projectDetailService.getJobSubmitRatingReviewListByUserIdForWorker(this.loginUserId).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.submitRatingAndReview = data.data;
            this.totalRecordsForSubmit = data.data.totalRecords;
            this.initializeForm(this.submitRatingAndReview);
          }
        } else {
          this.notificationService.error(data, '');
        }
      },
      error => {
      }
    );
  }
  loadJobSubmitRatingReviewListByUserIdAndJobId(): void {
    this.submitRatingQueryParam = this.prepareQueryParam(this.submitRatingdatatableParam);
    this.projectDetailService.getJobSubmitRatingReviewListByUserIdAndJobIdForWorker(this.loginUserId, this.jobId).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.submitRatingAndReview = data.data;
            this.totalRecordsForSubmit = data.data.totalRecords;
            this.initializeForm(this.submitRatingAndReview);
          }
        } else {
          this.notificationService.error(data, '');
        }
      },
      error => {
      }
    );
  }
  initializeForm(submitReviewList): void {
    const publicReview = new FormArray([]);
    for (let i = 0; i < submitReviewList.length; i++) {
      publicReview.push(this.formBuilder.group({
        id: submitReviewList[i].jobDetail.id,
        // 'jobid': submitReviewList[i].id,
        title: submitReviewList[i].jobDetail.title,
        firstName: submitReviewList[i].jobDetail.user.firstName,
        lastName: submitReviewList[i].jobDetail.user.lastName,
        rating: [''],
        review: [''],
        submittedTo: submitReviewList[i].jobDetail.user,
      }));
    }
    this.myForm = this.formBuilder.group({
      publicReview
    });
  }
  onSubmit() {
    this.submitted = true;

    if (!this.myForm.valid) {
      CustomValidator.markFormGroupTouched(this.myForm);
      this.submitted = true;
      return false;
    }

    this.temp = this.myForm.value.publicReview;
    this.ratingAndReviewDTO = new RatingAndReview();
    this.jobDTO = new JobDetails();
    let ratingList = [];
    let count = 0;
    this.temp.forEach(element => {
      if (element.review && element.rating) {
        ratingList.push(element);
        count++;
      }
    });
    if (count === 0) {
      this.notificationService.error(this.translator.instant('please.fill.atleast.one.ratingtext.and.rating'), '');
    }
    else {
      ratingList.forEach(element => {

        this.jobDTO.id = element.id;
        this.ratingAndReviewDTO.jobDetail = this.jobDTO;
        this.ratingAndReviewDTO.ratingText = element.review;
        this.ratingAndReviewDTO.rating = element.rating;
        this.ratingAndReviewDTO.submittedBy = this.loginUser;
        this.ratingAndReviewDTO.submittedTo = element.submittedTo;
        this.ratingAndReviewDTO.type = 'JOBS';

        this.ratingReviewService.addRatingReview(this.ratingAndReviewDTO).subscribe(
          data => {
            if (data.statusCode === '200' && data.message == 'OK') {
              this.notificationService.success(this.translator.instant('review.submited'), '');
              if (this.jobId && this.jobId !== 'jobId') {
                this.loadJobSubmitRatingReviewListByUserIdAndJobId();
              }
              else {
                this.loadJobSubmitRatingReviewListByUserId();
              }
            } else {
              this.notificationService.error(data, '');
            }
            this.submitted = false;
          },
          error => {
          });
      });
    }
  }
  reportToAdmin(id): void {
    console.log(id);
    this.ratingAndReviewDTO = new RatingAndReview();
    this.ratingAndReviewDTO.id = id;
    this.ratingAndReviewDTO.isReportToAdmin = true;
    this.ratingReviewService.reportToAdmin(this.ratingAndReviewDTO).subscribe(data => {
      if (data.statusCode === '200') {
        if (data.message === 'OK') {
          this.notificationService.success(this.translator.instant('review.reported.to.admin'), '');
          this.handleChange();
        }
      }
    });
  }
  public paginate(event: any): void {
    this.offset = event.first / event.rows;
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ?  event.rows : 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadRatingReviewList(this.datatableParam);
  }
  public paginateSubmitted(event: any): void {
    this.offset1 = event.first / event.rows;
    this.datatableParam = {
      offset: this.offset1,
      size: event.rows ?  event.rows : 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadRatingReviewList(this.datatableParam);

  }
  editJobReview(entity): void {
    this.editReviewDialog = true;
    this.initializeEditReviewForm(entity.id);
    this.editReviewForm.controls.rating.patchValue(entity.rating);
    this.editReviewForm.controls.ratingText.patchValue(entity.ratingText);
  }
  hideDialog(): void {
    this.editReviewDialog = false;
    this.submittedEdit = false;
  }
  initializeEditReviewForm(id): void {
    this.editReviewForm = this.formBuilder.group({
      id,
      rating: ['', CustomValidator.required],
      ratingText: ['', CustomValidator.required]
    });
  }
  onSubmitEditReview(): boolean {
    this.submittedEdit = true;
    if (!this.editReviewForm.valid) {
      CustomValidator.markFormGroupTouched(this.myForm);
      this.submittedEdit = true;
      return false;
    }
    this.ratingAndReviewDTO = new RatingAndReview();
    this.ratingAndReviewDTO.id = this.editReviewForm.value.id;
    this.ratingAndReviewDTO.rating = this.editReviewForm.value.rating;
    this.ratingAndReviewDTO.ratingText = this.editReviewForm.value.ratingText;
    this.ratingAndReviewDTO.updatedBy = this.loginUserId;
    this.ratingReviewService.updateRatingReview(this.ratingAndReviewDTO).subscribe(data => {
      if (data.statusCode === '200') {
        if (data.message === 'OK') {
          this.notificationService.success(this.translator.instant('review.edited.successfully'), '');
          this.editReviewDialog = false;
          this.handleChange();
        }
      }
    });
  }
}
