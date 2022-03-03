import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
import { JobsiteDetail } from '../../client/Vos/jobsitemodel';
import { RatingDTO } from '../rating-dto';

@Component({
  selector: 'app-project-rating-reviews',
  templateUrl: './project-rating-reviews.component.html',
  styleUrls: ['./project-rating-reviews.component.css']
})
export class ProjectRatingReviewsComponent implements OnInit {
  // Show the jobsite title if no jobsite is selected, if particular jobsite is selected we need to hide this column
  // In this isHidden Property we need to pass the condition as "isSelectedJobsite: true ? false"
  columns = [];
  myForm: FormGroup;
  status = [{ label: 'All', value: 'All' },
  { label: 'Reported to Admin', value: 'REPORTED_TO_ADMIN' }];
  filteredStatus: any[];
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  totalRecords;
  jobsiteDetail: JobsiteDetail;
  submittedByClientRatingList = [];
  submittedByworkerRatingList = [];
  submittedToworkerRatingList = [];
  submittedToclientRatingList = [];
  ratingDTO: RatingDTO[] = [];
  datatableParam = new DataTableParam();
  globalFilter;
  queryParam: URLSearchParams;
  jobsiteRatingAndReviewList = [];
  filterFlag: boolean;
  isSelectedJobSite = false;
  groupedJobsiteRating: any[] = [];
  isFilterOpened = false;
  subscription = new Subscription();

  //subadmin 
  userAccess: any;
  showButtons = true;
  btnDisabled = false;
  selectedProject: any;
  isSelectedProject: boolean;

