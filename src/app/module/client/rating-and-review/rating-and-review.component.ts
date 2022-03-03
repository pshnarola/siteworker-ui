import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ProjectDetailService } from 'src/app/service/client-services/project-detail.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { RantingAndReviewService } from 'src/app/service/rating-and-review/ranting-and-review.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { User } from 'src/app/shared/vo/User';
import { RatingAndReview } from '../../../shared/vo/ratingAndReview';
import { JobDetails } from '../post-job/job-details';
import { JobsiteDetail } from '../Vos/jobsitemodel';
import { ProjectDetail } from '../Vos/projectDetailmodel';

@Component({
  selector: 'app-rating-and-review',
  templateUrl: './rating-and-review.component.html',
  styleUrls: ['./rating-and-review.component.css']
})

export class RatingAndReviewComponent implements OnInit, OnDestroy {
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  loading = false;
  myForm: FormGroup;
  rate;
  temp = [];
  defaultProject = new ProjectDetail();
  postType;
  project;
  jobsite;
  offset = 0;
  totalRecords = 0;
  sortField = 'CREATED_DATE';
  sortOrder = 0;
  projectId;
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
  ratingAndReviewDTO: RatingAndReview;
  projectDTO: ProjectDetail;
  jobDTO: JobDetails;

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
    size: this.size,
    sortField: this.sortField.toUpperCase(),
    sortOrder: this.sortOrder,
    searchText: this.globalFilter
  };

  columns = [
    { label: this.translator.instant('jobsite.title'), value: 'title', sortable: true },
    { label: this.translator.instant('subcontractor'), value: 'name', sortable: true },
    { label: this.translator.instant('rating'), value: 'rating', sortable: false },
    { label: this.translator.instant('safety.rating'), value: 'safetyRating', sortable: false },
    { label: this.translator.instant('public.review'), value: 'review', sortable: false },
  ];

  jobColumns = [
    { label: this.translator.instant('job.title'), value: 'title', sortable: true },
    { label: this.translator.instant('worker'), value: 'name', sortable: true },
    { label: 'Quality Rating', value: 'rating', sortable: false },
    { label: this.translator.instant('safety.rating'), value: 'safetyRating', sortable: false },
    { label: this.translator.instant('public.review'), value: 'review', sortable: false },
  ];
  editReviewDialog = false;
  editReviewForm: FormGroup;
  submittedEdit = false;
  dateTime = new Date();
  jobsiteId: any;
  jobsiteDto: JobsiteDetail;
  jobsiteDTO: JobsiteDetail;
  offset1 = 0;
  flag = 0;
  previousUrl: any;
  defaultJob = new JobDetails();
  subscription = new Subscription();
  totalRecordsSubmit = 0;
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    public ratingReviewService: RantingAndReviewService,
    public projectDetailService: ProjectDetailService,
    private captionChangeService: HeaderManagementService,
    private localStorageService: LocalStorageService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private projectJobSelectionService: ProjectJobSelectionService
  ) {
    this.datatableParam = {
      offset: this.offset,
      size: this.size,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: null
    };
    this.project = this.localStorageService.getSelectedProjectObject();
    this.loginUserId = this.localStorageService.getLoginUserId();
    this.loginUser = this.localStorageService.getLoginUserObject();
    this.dateTime.setDate(this.dateTime.getDate());
  }

  ngOnInit(): void {
    this.defaultProject.title = 'All Projects';
    this.defaultProject.id = 'pid';
    this.defaultJob.title = 'All Jobs';
    this.defaultJob.id = 'jobId';
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.CLIENT_RATING_AND_REVIEW);
    this.flag = 0;
    this.route.queryParams.subscribe(
      (param: Params) => {
        this.postType = param.type;
        this.initializeForm(this.submitRatingAndReview);
        if (this.postType === 'JOBS') {
          this.subscription.add(this.projectJobSelectionService.selectedJobSubject.subscribe(element => {
            this.handleChange();
          }));
        }
        else {
          this.projectJobSelectionService.selectedJobsiteSubject.subscribe(element => {
            this.postType = 'JOBSITE';
            this.handleChange();
          });
        }
      });

    this.captionChangeService.captionchangerSubject.next(CaptionConstants.CLIENT_RATING_AND_REVIEW);
  }
  ngOnDestroy(): void {
    this.localStorageService.setItem('selectedJob', this.defaultJob);
    this.localStorageService.setItem('selectedProject', this.defaultProject);
    this.subscription.unsubscribe();
  }
  initializeEditReviewForm(id): void {
    this.editReviewForm = this.formBuilder.group({
      id,
      rating: ['', CustomValidator.required],
      safetyRating: ['', CustomValidator.required],
      ratingText: ['', CustomValidator.required]
    });
  }
  loadJobSubmitRatingReviewListByUserId(): void {
    this.submitRatingQueryParam = this.prepareQueryParam(this.submitRatingdatatableParam);
    this.projectDetailService.getJobSubmitRatingReviewListByUserId(this.loginUserId).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.submitRatingAndReview = data.data;
            this.totalRecordsSubmit = data.data.totalRecords;

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
    this.projectDetailService.getJobSubmitRatingReviewListByUserIdAndJobId(this.loginUserId, this.jobId).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.submitRatingAndReview = data.data;
            this.totalRecordsSubmit = data.data.totalRecords;
          }
        } else {
          this.notificationService.error(data, '');
        }
      },
      error => {
      }
    );
  }
  loadJobsiteSubmitRatingReviewListByUserId(): void {
    this.projectDetailService.getJobsiteSubmitRatingReviewListByUserId(this.loginUserId).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.submitRatingAndReview = data.data;
            this.totalRecords = data.data.totalRecords;
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
  loadJobsiteSubmitRatingReviewListByUserIdAndJobsiteId(): void {
    this.submitRatingQueryParam = this.prepareQueryParam(this.submitRatingdatatableParam);
    this.projectDetailService.getJobsiteSubmitRatingReviewListByUserIdAndJobsiteId(this.loginUserId, this.jobsiteId, this.projectId).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.submitRatingAndReview = data.data;
            this.totalRecords = data.data.totalRecords;
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
    switch (this.postType) {
      case 'JOBS':
        this.queryParam = this.prepareQueryParam(datatableParam);
        this.ratingReviewService.getRatingReviewList(this.queryParam).subscribe(
          data => {
            if (data.statusCode === '200') {
              if (data.message === 'OK') {
                this.jobRatingAndReviewList = data.data.result;
                this.totalRecords = data.data.totalRecords;
              }
            } else {
              this.notificationService.error(data, '');
            }
          },
          error => {
          }
        );
        break;

      case 'JOBSITE':
        this.queryParam = this.prepareQueryParam(datatableParam);
        this.ratingReviewService.getRatingReviewList(this.queryParam).subscribe(
          data => {
            if (data.statusCode === '200') {
              if (data.message === 'OK') {
                this.ratingAndReviewList = data.data.result;
                this.totalRecords = data.data.totalRecords;
              }
            } else {
              this.notificationService.error(data, '');
            }
          },
          error => {
          }
        );
        break;

      default:
        break;
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
  handleChange(e?): void {
    this.filterMap.clear();

    switch (this.postType) {
      case 'JOBS':
        const job = this.localStorageService.getSelectedJob();
        this.jobId = job.id;
        break;
      case 'JOBSITE':
        if (this.localStorageService.getSelectedJobsiteObject()) {
          this.jobsite = this.localStorageService.getSelectedJobsiteObject();
          this.jobsiteId = this.jobsite.id;
        }
        break;


      default:
        break;
    }

    this.filterMap.set('POST_TYPE', this.postType);
    this.filterMap.set('IS_ACCEPTED_BY_ADMIN', false);
    if (e) {
      const index = e.index;
      switch (index) {
        case 0:
          this.flag = 0;
          if (this.jobId !== 'jobId' && this.postType === 'JOBS') {
            this.filterMap.set('JOB_ID', this.jobId);
          }
          else if (this.jobsiteId !== 'jid' && this.postType === 'JOBSITE') {
            this.filterMap.set('JOBSITE_ID', this.jobsiteId);
          }
          this.filterMap.set('SUBMITTED_TO', this.loginUserId);
          let jsonObject1 = {};
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
        case 1:
          this.flag = 1;
          if (this.jobId !== 'jobId' && this.postType === 'JOBS') {
            this.filterMap.set('JOB_ID', this.jobId);
          }
          else if (this.jobsiteId !== 'jid' && this.postType === 'JOBSITE') {
            this.filterMap.set('JOBSITE_ID', this.jobsiteId);
          }
          this.filterMap.set('SUBMITTED_BY', this.loginUserId);
          let jsonObject = {};
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
        case 2:
          this.flag = 2;
          if (this.postType === 'JOBS') {
            if (this.jobId !== 'jobId') {
              this.loadJobSubmitRatingReviewListByUserIdAndJobId();
            }
            else {
              this.loadJobSubmitRatingReviewListByUserId();
            }
          }
          break;
      }
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
        }
        else if (this.flag === 1) {
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
        }
        else if (this.flag === 2) {
          this.loadJobSubmitRatingReviewListByUserId();
        }
      }
    }

    else { }
    
  }

  initializeForm(submitReviewList?): void {
    const publicReview = new FormArray([]);
    if (this.postType === 'JOBS') {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < submitReviewList.length; i++) {
        publicReview.push(this.formBuilder.group({
          id: submitReviewList[i].jobDetail.id,
          title: submitReviewList[i].jobDetail.title,
          firstName: submitReviewList[i].worker.firstName,
          lastName: submitReviewList[i].worker.lastName,
          rating: [''],
          safetyRating: [''],
          review: [''],
          submittedTo: submitReviewList[i].worker,
        }));
      }
    }
    else {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < submitReviewList.length; i++) {
        publicReview.push(this.formBuilder.group({
          id: submitReviewList[i].jobSiteDetail.id,
          title: submitReviewList[i].jobSiteDetail.title,
          firstName: submitReviewList[i].subContractor.firstName,
          lastName: submitReviewList[i].subContractor.lastName,
          rating: [''],
          safetyRating: [''],
          review: [''],
          submittedTo: submitReviewList[i].subContractor,
        }));
      }
    }
    this.myForm = this.formBuilder.group({
      publicReview
    });
  }

  onSubmit(): boolean {
    this.submitted = true;

    if (!this.myForm.valid) {
      CustomValidator.markFormGroupTouched(this.myForm);
      this.submitted = true;
      return false;
    }

    this.temp = this.myForm.value.publicReview;
    this.ratingAndReviewDTO = new RatingAndReview();
    this.projectDTO = new ProjectDetail();
    this.jobDTO = new JobDetails();
    this.jobsiteDTO = new JobsiteDetail();
    let ratingList = [];
    let count = 0;
    this.temp.forEach(element => {
      if (element.review && element.rating && element.safetyRating) {
        ratingList.push(element);
        count++;
      }
    });
    if (count === 0) {
      this.notificationService.error(this.translator.instant('please.fill.atleast.one.ratingtext.and.rating'), '');
    }
    else {
      ratingList.forEach(element => {
        if (this.postType === 'JOBS') {
          this.jobDTO.id = element.id;
          this.ratingAndReviewDTO.jobDetail = this.jobDTO;
        }
        this.ratingAndReviewDTO.ratingText = element.review;
        this.ratingAndReviewDTO.rating = element.rating;
        this.ratingAndReviewDTO.safetyRating = element.safetyRating;
        this.ratingAndReviewDTO.submittedBy = this.loginUser;
        this.ratingAndReviewDTO.submittedTo = element.submittedTo;
        this.ratingAndReviewDTO.type = this.postType;

        this.ratingReviewService.addRatingReview(this.ratingAndReviewDTO).subscribe(
          data => {
            if (data.statusCode === '200' && data.message == 'OK') {
              this.notificationService.success(this.translator.instant('review.submited'), '');
              if (this.postType === 'JOBS') {
                if (this.jobId !== 'jobId') {
                  this.loadJobSubmitRatingReviewListByUserIdAndJobId();
                }
                else {
                  this.loadJobSubmitRatingReviewListByUserId();
                }
              }
              else if (this.postType === 'JOBSITE') {
                if (this.jobsiteId !== 'jid') {
                  this.loadJobsiteSubmitRatingReviewListByUserIdAndJobsiteId();
                }
                else {
                  this.loadJobsiteSubmitRatingReviewListByUserId();
                }
              }
            } else {
              this.notificationService.error(data.message, '');
            }
            this.submitted = false;
          },
          error => {
          });
      });
    }
  }
  reportToAdmin(id): void {
    this.ratingAndReviewDTO = new RatingAndReview();
    this.ratingAndReviewDTO.id = id;
    this.ratingAndReviewDTO.isReportToAdmin = true;
    this.ratingAndReviewDTO.isRejectedByAdmin = false;
    this.ratingAndReviewDTO.isAcceptedByAdmin = false;

    this.ratingReviewService.reportToAdmin(this.ratingAndReviewDTO).subscribe(data => {
      if (data.statusCode === '200') {
        if (data.message === 'OK') {
          this.notificationService.success(this.translator.instant('review.reported.to.admin'), '');
          this.handleChange();
        }
      }
    });
  }

  editJobReview(entity): void {
    this.editReviewDialog = true;
    this.initializeEditReviewForm(entity.id);
    this.editReviewForm.controls.rating.patchValue(entity.rating);
    this.editReviewForm.controls.safetyRating.patchValue(entity.safetyRating);
    this.editReviewForm.controls.ratingText.patchValue(entity.ratingText);
  }
  hideDialog(): void {
    this.editReviewDialog = false;
    this.submittedEdit = false;
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
    this.ratingAndReviewDTO.safetyRating = this.editReviewForm.value.safetyRating;
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
  public paginate(event: any): void {
    this.offset = event.first / event.rows;
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
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
      size: event.rows ? event.rows : 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadRatingReviewList(this.datatableParam);

  }
}

