import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
import { RatingAndReview } from 'src/app/shared/vo/ratingAndReview';
import { User } from 'src/app/shared/vo/User';
import { JobsiteDetail } from '../../client/Vos/jobsitemodel';
import { ProjectDetail } from '../../client/Vos/projectDetailmodel';

@Component({
  selector: 'app-subcontractor-rating-review',
  templateUrl: './subcontractor-rating-review.component.html',
  styleUrls: ['./subcontractor-rating-review.component.css']
})
export class SubcontractorRatingReviewComponent implements OnInit {
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  loading = false;
  myForm: FormGroup;
  rate;
  temp = [];

  postType;
  project;
  jobsite;
  offset: Number = 0;
  totalRecords: Number = 0;
  sortField = 'CREATED_DATE';
  sortOrder = 0;
  projectId;

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

  isReportedToadmin = false;
  editMode = false;
  submitted = false;
  loginUserId: any;
  loginUser: User;

  datatableParam: DataTableParam = {
    offset: this.offset,
    size: 10,
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

  columns = [
    { label: this.translator.instant('jobsite.title'), value: 'title', sortable: true },
    { label: this.translator.instant('client'), value: 'name', sortable: true },
    { label: this.translator.instant('rating'), value: 'rating', sortable: false },
    { label: this.translator.instant('public.review'), value: 'review', sortable: false },
  ];
  editReviewDialog = false;
  editReviewForm: FormGroup;
  submittedEdit = false;
  dateTime = new Date();
  jobsiteId: any;
  jobsiteDTO: JobsiteDetail;
  offset1: Number = 0;
  flag = 0;
  subscription = new Subscription();
  totalRecordsSubmit = 0;
  constructor(private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public ratingReviewService: RantingAndReviewService,
    public projectDetailService: ProjectDetailService,
    private captionChangeService: HeaderManagementService,
    private localStorageService: LocalStorageService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private projectJobSelectionService: ProjectJobSelectionService) {
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.CLIENT_RATING_AND_REVIEW);
    this.postType = 'JOBSITE';
    this.filterMap.set('POST_TYPE', 'JOBSITE');
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
    this.flag = 0;
    this.subscription.add(this.projectJobSelectionService.selectedProjectSubject.subscribe(element => {
      this.handleChange();
    }));
    this.subscription.add(this.projectJobSelectionService.selectedJobsiteSubject.subscribe(data => {
      this.handleChange();
    }));
    this.initializeForm(this.submitRatingAndReview);
    this.projectDetailService.cancelledAndCompletedProjectSubject.next('');
    // this.loadSubmitRatingReviewList();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  prepareQueryParam(paramObject) {
    // tslint:disable-next-line: new-parens
    const params = new URLSearchParams;
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }
  calculateDiffInDays(datePosted) {
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

  loadRatingReviewList(datatableParam?): void {
    this.queryParam = this.prepareQueryParam(datatableParam);
    this.ratingReviewService.getRatingReviewList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.ratingAndReviewList = data.data.result;
            this.totalRecords = data.data.totalRecords;
          }
        } else {
          this.notificationService.error(data, '');
        }
      },
      error => {
        console.log(error);
      }
    );
  }
  handleChange(e?) {
    this.filterMap.clear();
    if (this.localStorageService.getItem('selectedJobsite')) {
      const jobsite = this.localStorageService.getItem('selectedJobsite');
      this.jobsiteId = jobsite.id;
      if (this.jobsiteId != 'jid') {
        this.filterMap.set('JOBSITE_ID', this.jobsiteId);
      }
    }
    if (this.localStorageService.getSelectedProjectObject()) {
      this.project = this.localStorageService.getSelectedProjectObject();
      this.projectId = this.project.id;
    }
    if (this.projectId !== 'pid') {
      this.filterMap.set('PROJECT_ID', this.projectId);
    }
    // }
    this.filterMap.set('IS_ACCEPTED_BY_ADMIN', false);
    this.filterMap.set('POST_TYPE', 'JOBSITE');
    if (e) {
      const index = e.index;
      switch (index) {
        case 0:
          this.flag = 0;
          if (this.jobsiteId != 'jid') {
            this.filterMap.set('JOBSITE_ID', this.jobsiteId);
          }
          if (this.projectId !== 'pid') {
            this.filterMap.set('PROJECT_ID', this.projectId);
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
          if (this.jobsiteId != 'jid') {
            this.filterMap.set('JOBSITE_ID', this.jobsiteId);
          }
          if (this.projectId !== 'pid') {
            this.filterMap.set('PROJECT_ID', this.projectId);
          }
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
          break;
        case 2:
          this.flag = 2;
          if (this.jobsiteId !== 'jid' && this.projectId !== 'pid') {
            this.loadJobsiteSubmitRatingReviewListByUserIdAndJobsiteId();
          }
          else if (this.jobsiteId === 'jid' && this.projectId !== 'pid') {
            this.loadJobsiteSubmitRatingReviewListByUserIdAndProjectId();
          }
          else {
            this.loadJobsiteSubmitRatingReviewListByUserId();
          }
          break;
      }
    }
    else if (e === undefined) {
      if (this.projectId !== 'pid') {
        this.filterMap.set('PROJECT_ID', this.projectId);
      }
      if (this.jobsiteId !== 'jid') {
        this.filterMap.set('JOBSITE_ID', this.jobsiteId);
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
          if (this.jobsiteId !== 'jid' && this.projectId !== 'pid') {
            this.loadJobsiteSubmitRatingReviewListByUserIdAndJobsiteId();
          }
          else if (this.jobsiteId === 'jid' && this.projectId !== 'pid') {
            this.loadJobsiteSubmitRatingReviewListByUserIdAndProjectId();
          }
          else {
            this.loadJobsiteSubmitRatingReviewListByUserId();
          }
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
          if (this.jobsiteId !== 'jid' && this.projectId !== 'pid') {
            this.loadJobsiteSubmitRatingReviewListByUserIdAndJobsiteId();
          }
          else if (this.jobsiteId === 'jid' && this.projectId !== 'pid') {
            this.loadJobsiteSubmitRatingReviewListByUserIdAndProjectId();
          }
          else {
            this.loadJobsiteSubmitRatingReviewListByUserId();
          }
        }
      }
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

    // });
  }
  loadSubmitRatingReviewList(): void {
    this.submitRatingQueryParam = this.prepareQueryParam(this.submitRatingdatatableParam);
    this.projectDetailService.getJobsiteSubmitRatingReviewList(this.submitRatingQueryParam, this.loginUserId).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.submitRatingAndReview = data.data.result;
            this.initializeForm(this.submitRatingAndReview);
          }
        } else {
          this.notificationService.error(data, '');
        }
      },
      error => {
        console.log(error);
      }
    );
  }
  loadJobsiteSubmitRatingReviewListByUserId(): void {
    this.submitRatingQueryParam = this.prepareQueryParam(this.submitRatingdatatableParam);
    this.projectDetailService.getJobsiteSubmitRatingReviewListForSubcontractor(this.loginUserId).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.submitRatingAndReview = data.data;
            this.totalRecordsSubmit = data.data.totalRecords;
            this.initializeForm(this.submitRatingAndReview);
          }
        } else {
          this.notificationService.error(data, '');
        }
      },
      error => {
        console.log(error);
      }
    );
  }
  loadJobsiteSubmitRatingReviewListByUserIdAndProjectId(): void {
    this.submitRatingQueryParam = this.prepareQueryParam(this.submitRatingdatatableParam);
    this.projectDetailService.getJobsiteSubmitRatingReviewListByProjectIdForSubcontractor(this.loginUserId, this.projectId).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.submitRatingAndReview = data.data;
            this.totalRecordsSubmit = data.data.totalRecords;
            this.initializeForm(this.submitRatingAndReview);
          }
        } else {
          this.notificationService.error(data, '');
        }
      },
      error => {
        console.log(error);
      }
    );
  }
  loadJobsiteSubmitRatingReviewListByUserIdAndJobsiteId(): void {
    this.submitRatingQueryParam = this.prepareQueryParam(this.submitRatingdatatableParam);
    this.projectDetailService.getJobsiteSubmitRatingReviewListForSubcontractorByJobsiteId(this.jobsiteId, this.loginUserId, this.projectId).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.submitRatingAndReview = data.data;
            this.totalRecordsSubmit = data.data.totalRecords;
            this.initializeForm(this.submitRatingAndReview);
          }
        } else {
          this.notificationService.error(data, '');
        }
      },
      error => {
        console.log(error);
      }
    );
  }
  initializeForm(submitReviewList): void {
    const publicReview = new FormArray([]);
    for (let i = 0; i < submitReviewList.length; i++) {
      publicReview.push(this.formBuilder.group({
        id: submitReviewList[i].jobSiteDetail.id,
        projectId: submitReviewList[i].projectDetail.id,
        // 'jobid': submitReviewList[i].id,
        title: submitReviewList[i].jobSiteDetail.title,
        firstName: submitReviewList[i].jobSiteDetail.user.firstName,
        lastName: submitReviewList[i].jobSiteDetail.user.lastName,
        rating: [''],
        review: [''],
        submittedTo: submitReviewList[i].jobSiteDetail.user,
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
    this.jobsiteDTO = new JobsiteDetail();
    this.projectDTO = new ProjectDetail();
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

        this.jobsiteDTO.id = element.id;
        this.projectDTO.id = element.projectId;
        this.ratingAndReviewDTO.jobsite = this.jobsiteDTO;
        this.ratingAndReviewDTO.project = this.projectDTO;
        this.ratingAndReviewDTO.ratingText = element.review;
        this.ratingAndReviewDTO.rating = element.rating;
        this.ratingAndReviewDTO.submittedBy = this.loginUser;
        this.ratingAndReviewDTO.submittedTo = element.submittedTo;
        this.ratingAndReviewDTO.type = 'JOBSITE';

        this.ratingReviewService.addRatingReview(this.ratingAndReviewDTO).subscribe(
          data => {
            if (data.statusCode === '200' && data.message == 'OK') {
              this.notificationService.success(this.translator.instant('review.submited'), '');
              if (this.jobsiteId !== 'jid' && this.projectId !== 'pid') {
                this.loadJobsiteSubmitRatingReviewListByUserIdAndJobsiteId();
              }
              else if (this.jobsiteId === 'jid' && this.projectId !== 'pid') {
                this.loadJobsiteSubmitRatingReviewListByUserIdAndProjectId();
              }
              else {
                this.loadJobsiteSubmitRatingReviewListByUserId();
              }
            } else {
              this.notificationService.error(data, '');
            }
            this.submitted = false;
          },
          error => {
            console.log(error);
          });
      });
    }
  }
  reportToAdmin(id): void {
    this.ratingAndReviewDTO = new RatingAndReview();
    this.ratingAndReviewDTO.id = id;
    this.ratingAndReviewDTO.isReportToAdmin = true;
    this.ratingAndReviewDTO.isAcceptedByAdmin = false;
    this.ratingAndReviewDTO.isRejectedByAdmin = false;
    // this.reportToAdminFlag = true
    this.ratingReviewService.reportToAdmin(this.ratingAndReviewDTO).subscribe(data => {
      if (data.statusCode === '200') {
        if (data.message === 'OK') {
          this.notificationService.success(this.translator.instant('review.reported.to.admin'), '');
          this.handleChange();
        }
      }
    });
  }
  initializeEditReviewForm(id): void {
    this.editReviewForm = this.formBuilder.group({
      id,
      rating: ['', CustomValidator.required],
      ratingText: ['', CustomValidator.required]
    });
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