  constructor(
    private captionChangeService: HeaderManagementService,
    private formBuilder: FormBuilder,
    private projectJobSelectionService: ProjectJobSelectionService,
    private localStorageService: LocalStorageService,
    private ratingReviewService: RantingAndReviewService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private confirmDialogService: ConfirmDialogueService
  ) {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.datatableParam = {
      offset: 0,
      size: 10000,
      sortField: '',
      sortOrder: 1,
      searchText: null
    };
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.setProject();
    this.setJobsite();
    this.setColumnOfTable();
    this.initializeForm();

    this.userAccess = this.localStorageService.getItem('userAccess');
    if (this.userAccess) {
      this.menuAccess();
    }

  }
  setProject() {
    this.subscription.add(this.projectJobSelectionService.selectedProjectSubject.subscribe(data => {
      let project = this.localStorageService.getSelectedProjectObject();
      if (project) {

        if (project.id === 'pid') {
          this.jobsiteDetail = null;
          this.isSelectedJobSite = false;
          this.isSelectedProject = false;
          this.selectedProject = null;
          this.setColumnOfTable();
          this.getRatingReviewList();
        }
        else {
          this.jobsiteDetail = null;
          this.isSelectedJobSite = false;
          this.selectedProject = project;
          if (this.selectedProject !== null) {
            this.isSelectedProject = true;
          }
          this.getRatingReviewList();
        }
      }
      else {
        this.jobsiteDetail = null;
        this.isSelectedJobSite = false;
        this.selectedProject = project;
        if (this.selectedProject !== null) {
          this.isSelectedProject = true;
        }
        this.getRatingReviewList();

      }


    }));
  }
  setJobsite() {
    this.subscription.add(this.projectJobSelectionService.selectedJobsiteSubject.subscribe(element => {
      const jobsite = this.localStorageService.getSelectedJobsiteObject();
      if (jobsite) {
        if (jobsite.id !== 'jid') {
          this.isSelectedJobSite = true;
          this.jobsiteDetail = jobsite;
          this.setColumnOfTable();
          this.getRatingReviewList(this.jobsiteDetail.id);

        }
        else {
          this.isSelectedJobSite = false;
          this.jobsiteDetail = null;
          this.setColumnOfTable();
          this.getRatingReviewList();

        }
      }
      else {
        this.isSelectedJobSite = false;
        this.jobsiteDetail = null;
        this.setColumnOfTable();
        this.getRatingReviewList();
      }
    }));
  }
  onFilterOpen(): void {
    this.isFilterOpened = !this.isFilterOpened;
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  setColumnOfTable(): void {
    if (this.isSelectedJobSite) {
      this.columns = [
        { label: 'Given by Client to Subcontractor', value: 'clientToSubcontractor', sortable: true, isHidden: false },
        { label: 'Given by Subcontractor to Client', value: 'subcontractorToClient', sortable: true, isHidden: false }
      ];
    }
    else {
      this.columns = [
        { label: 'Jobsite Title', value: 'jobsiteTitle', sortable: true, isHidden: false },
        { label: 'Given by Client to Subcontractor', value: 'clientToSubcontractor', sortable: true, isHidden: false },
        { label: 'Given by Subcontractor to Client', value: 'subcontractorToClient', sortable: true, isHidden: false }
      ];
    }
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
  initializeForm(): void {
    this.myForm = this.formBuilder.group({
      status: []
    });
  }
  groupBy(): void {
    this.groupedJobsiteRating = [];
    const records = this.jobsiteRatingAndReviewList;
    const pipedRecords = new Subject();
    const result = pipedRecords.pipe(
      groupBy(
        (x: any) => x.jobsite.id,
        null,
        null,
        () => new ReplaySubject()
      ),
      // mergeMap(group => group.pipe(toArray()))
      // concatMap(group => group.pipe(toArray()))
      concatMap(
        object => object.pipe(
          toArray(),
          map(obj =>
            ({ key: object.key, value: obj })
          ))
      )
    );

    result.subscribe(x => {
      this.groupedJobsiteRating.push(x);
    });

    records.forEach(x => { pipedRecords.next(x) });
    pipedRecords.complete();
  }

  filter(): void {
    this.filterFlag = true;

    if (this.jobsiteDetail) {
      this.getRatingReviewList(this.jobsiteDetail.id);
    }
    else {
      this.getRatingReviewList();
    }

  }
  clear() {
    this.filterFlag = false;
    this.myForm.reset();
    if (this.jobsiteDetail) {
      this.getRatingReviewList(this.jobsiteDetail.id);
    }
    else {
      this.getRatingReviewList();
    }
  }
  getRatingReviewList(id?): void {
    const filterMap = new Map();
    if (this.filterFlag) {
      if (this.myForm.value.status === 'REPORTED_TO_ADMIN') {
        filterMap.set('IS_REPORT_TO_ADMIN', true);
      }
    }
    filterMap.set('POST_TYPE', 'JOBSITE');
    if (this.isSelectedProject) {
      if (this.selectedProject.id !== 'pid') {
        filterMap.set('PROJECT_ID', this.selectedProject.id);
      }
    }
    if (this.isSelectedJobSite) {
      if (this.jobsiteDetail.id !== 'jid') {
        filterMap.set('JOBSITE_ID', id);
      }
    }
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
    this.jobsiteRatingAndReviewList.length = 0;
    this.ratingReviewService.getRatingReviewList(this.queryParam).subscribe(
      data => {
        this.ratingDTO = [];
        this.jobsiteRatingAndReviewList.length = 0;
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.jobsiteRatingAndReviewList = data.data.result;
            this.groupBy();
            this.totalRecords = data.data.totalRecords;
            this.groupedJobsiteRating.forEach(data => {
              this.submittedByClientRatingList.length = 0;
              this.submittedByworkerRatingList.length = 0;
              this.submittedToclientRatingList.length = 0;
              this.submittedToworkerRatingList.length = 0;
              data.value.forEach(dataElement => {
                if (dataElement.submittedBy.roles[0].roleName === 'CLIENT') {
                  this.submittedByClientRatingList.push(dataElement);
                }
                if (dataElement.submittedBy.roles[0].roleName === 'SUBCONTRACTOR') {
                  this.submittedByworkerRatingList.push(dataElement);
                }
                if (dataElement.submittedTo.roles[0].roleName === 'SUBCONTRACTOR') {
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
                if (!this.submittedByClientRatingList.some((item) => (item.submittedTo.id === element.submittedBy.id))) {
                  let temp1 = {
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

            this.totalRecords = this.ratingDTO.length;

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
  acceptRating(data) {
    this.ratingReviewService.acceptRatingReview(data.submittedBy.id).subscribe(e => {
      if (e.statusCode === '200' && e.message === 'OK') {
        this.notificationService.success(this.translator.instant('review.accepted'), '');
        if (this.jobsiteDetail) {
          if (this.jobsiteDetail.id !== 'jid') {
            this.getRatingReviewList(this.jobsiteDetail.id);
          }
          else {
            this.getRatingReviewList();
          }
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
        if (this.jobsiteDetail) {
          if (this.jobsiteDetail.id !== 'jid') {
            this.getRatingReviewList(this.jobsiteDetail.id);
          }
          else {
            this.getRatingReviewList();
          }
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

  menuAccess(): void {
    const accessPermission = this.userAccess.filter(e => e.menuName == 'Projects');
    if (accessPermission[0].canModify) {
      this.showButtons = true;
      this.btnDisabled = false;
    }
    else {
      this.showButtons = false;
      this.btnDisabled = true;
    }
  }

}
