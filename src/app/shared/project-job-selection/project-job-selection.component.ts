import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { PostType } from 'src/app/module/client/enums/posttype';
import { JobDetails } from 'src/app/module/client/post-job/job-details';
import { JobsiteDetail } from 'src/app/module/client/Vos/jobsitemodel';
import { ProjectDetail } from 'src/app/module/client/Vos/projectDetailmodel';
import { ClientProfileService } from 'src/app/service/client-services/client-profile/client-profile.service';
import { JobDetailService } from 'src/app/service/client-services/job-detail/job-detail.service';
import { JobsiteService } from 'src/app/service/client-services/post-project/jobsite.service';
import { PostProjectService } from 'src/app/service/client-services/post-project/post-project.service';
import { ProjectDetailService } from 'src/app/service/client-services/project-detail.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { DateHelperService } from 'src/app/service/date-helper.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { ProjectBidService } from 'src/app/service/subcontractor-services/project-bid/project-bid.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { isNullOrUndefined } from 'util';
import { API_CONSTANTS } from '../ApiConstants';
import { APPCONSTANTS } from '../AppConstants';
import { COMMON_CONSTANTS } from '../CommonConstants';
import { UINotificationService } from '../notification/uinotification.service';
import { PATH_CONSTANTS } from '../PathConstants';
import { User } from '../vo/User';

@Component({
  selector: 'app-project-job-selection',
  templateUrl: './project-job-selection.component.html',
  styleUrls: ['./project-job-selection.component.css']
})
export class ProjectJobSelectionComponent implements OnInit, OnDestroy {

  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;

  projectOrJobSelectionType: any[];

  datatableParam: DataTableParam;

  datatableParam1: DataTableParam;
  selectedType: any;

  selectedProject: ProjectDetail;

  selectedJobsite: JobsiteDetail;

  selectedJobDetail: JobDetails;

  filterMap = new Map();

  queryParam;

  datePipe;

  tempDate;

  globalFilter;

  loggedInUserId;

  offset = 0;

  projectData: ProjectDetail[] = [];

  jobsiteData: JobsiteDetail[] = [];

  tempJobsiteData: JobsiteDetail[] = [];


  noJobsiteData = [
    { title: 'No Jobsite' }
  ];

  noselectedJobsiteModel = this.noJobsiteData[0];

  noJobData = [
    { title: 'No Job' }
  ];

  noselectedJobModel = this.noJobData[0];

  noProjectData = [
    { title: 'No Project' }
  ];
  noselectedProjectModel = this.noProjectData[0];


  emptyJobsiteForPostProject = [];


  jobData: JobDetails[] = [];
  tempJobData = [];

  defaultProject = new ProjectDetail();
  defaultJobsite = new JobsiteDetail();
  defaultJob = new JobDetails();

  jobsiteSelected = false;

  isProjectSelected = false;

  jobSelected = false;

  subscription = new Subscription();

  jobsiteFilerFormGroup: FormGroup;

  jobFilterFormGroup: FormGroup;

  projectFilterFormGroup: FormGroup;

  dateTime = new Date();

  filteredJobsite: JobsiteDetail[];

  jobTitles = [];
  jobTitleParams;
  selectedFilteredJobsite: JobsiteDetail = null;
  filteredJobTitle: any[] = [];
  // status:JobStatus;
  status = [
    { label: 'Posted', value: 'POSTED' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Offered', value: 'OFFERED' },
    { label: 'Accepted', value: 'ACCEPTED' },
  ];

  filteredStatus: any[] = [];
  employeType = [
    { label: 'Temporary Worker - 1099', value: 'WORKER_1099' },
    { label: 'Temporary Worker - W2', value: 'WORKER_W2' },
    { label: 'Full-time Employee', value: 'FULL_TIME' },
  ];
  orderByFields = [
    { label: 'Job title', value: 'TITLE' },
    { label: 'Job Post Date', value: 'CREATED_DATE' },
    { label: 'Employment Type', value: 'EMPLOYMENT_TYPE' },
    { label: 'Region', value: 'REGION' }
  ];

  orderByFieldsForProject = [
    { label: 'Client Name', value: 'COMPANY_NAME' },
    { label: 'Project Title', value: 'PROJECT_TITLE' },
    { label: 'Project Post Date', value: 'UPDATED_DATE' },
    { label: 'Bid End Date', value: 'BID_DUE_DATE' }
  ];

  orderBy = [
    { label: 'Ascending', value: '1' },
    { label: 'Descending', value: '-1' },
  ];

  statusForJobsite = [
    { label: 'Posted', value: 'POSTED' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'In Progress', value: 'IN_PROGRESS' }
  ];

  filteredEmployeType: any[] = [];
  filteredOrderByFields: any[] = [];
  filteredOrderBy: any[] = [];
  workers: any;
  workerNameParams;
  title = [];
  assignedTo = [];
  client = [];
  stateArray = [];
  regionArray = [];
  industryType = [];
  employementType: any;
  statusFilter = [];
  startDate: Date;
  endDate: Date;
  sortField = 'UPDATED_DATE';
  sortFieldForProject = 'UPDATED_DATE';
  sortOrder = -1;
  size = 10;
  orderField: any;
  keyword: any;

  updateUISubject = new BehaviorSubject(this.projectData);

  dateFlag = false;
  emptyArray: any[] = [];

  hidejobsiteList = false;
  jobOpenings: any;
  jobLocation;

  hideAllLabelsFromProjectJobsiteAndJob = true;

  // filterproject variable
  filteredProjectTitles = [];
  filteredClientForProject = [];
  filteredStateForProject = [];
  filteredCityForProject = [];
  filteredIndustryForProject = [];
  filteredRegionForProject = [];
  filteredOrderByForProject: any[] = [];
  projectTitleParams;
  clientForProjectParams;
  stateForProjectParams;
  cityForProjectParams;
  industryForProjectParams;
  regionForProjectParams;
  region;
  state: any[] = [];

  // filterJobsite variable
  filteredjobsiteTitles = [];
  filteredStateForJobsite = [];
  filteredCityForJobsite = [];
  filteredStatusForJobsite = [];
  jobsiteTitleParams;
  stateForJobsiteParams;
  cityForJobsiteParams;
  jobsiteTitle = [];
  cityArrayJobsite = [];
  stateArrayJobsite = [];
  statusFilterForJobsite = [];
  jobsiteKeyword: any;
  jobsitezipcode: any;
  costFlage = false;
  filterMapOfJobsite = new Map();
  globalFilterOfJobsite;
  latitude: any = null;
  longitude: any = null;
  datatableParamofJobsite: DataTableParam;
  locationFlage = false;
  isSelectedJobsite = false;
  currentProjectStep = 1;
  loggedInUser: User;
  loadDataForCompletedAndCancelledJobs = false;
  loadDataForCompletedAndCancelledProject = false;
  completedAndCanceledStatus = [{ label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Completed', value: 'COMPLETED' }];
  statusForratingAndReview = [];
  hideAllLabelUrl: string[];
  hasProjectAccess: boolean;
  hasJobAccess: boolean;
  roleName: any;
  jobsitemiles: any;
  jobmiles: any;
  locationRadius = APPCONSTANTS.DEFAULT_RADIUS_OPTIONS;
  jobLocationRadius = APPCONSTANTS.DEFAULT_RADIUS_OPTIONS;
  jobTitleParamsForSetMargin: { name: any; };
  jobTitleParamsForTimesheet: { name: any; };
  projectTitleParamsForSetMargin: { name: any; };
  projectToSetPlaceholder: any;
  zoom: number;
  private geoCoder;
  @ViewChild('search') searchElementRef: ElementRef;
  isBidded: any;
  doNotLoadProjectOrJobDataForURL: any[] = [];
  projectAndJobsiteLoadUrl: string[] = [];
  JobLoadUrl: string[] = [];
  previousurl;
  invoiceAndTimesheetUrls: string[] = [];
  differentLoadJobUrls: string[] = [];

  // Custom Scroll For Job
  @ViewChildren('innerDivJob') innerDivJob: QueryList<ElementRef>;
  totalRecordsOfJob = 0;

  // Custom Scroll For Project
  @ViewChildren('innerDivProject') innerDivProject: QueryList<ElementRef>;
  totalRecordsOfProject = 0;
  offsetForProject = 0;
  offsetForProjectFilter = 0;
  offsetForJobsite = 0;
  offsetForJobsiteFilter = 0;
  offsetForJob = 0;
  offsetForJobFilter = 0;
  differentLoadProjectUrls: string[] = [];
  tempProjectData = [];
  // tslint:disable-next-line: max-line-length
  constructor(
    private localStorageService: LocalStorageService, private projectService: ProjectDetailService, private jobService: JobDetailService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private router: Router, private formBuilder: RxFormBuilder,
    private postProjectService: PostProjectService,
    private filterlLeftPanelService: FilterLeftPanelDataService,
    private notificationService: UINotificationService,
    private dateHelperService: DateHelperService,
    private translator: TranslateService,
    private jobsiteService: JobsiteService,
    private confirmDialogService: ConfirmDialogueService,
    private _clientProfile: ClientProfileService,
    private jobDetailService: JobDetailService,
    private projectbiddetail: ProjectBidService,
  ) {
    this.loggedInUser = this.localStorageService.getLoginUserObject() as User;
    this.loggedInUserId = this.loggedInUser.id;

    this.subscribedBehaviourSubject();

    this.doNotLoadProjectOrJobDataForURL = ['/client/Invitee-configuration',
      '/client/leader-board'];

    this.hideAllLabelUrl = APPCONSTANTS.HIDE_ALL_URL_FOR_PROJECT_JOB_SELECTION;

    this.JobLoadUrl = APPCONSTANTS.JOB_LOAD_URL_FOR_PROJECT_JOB_SELECTION;

    this.invoiceAndTimesheetUrls = APPCONSTANTS.INVOICE_AND_TIME_SHEET_URL_FOR_PROJECT_JOB_SELECTION;

    this.differentLoadJobUrls = [
      '/client/ratingAndReviewProject?type=JOBS',
      '/client/worker-comparison',
    ];

    this.projectAndJobsiteLoadUrl = APPCONSTANTS.PROJECT_JOBSITE_LOAD_URL;

    this.differentLoadProjectUrls = [
      '/client/bidComparision',
      '/client/project-rating-review',
      '/client/invoicesProject',
    ];

    this.projectOrJobSelectionType = [
      { label: 'Project', value: PostType.Project },
      { label: 'Job', value: PostType.JOB }
    ];

    this.defaultProject.title = 'All Projects';
    this.defaultProject.id = 'pid';

    this.defaultJobsite.title = 'All Jobsites';
    this.defaultJobsite.id = 'jid';

    this.defaultJob.title = 'All Jobs';
    this.defaultJob.id = 'jobId';

    this.initializeJobSiteFilterFormGroup();
    this.initializeJobfilterFormGroup();
    this.initializeProjectFilterFormGroup();
    router.events.pipe(filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.loadDataForCompletedAndCancelledProject = false;
      if (this.localStorageService.getItem('ratingAndReviewClicked')) {
        this.getSuggestedFilter(event.url);
      }
      if (this.localStorageService.getItem('filterJobFilterMap')) {
        this.clear();
      }
      else if (this.localStorageService.getItem('filterProjectFilterMap')) {
        this.clearProject();
      }
      this.decideAllLabelUrl(event.url);
    });
    this.previousurl = '';
    this.router.events
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.previousurl = this.router.url;
        }
      });


  }

  ngAfterViewInit(): void {
    const currentUrl = this.router.url;
    this.innerDivJob.changes.subscribe((div) => {
      const listJobId = document.getElementById('ListJob');
      if (listJobId) {
        const listBoxWrapper = listJobId.querySelector('.p-listbox-list-wrapper');
        listBoxWrapper.addEventListener('scroll', (event) => {
          const scrollTop = listBoxWrapper.scrollTop;
          const end = listBoxWrapper.scrollHeight - listBoxWrapper.clientHeight;
          const scrollEnd = scrollTop / end;
          if (scrollEnd === 1) {
            if (this.checkFormFilled(this.jobFilterFormGroup)) {
              if (this.calculateOffset(this.offsetForJobFilter, this.totalRecordsOfJob)) {
                this.offsetForJobFilter = this.offsetForJobFilter + 1;
                this.offsetForJob = 0;
                if (this.selectedJobDetail) {
                  this.loadDataForJobDetail(this.selectedJobDetail, true);
                } else {
                  const selectedJobDetail = this.localStorageService.getSelectedJob();
                  if (selectedJobDetail) {
                    this.loadDataForJobDetail(selectedJobDetail, true);
                  } else {
                    this.loadDataForJobDetail(this.defaultJob, true);
                  }
                }
              }
            } else {
              if (this.calculateOffset(this.offsetForJob, this.totalRecordsOfJob)) {
                this.offsetForJob = this.offsetForJob + 1;
                this.offsetForJobFilter = 0;
                if (this.selectedJobDetail) {
                  this.loadDataForJobDetail(this.selectedJobDetail, true);
                } else {
                  const selectedJobDetail = this.localStorageService.getSelectedJob();
                  if (selectedJobDetail) {
                    this.loadDataForJobDetail(selectedJobDetail, true);
                  } else {
                    this.loadDataForJobDetail(this.defaultJob, true);
                  }
                }
              }
            }
          }

        });
      }
    });
    this.innerDivProject.changes.subscribe((div) => {
      const listProjectId = document.getElementById('ListProject');
      if (listProjectId) {
        const listBoxWrapper = listProjectId.querySelector('.p-listbox-list-wrapper');
        listBoxWrapper.addEventListener('scroll', (event) => {
          const scrollTop = listBoxWrapper.scrollTop;
          const end = listBoxWrapper.scrollHeight - listBoxWrapper.clientHeight;
          const scrollEnd = scrollTop / end;
          if (scrollEnd === 1) {
            if (this.checkFormFilled(this.projectFilterFormGroup)) {
              if (this.calculateOffset(this.offsetForProjectFilter, this.totalRecordsOfProject)) {
                this.offsetForProjectFilter = this.offsetForProjectFilter + 1;
                this.offsetForProject = 0;
                if (this.selectedProject) {
                  this.loadDataForProject(this.selectedProject, true);
                } else {
                  const selectedProject = this.localStorageService.getSelectedProjectObject();
                  if (selectedProject) {
                    this.loadDataForProject(selectedProject, true);
                  } else {
                    this.loadDataForProject(this.defaultProject, true);
                  }
                }
              }
            } else {
              if (this.calculateOffset(this.offsetForProject, this.totalRecordsOfProject)) {
                this.offsetForProject = this.offsetForProject + 1;
                this.offsetForProjectFilter = 0;
                if (this.selectedProject) {
                  this.loadDataForProject(this.selectedProject, true);
                } else {
                  const selectedProject = this.localStorageService.getSelectedProjectObject();
                  if (selectedProject) {
                    this.loadDataForProject(selectedProject, true);
                  } else {
                    this.loadDataForProject(this.defaultProject, true);
                  }
                }
              }
            }
          }
        });
      }
    });
  }

  calculateOffset(offset, totalRecordsOfJob): boolean {
    const decideoffset = totalRecordsOfJob / (offset + 1);
    if (decideoffset > 10) {
      return true;
    }
    return false;
  }
  checkFormFilled(form: FormGroup) {
    let controlName: string;
    // tslint:disable-next-line: forin
    let count = 0;
    for (controlName in form.controls) {
      if (form.controls[controlName].value?.length === undefined && form.controls[controlName].value.value) {
        count++;
      } else if (form.controls[controlName].value?.length > 0) {
        count++;
      }
    }

    if (count > 0) {
      return true;
    } else {
      return false;
    }
  }

  decideAllLabelUrl(url: string): void {
    switch (url) {
      case '/client/view-job-details':
      case '/client/worker-comparison':
      case '/admin/job-details':
      case '/admin/set-job-margin':
      case '/admin/worker-comparison':
        if (this.localStorageService.getSelectedPostType() === 'PROJECT') {
          this.localStorageService.setItem('hideAllLabelsFromProjectJobsiteAndJob', false);
          this.hideAllLabelsFromProjectJobsiteAndJob = false;
          this.loadDataForProject(this.defaultProject);
        } else {
          this.localStorageService.setItem('hideAllLabelsFromProjectJobsiteAndJob', false);
          this.hideAllLabelsFromProjectJobsiteAndJob = false;
          this.loadDataForJobDetail(this.defaultJob);
        }
        break;
      case '/admin/project-details':
      case '/admin/jobsite-details':
      case '/admin/set-project-margin':
      case '/admin/bid-comparison':
      case '/client/jobsiteDetails':
      case '/client/projectDetails':
      case '/client/bidComparision':
      case '/client/question-answer':
      case '/admin/project-question-and-answer':
      case '/client/chat-messages':
        if (this.localStorageService.getSelectedPostType() === 'PROJECT') {
          this.localStorageService.setItem('hideAllLabelsFromProjectJobsiteAndJob', false);
          this.hideAllLabelsFromProjectJobsiteAndJob = false;
          this.loadDataForProject(this.defaultProject);
        } else {
          this.localStorageService.setItem('hideAllLabelsFromProjectJobsiteAndJob', false);
          this.hideAllLabelsFromProjectJobsiteAndJob = false;
          this.loadDataForJobDetail(this.defaultJob);
        }
        break;
      default:
        this.hideAllLabelsFromProjectJobsiteAndJob = true;
        this.localStorageService.setItem('hideAllLabelsFromProjectJobsiteAndJob', true);
        if (!this.hideAllLabelUrl.includes(url)) {
          const postType = this.localStorageService.getSelectedPostType();
          if (postType === 'JOB') {
            this.loadDataForJobDetail(this.defaultJob);
          } else {
            this.loadDataForProject(this.defaultProject);
          }
        }
        break;
    }

  }

  getSuggestedFilter(url: string) {
    if (url === '/client/ratingAndReviewProject?type=JOBS' || url === '/admin/rating-review') {
      this.loadDataForCompletedAndCancelledJobs = true;
      this.localStorageService.setItem('selectedJob', this.defaultJob);
      this.loadDataForJobDetail(this.defaultJob);
    }
    else if (url === '/client/project-rating-review' || url === '/admin/project-rating-review') {
      this.loadDataForCompletedAndCancelledProject = true;
      this.localStorageService.setItem('selectedProject', this.defaultProject);
      this.localStorageService.setItem('selectedJobsite', this.defaultJobsite);
      this.loadDataForProject(this.defaultProject);
      if (this.projectData.length === 0) {
        this.jobsiteData = [];
      }
    }
    else {
      this.loadDataForCompletedAndCancelledProject = false;
      this.loadDataForCompletedAndCancelledJobs = false;
      this.loadDataForProject(this.defaultProject);
      this.loadDataForJobDetail(this.defaultJob);
      if (this.router.url === '/client/view-job-details') {
        this.localStorageService.removeItem('selectedJob');
      }
      else if (this.router.url === '/client/projectDetails') {
        this.localStorageService.removeItem('selectedProject');
        this.localStorageService.removeItem('selectedJobsite');
      }
      else {
        this.localStorageService.setItem('selectedJob', this.defaultJob);
        this.localStorageService.setItem('selectedProject', this.defaultProject);
        this.localStorageService.setItem('selectedJobsite', this.defaultJobsite);
      }
      this.localStorageService.removeItem('ratingAndReviewClicked');
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getClientDetailByUserId(): void {
    const user = this.localStorageService.getLoginUserObject();
    this.roleName = user.roles[0].roleName;
    if (user.roles[0].roleName === 'CLIENT') {
      const userId = user.id;
      this._clientProfile.getClientProfileDetailById(userId).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            if (data.data.basicProfile) {
              this.hasProjectAccess = data.data.basicProfile.isProjectAccess;
              this.hasJobAccess = data.data.basicProfile.isJobAccess;
              this.setSidebarSwitcherForProjectAndJob(this.hasProjectAccess, this.hasJobAccess);
            }
          }
        });
    } else {
      this.getFiltersAndLoadData(PostType.Project);
    }
  }

  setSidebarSwitcherForProjectAndJob(projectAccess: boolean, jobAccess: boolean): void {
    if (projectAccess && jobAccess) {
      if (this.localStorageService.getSelectedPostType()) {
        this.selectedType = this.localStorageService.getSelectedPostType();
      } else {
        this.selectedType = PostType.Project;
      }
      this.getFiltersAndLoadData(this.selectedType);
    }

    if (projectAccess && !jobAccess) {
      this.localStorageService.setItem('Post_Type', PostType.Project);
      this.getFiltersAndLoadData(PostType.Project);
    }

    if (jobAccess && !projectAccess) {
      this.localStorageService.setItem('Post_Type', PostType.JOB);
      this.getFiltersAndLoadData(PostType.JOB);
    }

    if (!jobAccess && !projectAccess) {
      this.localStorageService.setItem('Post_Type', PostType.NONE);
      this.getFiltersAndLoadData(PostType.NONE);
    }

  }

  ngOnInit(): void {
    this.localStorageService.removeItem('filterProjectFilterMap');
    this.localStorageService.removeItem('filterJobFilterMap');
    this.subscribedBehaviourSubject();
    this.getClientDetailByUserId();
    this.loadDataForCompletedAndCancelledJobs = this.router.url === '/client/ratingAndReviewProject?type=JOBS' ? true : false;
    this.loadDataForCompletedAndCancelledProject = this.router.url === '/client/project-rating-review' ? true : false;
    if (this.router.url === '/admin/project-rating-review') {
      this.loadDataForCompletedAndCancelledProject = true;
    }
    if (this.router.url === '/admin/rating-review') {
      this.loadDataForCompletedAndCancelledJobs = true;
    }

    const postType = this.localStorageService.getSelectedPostType();

    if (postType) {
      this.selectedType = postType;
      this.projectJobSelectionService.postTypeSubject.next(this.selectedType);
    } else {
      this.selectedType = PostType.Project;
      this.localStorageService.setItem('Post_Type', this.selectedType, false);
      this.projectJobSelectionService.postTypeSubject.next(this.selectedType);
    }

    this.subscription.add(
      this.projectJobSelectionService.adminMarginSidebar.subscribe(
        data => {
          const project = this.localStorageService.getSelectedProjectObject();
          this.loadDataForProject(project);
        }
      )
    );
    this.subscription.add(
      this.projectJobSelectionService.adminJobMarginSidebar.subscribe(
        data => {
          const job = this.localStorageService.getSelectedJob();
          this.loadDataForJobDetail(job);
        }
      )
    );
    this.projectToSetPlaceholder = this.localStorageService.getItem('addProjectDetail');
  }

  subscribedBehaviourSubject(): void {

    this.subscription.add(this.projectJobSelectionService.selectedJobsiteOfDropdown.subscribe(
      data => {
        if (this.localStorageService.getItem('selectedJobsiteOfDropdown')) {
          this.isSelectedJobsite = true;
          this.selectedFilteredJobsite = this.localStorageService.getItem('selectedJobsiteOfDropdown');
        }
        else {
          this.isSelectedJobsite = false;
          this.selectedFilteredJobsite = null;
        }
      }
    ));

    this.subscription.add(this.postProjectService.currentPostProjectStep.subscribe(e => {
      if (this.localStorageService.getItem('currentProjectStep')) {
        this.currentProjectStep = this.localStorageService.getItem('currentProjectStep');
      }
      else {
        this.currentProjectStep = 1;
      }
    }));

    this.subscription.add(this.projectJobSelectionService.addJobSubject.subscribe(e => {
      if (this.router.url !== '/client/ratingAndReviewProject?type=JOBS') {

        if (e) {
          this.previousurl = '';
          this.jobData = [];
          this.offsetForJob = 0;
          this.loadDataForJobDetail(e);
        }
        else if (this.localStorageService.getItem('selectedJob')) {
          this.loadDataForJobDetail(this.localStorageService.getItem('selectedJob'));
        }
        else {
          this.loadDataForJobDetail(this.defaultJob);
        }
      }
    }));

    this.subscription.add(this.projectJobSelectionService.addJobsiteSubject.subscribe(e => {
      if (this.router.url !== '/client/projectDetails') {
        this.previousurl = '';
        this.projectData = [];
        this.offsetForProject = 0;
      }
      const project = this.localStorageService.getItem('addProjectDetail');
      this.projectToSetPlaceholder = project;
      if (this.router.url === '/client/project-rating-review') {
        this.loadDataForCompletedAndCancelledProject = true;
      }
      this.loadDataForProject(project);
    }));

    this.subscription.add(this.projectJobSelectionService.updateJobsiteStatusSubject.subscribe(e => {
      const selectedJobsite = this.localStorageService.getSelectedJobsiteObject();
      const index = this.jobsiteData.indexOf(selectedJobsite.id);
      this.jobsiteData[index] = selectedJobsite;
      this.selectedJobsite = this.jobsiteData[index];
    }));

    this.subscription.add(this.projectJobSelectionService.addProjectSubject.subscribe(e => {
      const project = this.localStorageService.getItem('addProjectDetail');
      this.projectToSetPlaceholder = project;
      if (this.router.url === '/client/project-rating-review') {
        this.loadDataForCompletedAndCancelledProject = true;
      }
      if (e) {
        this.previousurl = '';
        this.projectData = [];
        this.offsetForProject = 0;
        this.loadDataForProject(e);
      } else if (this.localStorageService.getSelectedProjectObject()) {
        this.loadDataForProject(this.localStorageService.getSelectedProjectObject());
      } else {
        this.loadDataForProject(this.defaultProject);
      }
    }));

    this.subscription.add(this.projectJobSelectionService.hideJobsiteListBehaviourSubject.subscribe(e => {
      this.hidejobsiteList = e;
    }));

    this.subscription.add(this.projectJobSelectionService.addHideAllLabelSubjectForJob.subscribe(e => {
      if (this.router.url !== '/login') {
        this.hideAllLabelsFromProjectJobsiteAndJob = e;
        this.localStorageService.setItem('hideAllLabelsFromProjectJobsiteAndJob', e, false);
        if (this.localStorageService.getSelectedJob()) {
          this.loadDataForJobDetail(this.localStorageService.getSelectedJob());
        } else {
          this.loadDataForJobDetail(this.defaultJob);
        }
      }
    }));
  }

  public initializeJobfilterFormGroup(): void {
    const jobTitle = new FormArray([]);
    jobTitle.push(this.formBuilder.group({
      title: [],
    }));
    this.jobFilterFormGroup = this.formBuilder.group({
      locationMile: [],
      keyword: [''],
      jobTitle: [''],
      autoComplete: [''],
      miles: [''],
      assignedTo: [''],
      dateRange: [''],
      employmentType: [''],
      status: [''],
      fields: [''],
      orderBy: [''],
      noOfJobOpenings: [''],
    });

  }

  public initializeJobSiteFilterFormGroup(): void {
    this.jobsiteFilerFormGroup = this.formBuilder.group({
      keyword: [''],
      jobsiteTitle: [''],
      city: null,
      state: null,
      zipcode: [''],
      status: [''],
      estimatedCostFrom: [0],
      estimatedCostTo: [0],
      autoComplete: [''],
      miles: ['']
    });
  }

  public initializeProjectFilterFormGroup(): void {
    this.projectFilterFormGroup = this.formBuilder.group({

      projectTitle: ['',],
      clientName: [''],
      industryType: [''],
      dateRange: [''],
      state: [''],
      city: [''],
      region: [''],
      fields: [''],
      orderBy: ['']
    });
  }

  public filterJobsite(): void {
    this.statusForratingAndReview.length = 0;

    this.jobsiteFilerFormGroup.markAllAsTouched();
    this.hideAllLabelsFromProjectJobsiteAndJob = this.localStorageService.getItem('hideAllLabelsFromProjectJobsiteAndJob');
    this.jobsiteData = [];
    this.jobsiteTitle.length = 0;
    this.cityArrayJobsite.length = 0;
    this.stateArrayJobsite.length = 0;
    this.statusFilterForJobsite.length = 0;
    this.costFlage = false;
    this.filterMapOfJobsite.clear();
    const jsonObject = {};
    this.filterMapOfJobsite.set('PROJECT_ID', this.selectedProject.id);
    if (this.jobsiteFilerFormGroup.value.keyword) {
      this.jobsiteKeyword = this.jobsiteFilerFormGroup.value.keyword;
      this.filterMapOfJobsite.set('KEYWORD', this.jobsiteKeyword);
    }
    if (this.jobsiteFilerFormGroup.value.jobsiteTitle) {
      this.jobsiteFilerFormGroup.value.jobsiteTitle.forEach(element => {
        this.jobsiteTitle.push(element);
        this.filterMapOfJobsite.set('TITLE', this.jobsiteTitle.toString());
      });
    }
    if (this.jobsiteFilerFormGroup.value.miles !== '') {
      this.jobsitemiles = this.jobsiteFilerFormGroup.value.miles;
      this.filterMapOfJobsite.set('MILES', this.jobsitemiles);
    }
    if (this.jobsiteFilerFormGroup.value.state) {
      this.jobsiteFilerFormGroup.value.state.forEach(element => {
        this.stateArrayJobsite.push(element);
        this.filterMapOfJobsite.set('STATE', this.stateArrayJobsite.toString());
      });
    }
    if (this.jobsiteFilerFormGroup.value.city) {
      this.jobsiteFilerFormGroup.value.city.forEach(element => {
        this.cityArrayJobsite.push(element);
        this.filterMapOfJobsite.set('CITY', this.cityArrayJobsite.toString());
      });
    }
    if (this.jobsiteFilerFormGroup.value.zipcode) {
      this.jobsitezipcode = this.jobsiteFilerFormGroup.value.zipcode;
      this.filterMapOfJobsite.set('ZIP_CODE', this.jobsitezipcode);
    }

    if (this.jobsiteFilerFormGroup.value.status) {
      this.jobsiteFilerFormGroup.value.status.forEach(element => {
        this.statusFilterForJobsite.push(element.value);
        this.filterMapOfJobsite.set('STATUS', this.statusFilterForJobsite.toString());
      });
    }
    else {
      this.completedAndCanceledStatus.forEach(element => {
        this.statusForratingAndReview.push(element.value);
      });
      this.filterMap.set('STATUS', this.statusForratingAndReview.toString());
    }

    const cost = this.jobsiteFilerFormGroup.value.estimatedCostTo - this.jobsiteFilerFormGroup.value.estimatedCostFrom;

    if (cost >= 0) {
      if (cost !== 0) {
        this.filterMapOfJobsite.set('GREATER_THAN_COST', this.jobsiteFilerFormGroup.value.estimatedCostFrom);
        this.filterMapOfJobsite.set('LESS_THAN_COST', this.jobsiteFilerFormGroup.value.estimatedCostTo);
      }
    }
    else {
      this.costFlage = true;
      this.notificationService.error('Enter appropriate cost', '');
    }

    if (this.latitude !== null && this.longitude !== null) {
      if (this.jobsiteFilerFormGroup.value.miles === '') {
        this.filterMapOfJobsite.set('MILES', 100);
      }
      this.filterMapOfJobsite.set('LATITUDE', this.latitude);
      this.filterMapOfJobsite.set('LONGITUDE', this.longitude);
    }

    this.filterMapOfJobsite.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilterOfJobsite = JSON.stringify(jsonObject);
    this.datatableParamofJobsite = {
      offset: this.offsetForJobsite,
      size: this.size,
      sortField: 'UPDATED_DATE',
      sortOrder: 0,
      searchText: this.globalFilterOfJobsite
    };

    this.queryParam = this.prepareQueryParam(this.datatableParamofJobsite);
    if (!this.costFlage) {
      this.jobsiteService.getAllJobsite(this.queryParam).subscribe(e => {

        if (e.data.totalRecords !== 0) {
          if (this.router.url === '/client/project-rating-review') {
            e.data.result.forEach(data => {

              if (data.status === 'COMPLETED' || data.status === 'CANCELLED') {
                this.jobsiteData.push(data);
              }
            });
          } else {
            this.jobsiteData = e.data.result;
          }
          this.filterMapOfJobsite.clear();
          if (!this.jobsiteData.some((item) => item.id === this.defaultJobsite.id) && this.hideAllLabelsFromProjectJobsiteAndJob) {
            this.jobsiteData.unshift(this.defaultJobsite);
          }
          if (this.jobsiteData.length) {
            this.selectedJobsite = this.jobsiteData[0];
            this.localStorageService.setItem('selectedJobsite', this.selectedJobsite);
          }
        }
      },
        error => {
        });
    }
    else {
      this.clearJobsite();
    }

  }

  clearJobsite(): any {
    this.latitude = null;
    this.longitude = null;
    this.jobsiteFilerFormGroup.reset();
    this.jobsiteFilerFormGroup.get('jobsiteTitle').patchValue(this.emptyArray);
    this.jobsiteFilerFormGroup.get('status').patchValue(this.emptyArray);
    this.locationFlage = false;
    this.filterJobsite();
  }


  public filterproject(): void {
    if (!isNullOrUndefined(this.localStorageService.getItem('hideAllLabelsFromProjectJobsiteAndJob'))) {
      this.hideAllLabelsFromProjectJobsiteAndJob = this.localStorageService.getItem('hideAllLabelsFromProjectJobsiteAndJob');
    } else {
      this.hideAllLabelsFromProjectJobsiteAndJob = true;
    }
    this.projectData = [];
    this.offsetForProjectFilter = 0;
    this.client.length = 0;
    this.title.length = 0;
    this.regionArray.length = 0;
    this.stateArray.length = 0;
    this.industryType.length = 0;
    this.dateFlag = false;
    this.filterMap.clear();
    const jsonObject = {};
    if (this.projectFilterFormGroup.value.projectTitle) {
      this.projectFilterFormGroup.value.projectTitle.forEach(element => {
        this.title.push(element);
        this.filterMap.set('PROJECT_TITLE', this.title.toString());
      });
    }
    if (this.projectFilterFormGroup.value.clientName) {
      this.projectFilterFormGroup.value.clientName.forEach(element => {
        this.client.push(element);
        this.filterMap.set('COMPANY_NAME', this.client.toString());
      });
    }
    if (this.projectFilterFormGroup.value.industryType) {
      this.projectFilterFormGroup.value.industryType.forEach(element => {
        this.industryType.push(element);
        this.filterMap.set('INDUSTRY_NAME', this.industryType.toString());
      });
    }
    if (this.projectFilterFormGroup.value.state) {
      this.projectFilterFormGroup.value.state.forEach(element => {
        this.stateArray.push(element);
        this.filterMap.set('STATE_NAME', this.stateArray.toString());
      });
    }
    if (this.projectFilterFormGroup.value.region) {
      this.projectFilterFormGroup.value.region.forEach(element => {
        this.regionArray.push(element);
        this.filterMap.set('REGION_NAME', this.regionArray.toString());

      });
    }

    if (this.projectFilterFormGroup.value.dateRange) {
      this.startDate = this.projectFilterFormGroup.value.dateRange[0];
      this.dateHelperService.setStartDate(this.startDate);
      const datePipe = new DatePipe('en-US');
      const value = datePipe.transform(this.startDate, 'yyyy-MM-dd HH:mm:ss');
      this.filterMap.set('POSTED_DATE_ONE', value);
      this.endDate = this.projectFilterFormGroup.value.dateRange[1];
      if (this.endDate) {
        this.dateHelperService.setEndDate(this.endDate);
        const datePipe = new DatePipe('en-US');
        const value = datePipe.transform(this.endDate, 'yyyy-MM-dd HH:mm:ss');
        this.filterMap.set('POSTED_DATE_TWO', value);
      } else {
        this.dateFlag = true;
        this.notificationService.error('Enter appropriate dateRange', '');
      }
    }

    if (this.projectFilterFormGroup.value.fields) {
      this.sortFieldForProject = this.projectFilterFormGroup.value.fields.value;
    }
    if (this.projectFilterFormGroup.value.orderBy) {
      this.sortOrder = this.projectFilterFormGroup.value.orderBy.value;
    }
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });

    this.globalFilter = JSON.stringify(jsonObject);

    this.datatableParam = {
      offset: this.offsetForProjectFilter,
      size: 1000000,
      sortField: this.sortFieldForProject,
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    if (!this.dateFlag) {
      this.localStorageService.setItem('filterProjectFilterMap', JSON.stringify(Array.from(this.filterMap.entries())));
      this.loadDataForProject(this.defaultProject, true);
    }
    else {
      this.loadDataForProject(this.defaultProject, true);
    }
  }

  clearProject(): any {
    this.projectFilterFormGroup.reset();
    this.localStorageService.removeItem('filterProjectFilterMap');
    this.projectFilterFormGroup.get('projectTitle').patchValue(this.emptyArray);
    this.projectFilterFormGroup.get('clientName').patchValue(this.emptyArray);
    this.projectFilterFormGroup.get('state').patchValue(this.emptyArray);
    this.projectFilterFormGroup.get('region').patchValue(this.emptyArray);
    this.projectFilterFormGroup.get('industryType').patchValue(this.emptyArray);
    this.projectData = [];
    this.jobsiteData = [];
    this.offsetForProject = 0;
    this.loadDataForProject(this.defaultProject, true);
  }
  filterJob() {
    this.filterMap.clear();
    const jsonObject = {};
    this.jobData = [];
    this.offsetForJobFilter = 0;
    this.selectedJobDetail = null;
    this.defaultJob.id = 'jobId';

    this.filterMap.clear();
    this.statusForratingAndReview.length = 0;
    const user = this.localStorageService.getLoginUserObject() as User;
    if (user.roles[0].roleName !== 'ADMIN' && user.roles[0].roleName !== 'SUBADMIN') {
      if (user.roles[0].roleName === 'SUPERVISOR') {
        const clientOfLoggedInSupervisor = this.localStorageService.getItem('clientOfLoggedInSupervisor');
        this.filterMap.set('SUPERVISOR', this.loggedInUserId);
        this.filterMap.set('USER_ID', clientOfLoggedInSupervisor.id);
      }
      else {
        this.filterMap.set('USER_ID', this.loggedInUserId);
      }
    }
    if (this.loadDataForCompletedAndCancelledJobs || this.router.url === '/admin/rating-review') {

      this.jobData = [];
      this.selectedJobDetail = null;
      this.filterMap.set('STATUS', ['CANCELLED', 'COMPLETED'].toString());
    }
    else if (this.router.url === '/admin/timesheets' || this.router.url === '/admin/invoices') {
      this.filterMap.set('STATUS_ADMIN_TIMESHEET', '');
    }
    else {
      // condition for completed jobs for chat message
      if (this.router.url === PATH_CONSTANTS.CLIENT_CHAT_SCREEN) {
        this.filterMap.set('WITHOUT_CANCELLED', 'CANCELLED');
      } else {
        if (user.roles[0].roleName !== 'ADMIN' && user.roles[0].roleName !== 'SUBADMIN') {
          this.filterMap.set('WITHOUT_COMPLETED', 'COMPLETED');
          this.filterMap.set('WITHOUT_CANCELLED', 'CANCELLED');
        }
      }
    }

    if (this.router.url === '/admin/set-job-margin') {
      this.filterMap.clear();
      this.filterMap.set('GET_OFFERED_POSTED_JOB', 'offeredPostedJobForAdmin');
    }

    if (!isNullOrUndefined(this.localStorageService.getItem('hideAllLabelsFromProjectJobsiteAndJob'))) {
      this.hideAllLabelsFromProjectJobsiteAndJob = this.localStorageService.getItem('hideAllLabelsFromProjectJobsiteAndJob');
    } else {
      this.hideAllLabelsFromProjectJobsiteAndJob = true;
    }
    this.statusFilter.length = 0;
    this.title.length = 0;
    this.assignedTo.length = 0;
    if (this.jobFilterFormGroup.value.keyword) {
      this.keyword = this.jobFilterFormGroup.value.keyword;
      this.filterMap.set('KEY_WORD', this.keyword);
    }
    if (this.jobFilterFormGroup.value.jobTitle) {

      this.jobFilterFormGroup.value.jobTitle.forEach(element => {
        this.title.push(element);
        this.filterMap.set('TITLE', this.title.toString());

      });


    }
    if (this.jobFilterFormGroup.value.assignedTo) {
      this.jobFilterFormGroup.value.assignedTo.forEach(element => {
        this.assignedTo.push(element.id);

        this.filterMap.set('ASSIGNED_TO_ID', this.assignedTo.toString());
      });
    }
    if (this.jobFilterFormGroup.value.employmentType) {
      this.jobFilterFormGroup.value.employmentType.forEach(element => {
        this.employementType = element.value;
        this.filterMap.set('EMPLOYMENT_TYPE', this.employementType);
      });
    }
    if (this.jobFilterFormGroup.value.status) {
      this.jobFilterFormGroup.value.status.forEach(element => {
        if (element.value !== 'ACCEPTED' && element.value !== 'OFFERED') {
          this.statusFilter.push(element.value);
          this.filterMap.set('STATUS', this.statusFilter.toString());
        }
        if (element.value === 'ACCEPTED') {
          this.filterMap.set('GET_ACCEPTED_JOB_FOR_FILTER', 'ACCEPTED');
        }
        if (element.value === 'OFFERED') {
          this.filterMap.set('GET_OFFERED_JOB_FOR_FILTER', 'OFFERED');
        }
      });
    }
    else {
      if (this.router.url === '/client/ratingAndReviewProject?type=JOBS') {
        this.filterMap.set('STATUS', ['CANCELLED', 'COMPLETED'].toString());
      }
    }
    if (this.jobFilterFormGroup.value.noOfJobOpenings) {
      this.jobOpenings = this.jobFilterFormGroup.value.noOfJobOpenings;
      this.filterMap.set('NO_OF_OPENING', this.jobOpenings);
    }
    if (this.jobFilterFormGroup.value.autoComplete) {
      this.jobLocation = this.jobFilterFormGroup.value.autoComplete;
      this.filterMap.set('LOCATION', this.jobLocation);
    }
    if (this.jobFilterFormGroup.value.miles) {
      this.jobmiles = this.jobFilterFormGroup.value.miles;
      this.filterMap.set('MILES', this.jobmiles);
    }

    if (this.jobFilterFormGroup.value.dateRange) {
      this.startDate = this.jobFilterFormGroup.value.dateRange[0];
      this.dateHelperService.setStartDate(this.startDate);
      const datePipe = new DatePipe('en-US');
      const value = datePipe.transform(this.startDate, 'yyyy-MM-dd HH:mm:ss');
      this.filterMap.set('START_DATE', value);
      this.endDate = this.jobFilterFormGroup.value.dateRange[1];
      if (this.endDate) {
        this.dateHelperService.setEndDate(this.endDate);
        const valueEnd = datePipe.transform(this.endDate, 'yyyy-MM-dd HH:mm:ss');

        this.filterMap.set('END_DATE', valueEnd);
      } else {
        this.dateFlag = true;
        this.notificationService.error('Enter appropriate dateRange', '');
      }
    }

    if (this.jobFilterFormGroup.value.fields) {
      this.sortField = this.jobFilterFormGroup.value.fields.value;

    }
    if (this.jobFilterFormGroup.value.orderBy) {
      this.sortOrder = this.jobFilterFormGroup.value.orderBy.value;

    }
    // tslint:disable-next-line: no-shadowed-variable
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });

    this.globalFilter = JSON.stringify(jsonObject);

    this.datatableParam = {
      offset: this.offsetForJobFilter,
      size: this.size,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.jobService.getJobDetailList(this.queryParam).subscribe(e => {

      if (e.statusCode === '200') {
        this.tempJobData = e.data.result;
        this.localStorageService.setItem('filterJobFilterMap', JSON.stringify(Array.from(this.filterMap.entries())));
        if (this.tempJobData) {
          this.tempJobData.forEach(
            job => {
              if (!this.jobData.some((item) => item.id === job.id)) {
                this.jobData.push(job);
              }
            }
          );
          this.jobData = [...this.jobData];
        }
        this.totalRecordsOfJob = e.data.totalRecords;

        this.filterMap.clear();
        const currentUrl = this.router.url;
        if (currentUrl === '/client/worker-comparison' || currentUrl === '/admin/worker-comparison') {
          const job = [];
          e.data.result.forEach(element => {
            if (element.status === 'POSTED') {
              job.push(element);
            }
          });

          this.jobData = job;
        }
        // tslint:disable-next-line: max-line-length
        if (!this.jobData.some((item) => item.id === this.defaultJob.id) && this.hideAllLabelsFromProjectJobsiteAndJob && this.jobData.length) {
          this.jobData.unshift(this.defaultJob);
        }
        if (this.hideAllLabelsFromProjectJobsiteAndJob && this.jobData.length) {
          this.selectedJobDetail = this.defaultJob;
        } else {
          this.selectedJobDetail = this.jobData[0];
        }

      }
    },
      error => {
      });

  }
  getJobList() {
    const tempTitle = [];
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.jobDetailService.getJobDetailList(this.queryParam).subscribe(data => {

      const temp = data.data.result;

      temp.forEach(element => {
        tempTitle.push(element.title);
      });
      this.jobTitles = tempTitle;
    });
  }
  getJobTitle(name): void {
    this.jobTitleParams = null;
    const loggedInUser = this.localStorageService.getLoginUserObject();
    if (loggedInUser.roles[0].roleName === 'ADMIN') {
      this.jobTitleParams = {
        clientId: 'admin',
        name: name.query
      };
    }
    else {
      this.jobTitleParams = {
        clientId: this.loggedInUserId,
        name: name.query
      };
    }
    if (this.router.url === '/client/ratingAndReviewProject?type=JOBS' || this.router.url === '/admin/rating-review') {
      this.queryParam = this.prepareQueryParam(this.jobTitleParams);
      this.filterlLeftPanelService.getJobTitleForClient(this.queryParam).subscribe(data => {

        this.jobTitles = data.data;
        this.jobTitles = this.jobTitles.sort();
      });
    }
    else if (this.router.url === '/client/chat-messages') {
      this.queryParam = this.prepareQueryParam(this.jobTitleParams);
      this.filterlLeftPanelService.getJobTitleForClientWithoutCancelled(this.queryParam).subscribe(data => {

        this.jobTitles = data.data;
        this.jobTitles = this.jobTitles.sort();
      });
    }
    else if (this.router.url === '/admin/set-job-margin') {
      this.jobTitleParamsForSetMargin = {
        name: name.query
      };
      this.queryParam = this.prepareQueryParam(this.jobTitleParamsForSetMargin);
      this.filterlLeftPanelService.getJobTitleForAdminForSetMargin(this.queryParam).subscribe(data => {
        this.jobTitles = data.data;
        this.jobTitles = this.jobTitles.sort();
      });
    }
    else if (this.router.url === '/admin/timesheets' || this.router.url === '/admin/invoices') {
      this.jobTitleParamsForTimesheet = {
        name: name.query
      };
      this.queryParam = this.prepareQueryParam(this.jobTitleParamsForTimesheet);
      this.filterlLeftPanelService.getJobTitleForAdminForTimesheet(this.queryParam).subscribe(data => {
        this.jobTitles = data.data;
        this.jobTitles = this.jobTitles.sort();
      });
    }
    else if (this.router.url === '/client/worker-comparison' || this.router.url === '/admin/worker-comparison') {
      this.queryParam = this.prepareQueryParam(this.jobTitleParams);
      this.filterlLeftPanelService.getJobTitleForClientWithoutCancelledAndCompletedAndDraft(this.queryParam).subscribe(data => {
        this.jobTitles = data.data;
        this.jobTitles = this.jobTitles.sort();
      });
    }
    else {
      this.queryParam = this.prepareQueryParam(this.jobTitleParams);
      this.filterlLeftPanelService.getJobTitleForClientWithoutCancelledAndCompleted(this.queryParam).subscribe(data => {

        this.jobTitles = data.data;
        this.jobTitles = this.jobTitles.sort();
      });
    }
  }
  getWorkerByName(name): void {
    this.workerNameParams = {
      name: name.query
    };
    this.queryParam = this.prepareQueryParam(this.workerNameParams);
    this.filterlLeftPanelService.getWorkerByName(this.queryParam).subscribe(data => {

      this.workers = data.data;
      this.workers = this.workers.sort();
    });
  }

  public projectJobSelectionTypeChanged(event): void {
    this.previousurl = '';
    this.localStorageService.setItem('Post_Type', event.value, false);
    this.getFiltersAndLoadData(event.value);
    if (this.localStorageService.getSelectedProjectObject()) {
      this.selectedProject = this.localStorageService.getSelectedProjectObject();
      this.jobsiteData = this.localStorageService.getAllJobsite();
    }
    if (this.localStorageService.getSelectedJobsiteObject()) {
      this.selectedJobsite = this.localStorageService.getSelectedJobsiteObject();
    }

    this.projectJobSelectionService.postTypeSubject.next(event.value);

    if (event.value) {
      this.projectJobSelectionService.jobSwitchSubject.next();
    }
  }

  projectChanged(event): void {
    const project = event.value as ProjectDetail;
    this.setJobsites(project);

    if (this.localStorageService.getItem('addProjectDetail')) {
      const project1 = this.localStorageService.getItem('addProjectDetail');
      if (project1.id !== this.selectedProject.id) {
        this.selectedFilteredJobsite = null;
        this.filteredJobsite = [];
      }
      else {
        this.selectedFilteredJobsite = this.localStorageService.getItem('selectedJobsiteOfDropdown');
      }
    }
  }

  setJobsites(project: any): void {
    this.jobsiteData = [];
    const allLabelLocalStorageFlag = this.localStorageService.getItem('hideAllLabelsFromProjectJobsiteAndJob');
    if (allLabelLocalStorageFlag !== undefined || allLabelLocalStorageFlag !== null) {
      this.hideAllLabelsFromProjectJobsiteAndJob = this.localStorageService.getItem('hideAllLabelsFromProjectJobsiteAndJob');
    } else {
      this.hideAllLabelsFromProjectJobsiteAndJob = true;
    }
    this.selectedProject = project;
    this.localStorageService.setItem('selectedProject', project);
    if (this.selectedProject.id !== 'pid') {
      if (this.router.url === '/client/project-rating-review' && this.selectedProject.id !== 'pid') {
        this.jobsiteData = [];
        project.jobsite.forEach(data => {

          if (data.status === 'COMPLETED' || data.status === 'CANCELLED') {
            this.jobsiteData.push(data);
          }
        });
      } else {
        this.jobsiteData = [];
        this.jobsiteData = project.jobsite;
      }

    }
    if (this.jobsiteData.length) {
      if (this.hideAllLabelsFromProjectJobsiteAndJob) {
        if (!this.jobsiteData.some((item) => item.id === this.defaultJobsite.id)) {
          this.jobsiteData.unshift(this.defaultJobsite);
          this.localStorageService.setItem('selectedJobsite', this.defaultJobsite, false);
          this.selectedJobsite = this.defaultJobsite;
        }
      } else {
        const tempJobsiteData = this.jobsiteData;
        if (tempJobsiteData.length) {
          const index = tempJobsiteData.findIndex(x => x.id === this.defaultJobsite.id);
          if (!tempJobsiteData.some((item) => item.id === this.defaultJobsite.id) && this.hideAllLabelsFromProjectJobsiteAndJob) {
            tempJobsiteData.unshift(this.defaultJobsite);
          } else if (index > -1) {
            tempJobsiteData.shift();
          }
        }
        this.jobsiteData = [];
        this.jobsiteData = [...tempJobsiteData];

        this.selectedJobsite = this.jobsiteData[0];
        this.localStorageService.setItem('selectedJobsite', this.selectedJobsite);
      }
    }
    if (this.jobsiteData.length) {
      this.localStorageService.setItem('allJobsites', this.jobsiteData, false);
    }
    this.jobsiteSelected = false;
    if (project.id !== 'pid') {
      this.isProjectSelected = true;
    } else {
      this.isProjectSelected = false;
    }

    if (this.jobsiteData.length === 0) {
      this.localStorageService.removeItem('selectedJobsite');
    }

    this.setJobsiteForChatMessage();

    const selectedJobsite = this.localStorageService.getSelectedJobsiteObject();
    if (selectedJobsite) {
      if (this.jobsiteData.some((item) => item.id === selectedJobsite.id)) {
        this.selectedJobsite = selectedJobsite;
      }
      else {
        this.selectedJobsite = this.jobsiteData[0];
      }
      this.localStorageService.setItem('selectedJobsite', this.selectedJobsite, false);
    }

    this.projectJobSelectionService.selectedProjectSubject.next(this.selectedProject);
    this.projectJobSelectionService.selectedJobsiteSubject.next(this.selectedJobsite);

  }

  public setJobsiteForChatMessage(): void {
    if (this.jobsiteData) {
      if (this.jobsiteData.length && (this.router.url === '/client/chat-messages' || this.router.url === '/admin/project-question-and-answer' || this.router.url === '/client/question-answer')) {
        if (!this.jobsiteData.some((item) => item.id === this.defaultJobsite.id)) {
          this.jobsiteData.unshift(this.defaultJobsite);
          this.localStorageService.setItem('selectedJobsite', this.defaultJobsite, false);
          this.selectedJobsite = this.defaultJobsite;
        }
      }
    }
  }

  jobsiteChanged(event): void {
    this.selectedJobsite = event.value;
    this.localStorageService.setItem('selectedJobsite', this.selectedJobsite);
    if (event.value.id !== 'jid') {
      this.jobsiteSelected = true;
    } else {
      this.jobsiteSelected = false;
    }
    this.projectJobSelectionService.selectedJobsiteSubject.next(this.selectedJobsite);
  }

  jobChanged(event): void {
    this.selectedJobDetail = event.value;
    this.localStorageService.setItem('selectedJob', this.selectedJobDetail);
    if (event.value.id !== 'jobId') {
      this.jobSelected = true;
    } else {
      this.jobSelected = false;
    }
    this.projectJobSelectionService.selectedJobSubject.next(this.selectedJobDetail);
  }

  private prepareQueryParam(paramObject): URLSearchParams {
    const params = new URLSearchParams();
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  public getFiltersAndLoadData(value: string): void {

    if (this.hideAllLabelUrl.includes(this.router.url)) {
      this.localStorageService.setItem('hideAllLabelsFromProjectJobsiteAndJob', false);
    } else {
      this.localStorageService.setItem('hideAllLabelsFromProjectJobsiteAndJob', true);
    }

    if (this.localStorageService.getSelectedPostType()) {
      value = this.localStorageService.getSelectedPostType();
    }
    this.selectedType = value;
    this.filterMap.clear();
    if (this.router.url === '/client/project-rating-review') {
      this.loadDataForCompletedAndCancelledProject = true;
    }
    switch (value) {
      case PostType.Project: {
        this.loadDataForProject(this.defaultProject);
        break;
      }
      case PostType.JOB: {
        this.loadDataForJobDetail(this.defaultJob);
        break;
      }
      default: {
        this.projectData = [];
        this.jobData = [];
        break;
      }
    }
  }

  loadDataForProject(selectedProject: any, loadData?: boolean): void {
    const url = this.router.url;

    if (!isNullOrUndefined(this.localStorageService.getItem('hideAllLabelsFromProjectJobsiteAndJob'))) {
      this.hideAllLabelsFromProjectJobsiteAndJob = this.localStorageService.getItem('hideAllLabelsFromProjectJobsiteAndJob');
    } else {
      this.hideAllLabelsFromProjectJobsiteAndJob = true;
    }
    if (loadData === undefined) {
      if (this.projectAndJobsiteLoadUrl.includes(this.previousurl) && this.projectAndJobsiteLoadUrl.includes(url)) {
        this.hideShowAllLabelProject(url);
        return;
      }
    }
    if (
      (
        (this.projectAndJobsiteLoadUrl.includes(url) &&
          this.differentLoadProjectUrls.includes(this.previousurl))
        ||
        (this.differentLoadProjectUrls.includes(url) &&
          this.projectAndJobsiteLoadUrl.includes(this.previousurl))
      )
      && this.previousurl !== url
    ) {
      this.previousurl = '';
      this.projectData = [];
      this.jobsiteData = [];
      this.offsetForProject = 0;
    }

    // tslint:disable-next-line: max-line-length
    if (this.differentLoadProjectUrls.includes(url) && this.previousurl !== url) {
      this.previousurl = url;
      this.projectData = [];
      this.jobsiteData = [];
      this.offsetForProject = 0;
    }


    if (!this.doNotLoadProjectOrJobDataForURL.includes(url)) {
      this.tempProjectData = [];

      this.localStorageService.removeItem('allJobsites');
      this.filterMap.clear();
      if (this.localStorageService.getItem('filterProjectFilterMap')) {
        this.filterMap = new Map(JSON.parse(this.localStorageService.getItem('filterProjectFilterMap')));
      }
      const user = this.loggedInUser as User;
      if (user.roles[0].roleName !== 'ADMIN' && user.roles[0].roleName !== 'SUBADMIN') {

        if (user.roles[0].roleName === 'SUPERVISOR') {
          const clientOfLoggedInSupervisor = this.localStorageService.getItem('clientOfLoggedInSupervisor');
          this.filterMap.set('SUPERVISOR_ID', this.loggedInUserId);
          this.filterMap.set('USER_ID', clientOfLoggedInSupervisor.id);
        }
        else {
          this.filterMap.set('USER_ID', this.loggedInUserId);
        }

      }
      if (this.loadDataForCompletedAndCancelledProject) {
        this.filterMap.set('RAR_FOR_JOBSITE_CLIENT', this.localStorageService.getLoginUserId());
      }
      else if (this.router.url === '/admin/project-rating-review') {
        this.filterMap.set('RAR_FOR_JOBSITE_CLIENT', '');
      }
      else {
        if (user.roles[0].roleName !== 'ADMIN' && user.roles[0].roleName !== 'SUBADMIN') {
          this.filterMap.set('WITHOUT_CANCELLED', 'CANCELLED');
          this.filterMap.set('WITHOUT_COMPLETED', 'COMPLETED');
        }
        // this.filterMap.set('WITHOUT_COPIED', 'COPIED');
      }
      if (!isNullOrUndefined(this.localStorageService.getItem('hideAllLabelsFromProjectJobsiteAndJob'))) {
        this.hideAllLabelsFromProjectJobsiteAndJob = this.localStorageService.getItem('hideAllLabelsFromProjectJobsiteAndJob');
      } else {
        this.hideAllLabelsFromProjectJobsiteAndJob = true;
      }

      // accepted project /admin/set-project-margin

      if (url === '/admin/set-project-margin') {
        this.filterMap.clear();
        this.filterMap.set('ACCEPTED_PROJECT_FOR_ADMIN', 'AcceptedProjectForAdmin');
      }
      else if (this.router.url === '/client/bidComparision') {
        this.filterMap.set('STATUS', 'POSTED');
      }

      const jsonObject = {};
      // tslint:disable-next-line: no-shadowed-variable
      this.filterMap.forEach((value, key) => {
        jsonObject[key] = value;
      });
      this.globalFilter = JSON.stringify(jsonObject);
      this.datatableParam = {
        offset: this.offsetForProject,
        size: this.size,
        sortField: 'UPDATED_DATE',
        sortOrder: -1,
        searchText: this.globalFilter
      };

      if (this.localStorageService.getItem('filterProjectFilterMap')) {
        this.datatableParam = {
          offset: this.offsetForProjectFilter,
          size: this.size,
          sortField: this.sortFieldForProject ? this.sortFieldForProject : 'UPDATED_DATE',
          sortOrder: this.sortOrder ? this.sortOrder : -1,
          searchText: this.globalFilter
        };
      }

      this.queryParam = this.prepareQueryParam(this.datatableParam);

      this.projectService.getProjectByUserIdForSidebar(this.queryParam).subscribe(e => {        
        this.tempProjectData = e.data.result;
        if (this.tempProjectData) {
          this.tempProjectData.forEach(
            project => {
              if (!this.projectData.some((item) => item.id === project.id)) {
                this.projectData.push(project);
              }
            }
          );
          this.projectData = [...this.projectData];
        }
        this.totalRecordsOfProject = e.data.totalRecords;
        // tslint:disable-next-line: max-line-length
        if (this.projectData.length) {
          if (!this.projectData.some((item) => item.id === this.defaultProject.id) && this.hideAllLabelsFromProjectJobsiteAndJob) {
            this.projectData.unshift(this.defaultProject);
          } else if (this.projectData.includes(this.defaultProject) && this.hideAllLabelUrl.includes(url)) {
            const index = this.projectData.indexOf(this.defaultProject, 0);
            if (index > -1) {
              this.projectData.shift();
            }
          }
        }
        if (selectedProject && this.projectData.length) {
          if (selectedProject.id === 'pid' && this.localStorageService.getItem('selectedProject')) {
            const project = this.localStorageService.getSelectedProjectObject();
            const index = this.projectData.findIndex(x => x.id === project.id);
            if (index >= 0) {
              this.selectedProject = this.projectData[index];
              this.localStorageService.setItem('selectedProject', this.selectedProject);
              this.setJobsites(this.selectedProject);
            } else {
              this.selectedProject = this.projectData[0];
              this.localStorageService.setItem('selectedProject', this.selectedProject);
              this.setJobsites(this.selectedProject);
            }
            // tslint:disable-next-line: max-line-length
            if (this.router.url === '/client/project-rating-review' && this.projectData.length) {
              if (this.jobsiteData.length !== 0) {
                this.jobsiteData = [];
                this.projectData[index].jobsite.forEach(data => {

                  if (data.status === 'COMPLETED' || data.status === 'CANCELLED') {
                    this.jobsiteData.push(data);
                  }
                });
              }
            } else {
              if (index < 0) {
                const currentUrl = this.router.url;
                if (currentUrl === '/client/bidComparision' || currentUrl === '/client/question-answer') {
                  this.selectedProject = this.projectData[0];
                  this.jobsiteData = this.projectData[0].jobsite;
                  this.localStorageService.setItem('selectedProject', this.selectedProject);
                  this.projectJobSelectionService.selectedProjectSubject.next(this.selectedProject);
                }
              }
              else {
                this.jobsiteData = this.projectData[index].jobsite;
              }
            }
            if (this.jobsiteData?.length) {
              if (!this.jobsiteData.some((item) => item.id === this.defaultJobsite.id) && this.hideAllLabelsFromProjectJobsiteAndJob) {
                this.jobsiteData.unshift(this.defaultJobsite);
              }
            }
          } else {
            const index = this.projectData.findIndex(x => x.id === selectedProject.id);
            if (index >= 0) {
              this.selectedProject = this.projectData[index];

              this.jobsiteData = this.projectData[index].jobsite;
              this.localStorageService.setItem('selectedProject', this.selectedProject);
              this.projectJobSelectionService.selectedProjectSubject.next(this.selectedProject);

            } else {
              this.selectedProject = this.projectData[0];
              this.localStorageService.setItem('selectedProject', this.selectedProject);
              this.projectJobSelectionService.selectedProjectSubject.next(this.selectedProject);
              const project = this.projectData[index];
              if (project) {
                if (project.id !== 'pid') {
                  this.jobsiteData = this.projectData[index].jobsite;
                  this.selectedJobsite = this.projectData[index].jobsite[0];
                  this.localStorageService.setItem('selectedJobsite', this.selectedJobsite);
                }
              }
              else {
                this.localStorageService.setItem('selectedProject', this.defaultProject);
              }
            }
            if (this.jobsiteData) {
              if (this.jobsiteData.length) {
                if (!this.jobsiteData.some((item) => item.id === this.defaultJobsite.id) && this.hideAllLabelsFromProjectJobsiteAndJob) {
                  this.jobsiteData.unshift(this.defaultJobsite);
                }
              }
            }
          }
        }

        if (this.selectedProject) {
          if (this.selectedProject.id !== 'pid' && this.projectData.length) {
            this.selectedJobsite = this.selectedProject.jobsite[0];
            this.localStorageService.setItem('selectedJobsite', this.selectedJobsite);
            this.isProjectSelected = true;
          } else {
            this.isProjectSelected = false;
          }
        }
        this.setJobsiteForChatMessage();
      });
    }
  }

  private hideShowAllLabelProject = (url) => {
    const tempData = this.projectData;
    if (tempData.length) {
      if (!tempData.some((item) => item.id === this.defaultProject.id) && this.hideAllLabelsFromProjectJobsiteAndJob) {
        tempData.unshift(this.defaultProject);
      } else if (tempData.includes(this.defaultProject) && this.hideAllLabelUrl.includes(url)) {
        const index = tempData.indexOf(this.defaultProject, 0);
        if (index > -1) {
          tempData.shift();
        }
      }
    }
    this.projectData = [];
    this.projectData = [...tempData];

    if (this.projectData?.length) {
      const selectedProject = this.localStorageService.getSelectedProjectObject();
      if (selectedProject) {
        this.setJobsites(selectedProject);
      } else {
        this.setJobsites(this.projectData[0]);
      }
    }

    if (this.projectData.some((item) => item.id === this.selectedProject.id)) {
      const tempIndex = this.projectData.findIndex(x => x.id === this.selectedProject.id);
      this.selectedProject = this.projectData[tempIndex];
    }
  }

  clear(): any {
    this.localStorageService.removeItem('filterJobFilterMap');
    this.jobData = [];
    this.offsetForJob = 0;
    this.jobFilterFormGroup.reset();
    this.jobFilterFormGroup.get('jobTitle').patchValue(this.emptyArray);
    this.jobFilterFormGroup.get('employmentType').patchValue(this.emptyArray);
    this.jobFilterFormGroup.get('assignedTo').patchValue(this.emptyArray);
    this.jobFilterFormGroup.get('status').patchValue(this.emptyArray);
    this.loadDataForJobDetail(this.localStorageService.getSelectedJob(), true);

  }

  loadDataForJobDetail(selectedJob: any, loadData?: boolean): void {
    const currentUrl = this.router.url;

    if (!isNullOrUndefined(this.localStorageService.getItem('hideAllLabelsFromProjectJobsiteAndJob'))) {
      this.hideAllLabelsFromProjectJobsiteAndJob = this.localStorageService.getItem('hideAllLabelsFromProjectJobsiteAndJob');
    } else {
      this.hideAllLabelsFromProjectJobsiteAndJob = true;
    }

    if (loadData === undefined) {
      if (this.JobLoadUrl.includes(this.previousurl) && this.JobLoadUrl.includes(currentUrl)) {
        this.hideShowAllLabelJob(currentUrl);
        return;
      }

      if (this.invoiceAndTimesheetUrls.includes(this.previousurl) && this.invoiceAndTimesheetUrls.includes(currentUrl)) {
        this.hideShowAllLabelJob(currentUrl);
        return;
      }
    }

    if (
      (
        (this.JobLoadUrl.includes(currentUrl) &&
          (this.invoiceAndTimesheetUrls.includes(this.previousurl) || this.differentLoadJobUrls.includes(this.previousurl)))
        ||
        (this.invoiceAndTimesheetUrls.includes(currentUrl) &&
          this.JobLoadUrl.includes(this.previousurl) || this.differentLoadJobUrls.includes(this.previousurl))
        ||
        (this.differentLoadJobUrls.includes(currentUrl) &&
          this.JobLoadUrl.includes(this.previousurl) || this.invoiceAndTimesheetUrls.includes(this.previousurl)))
      && this.previousurl !== currentUrl
    ) {
      this.previousurl = '';
      this.jobData = [];
      this.offsetForJob = 0;
    }

    // tslint:disable-next-line: max-line-length
    if (this.differentLoadJobUrls.includes(currentUrl) && this.previousurl !== currentUrl) {
      this.previousurl = currentUrl;
      this.jobData = [];
      this.offsetForJob = 0;
    }
    // else if (
    //   (currentUrl === '/client/worker-comparison' || currentUrl === '/admin/worker-comparison') && this.previousurl !== currentUrl
    // ) {
    //   this.previousurl = currentUrl;
    //   this.jobData = [];
    //   this.offsetForJob = 0;
    // }

    if (!this.doNotLoadProjectOrJobDataForURL.includes(currentUrl)) {

      this.tempJobData = [];
      this.selectedJobDetail = null;

      this.filterMap.clear();
      this.statusForratingAndReview.length = 0;
      const user = this.localStorageService.getLoginUserObject() as User;
      if (this.localStorageService.getItem('filterJobFilterMap')) {
        this.filterMap = new Map(JSON.parse(this.localStorageService.getItem('filterJobFilterMap')));
      }
      if (user.roles[0].roleName !== 'ADMIN' && user.roles[0].roleName !== 'SUBADMIN') {
        if (user.roles[0].roleName === 'SUPERVISOR') {
          const clientOfLoggedInSupervisor = this.localStorageService.getItem('clientOfLoggedInSupervisor');
          this.filterMap.set('SUPERVISOR', this.loggedInUserId);
          this.filterMap.set('USER_ID', clientOfLoggedInSupervisor.id);
        }
        else {
          this.filterMap.set('USER_ID', this.loggedInUserId);
        }
      }
      if (this.loadDataForCompletedAndCancelledJobs || this.router.url === '/admin/rating-review') {
        this.selectedJobDetail = null;
        this.filterMap.set('STATUS', ['CANCELLED', 'COMPLETED'].toString());
      }
      else if (this.router.url === '/admin/timesheets' || this.router.url === '/admin/invoices') {
        this.filterMap.set('STATUS_ADMIN_TIMESHEET', '');
      }
      else if (currentUrl === '/client/worker-comparison' || currentUrl === '/admin/worker-comparison') {
        this.filterMap.set('STATUS', 'POSTED');
      }
      else {
        // condition for completed jobs for chat message
        if (this.router.url === PATH_CONSTANTS.CLIENT_CHAT_SCREEN) {
          this.filterMap.set('WITHOUT_CANCELLED', 'CANCELLED');
        } else {
          if (user.roles[0].roleName !== 'ADMIN' && user.roles[0].roleName !== 'SUBADMIN') {
            this.filterMap.set('WITHOUT_COMPLETED', 'COMPLETED');
            this.filterMap.set('WITHOUT_CANCELLED', 'CANCELLED');
          }
        }
      }

      if (this.router.url === '/admin/set-job-margin') {
        this.filterMap.clear();
        this.filterMap.set('GET_OFFERED_POSTED_JOB', 'offeredPostedJobForAdmin');
      }

      if (!isNullOrUndefined(this.localStorageService.getItem('hideAllLabelsFromProjectJobsiteAndJob'))) {
        this.hideAllLabelsFromProjectJobsiteAndJob = this.localStorageService.getItem('hideAllLabelsFromProjectJobsiteAndJob');
      } else {
        this.hideAllLabelsFromProjectJobsiteAndJob = true;
      }
      this.statusFilter.length = 0;
      this.title.length = 0;
      this.assignedTo.length = 0;
      const jsonObject = {};
      this.filterMap.forEach((value, key) => {
        jsonObject[key] = value;
      });
      this.globalFilter = JSON.stringify(jsonObject);
      if (this.localStorageService.getItem('filterJobFilterMap')) {
        this.datatableParam = {
          offset: this.offsetForJobFilter,
          size: this.size,
          sortField: this.sortField ? this.sortField : 'UPDATED_DATE',
          sortOrder: this.sortOrder ? this.sortOrder : -1,
          searchText: this.globalFilter
        };
      }
      else {
        this.datatableParam = {
          offset: this.offsetForJob,
          size: this.size,
          sortField: this.sortField,
          sortOrder: this.sortOrder,
          searchText: this.globalFilter
        };
      }
      this.queryParam = this.prepareQueryParam(this.datatableParam);
      this.jobService.getJobDetailListForSidebar(this.queryParam).subscribe(e => {

        this.tempJobData = e.data.result;
        if (this.tempJobData) {
          this.tempJobData.forEach(
            job => {
              if (!this.jobData.some((item) => item.id === job.id)) {
                this.jobData.push(job);
              }
            }
          );
          this.jobData = [...this.jobData];
        }
        this.totalRecordsOfJob = e.data.totalRecords;

        // tslint:disable-next-line: max-line-length
        if ((!this.jobData.some((item) => item.id === this.defaultJob.id)) && this.hideAllLabelsFromProjectJobsiteAndJob && this.jobData.length) {
          this.jobData.unshift(this.defaultJob);
        } else if (this.jobData.includes(this.defaultJob) && this.hideAllLabelUrl.includes(currentUrl)) {
          const index = this.jobData.indexOf(this.defaultJob, 0);
          if (index > -1) {
            this.jobData.shift();
          }
        }

        if (selectedJob?.id === 'jobId' && this.localStorageService.getSelectedJob() && this.jobData.length) {
          const job = this.localStorageService.getSelectedJob();
          const index = this.jobData.findIndex(x => x.id === job.id);
          if (index >= 0) {
            this.selectedJobDetail = this.jobData[index];
            this.localStorageService.setItem('selectedJob', this.selectedJobDetail);
            this.projectJobSelectionService.selectedJobSubject.next(this.selectedJobDetail);
          }
          else {
            this.selectedJobDetail = this.jobData[0];
            this.localStorageService.setItem('selectedJob', this.selectedJobDetail);
            this.projectJobSelectionService.selectedJobSubject.next(this.selectedJobDetail);
          }
        } else {
          const index = this.jobData.findIndex(x => x.id === selectedJob?.id);
          if (index >= 0) {
            this.selectedJobDetail = this.jobData[index];
          }
          else {
            this.selectedJobDetail = this.jobData[0];
          }
          if (this.jobData.length) {
            this.localStorageService.setItem('selectedJob', this.selectedJobDetail);
            this.projectJobSelectionService.selectedJobSubject.next(this.selectedJobDetail);
          }
        }
        if (this.router.url === '/client/worker-comparison' && this.jobData.length) {
          const job = this.localStorageService.getSelectedJob();
          const index = this.jobData.findIndex(x => x.id === job.id);
          if (index >= 0) {
            this.selectedJobDetail = this.jobData[index];
            this.localStorageService.setItem('selectedJob', this.selectedJobDetail);
            this.projectJobSelectionService.selectedJobSubject.next(this.selectedJobDetail);
          }
          else {
            this.selectedJobDetail = this.jobData[0];
            this.localStorageService.setItem('selectedJob', this.selectedJobDetail);
            this.projectJobSelectionService.selectedJobSubject.next(this.selectedJobDetail);
          }
        }
      });
      this.projectJobSelectionService.selectedJobSubject.next(this.selectedJobDetail);
    }

  }

  hideShowAllLabelJob = (url: any) => {
    let tempData = [];
    tempData = this.jobData;
    if (tempData.length) {
      if (!tempData.some((item) => item.id === this.defaultJob.id) && this.hideAllLabelsFromProjectJobsiteAndJob) {
        tempData.unshift(this.defaultJob);
      } else if (tempData.includes(this.defaultJob) && this.hideAllLabelUrl.includes(url)) {
        const index = tempData.indexOf(this.defaultJob, 0);
        if (index > -1) {
          tempData.shift();
        }
      }
    }
    this.jobData = [];
    this.jobData = [...tempData];

    if (this.jobData.some((item) => item.id === this.selectedJobDetail.id)) {
      const selectedJob = this.localStorageService.getItem('selectedJob');
      const index = this.jobData.findIndex(x => x.id === selectedJob.id);
      this.selectedJobDetail = this.jobData[index];
    }
  }


  filterJobTitle(event): void {
    const filtered: any[] = [];
    const query = event.query;

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.jobData.length; i++) {
      const job = this.jobData[i];
      if (job.title.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(job);
      }
    }

    this.filteredJobTitle = filtered;
    this.filteredJobTitle = this.filteredJobTitle.sort();

  }

  filterStatus(event): void {
    if (this.router.url === '/client/ratingAndReviewProject?type=JOBS') {
      this.status = [
        { label: 'Canceled', value: 'CANCELLED' },
        { label: 'Completed', value: 'COMPLETED' },
      ];
    } else if (this.localStorageService.getLoginUserObject().roles[0].roleName === 'ADMIN' ||
      this.localStorageService.getLoginUserObject().roles[0].roleName === 'SUBADMIN') {
      this.status = [
        { label: 'Cancelled', value: 'CANCELLED' },
        { label: 'Completed', value: 'COMPLETED' },
        { label: 'Draft', value: 'DRAFT' },
        { label: 'In Progress', value: 'IN_PROGRESS' },
        { label: 'Posted', value: 'POSTED' },
      ];
    }
    else {
      this.status = [
        { label: 'Accepted', value: 'ACCEPTED' },
        { label: 'Draft', value: 'DRAFT' },
        { label: 'Offered', value: 'OFFERED' },
        { label: 'Posted', value: 'POSTED' },
      ];
    }
    const filtered: any[] = [];
    const query = event.query;

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.status.length; i++) {
      const status = this.status[i];
      if (status.label.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(status);
      }
    }
    this.filteredStatus = filtered;
    this.filteredStatus = this.filteredStatus.sort();

  }

  filterEmployeType(event): void {
    const filtered: any[] = [];
    const query = event.query;

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.employeType.length; i++) {
      const employeType = this.employeType[i];
      if (employeType.label.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(employeType);
      }
    }

    this.filteredEmployeType = filtered;
    this.filteredEmployeType = this.filteredEmployeType.sort();

  }

  filterOrderByFields(event): void {
    const filtered: any[] = [];
    const query = event.query;

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.orderByFields.length; i++) {
      const fields = this.orderByFields[i];
      if (fields.label.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(fields);
      }
    }
    this.filteredOrderByFields = filtered;
    this.filteredOrderByFields = this.filteredOrderByFields.sort();

  }

  filterOrderBy(event): void {
    const filtered: any[] = [];
    const query = event.query;

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.orderBy.length; i++) {
      const orderBy = this.orderBy[i];
      if (orderBy.label.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(orderBy);
      }
    }

    this.filteredOrderBy = filtered;
    this.filteredOrderBy = this.filteredOrderBy.sort();

  }

  onAddNewJobsite(): void {
    if (this.localStorageService.getItem('milestoneScreen')) {
      this.localStorageService.removeItem('milestoneScreen');
    }
    this.localStorageService.removeItem('addLineItemScreen');
    this.localStorageService.setItem('addJobsiteScreen', 'addJobsite', false);
    this.postProjectService.jobsiteScreenChange.next('addJobsite');
  }

  onAddNewLineItem(): void {
    if (this.selectedFilteredJobsite !== null) {
      if (this.localStorageService.getItem('milestoneScreen')) {
        this.localStorageService.removeItem('milestoneScreen');
      }
      this.localStorageService.removeItem('addJobsiteScreen');
      this.localStorageService.setItem('addLineItemScreen', 'addLineItem', false);
      this.postProjectService.jobsiteScreenChange.next('addLineItem');
    }
    else {
      this.openErrorDialog();
    }
  }

  onAddMilestone(): void {
    if (this.selectedFilteredJobsite !== null) {
      this.localStorageService.removeItem('addJobsiteScreen');
      this.localStorageService.removeItem('addLineItemScreen');
      this.localStorageService.setItem('milestoneScreen', 'addMilestone', false);
      this.postProjectService.jobsiteScreenChange.next('addMilestone');
    }
    else {
      this.openErrorDialog();
    }
  }

  openErrorDialog(): void {
    let options = null;
    options = {
      title: 'Warning',
      message: 'Please select jobsite',
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
  }

  filterJobsiteForDropdown(event): void {
    const filtered: any[] = [];
    const query = event.query;

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.jobsiteData.length; i++) {
      const jobsite = this.jobsiteData[i];
      if (jobsite.title.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        if (jobsite.id !== 'jid') {
          filtered.push(jobsite);
        }
      }
    }

    if (this.localStorageService.getItem('addProjectDetail')) {
      const project = this.localStorageService.getItem('addProjectDetail');
      if (project.id === this.selectedProject.id) {
        this.filteredJobsite = filtered;
      }
      else {
        this.selectedFilteredJobsite = null;
        this.filteredJobsite = [];
      }
    }
    else {
      this.selectedFilteredJobsite = null;
      this.filteredJobsite = [];
    }
  }

  onSelectJobsite(event): void {
    this.localStorageService.setItem('selectedJobsiteOfDropdown', this.selectedFilteredJobsite);
    this.projectJobSelectionService.selectedJobsiteOfDropdown.next(event);
  }

  editProject(project: any): void {
    let isAllowToEdit;

    if (project) {
      this.projectbiddetail.validateProjectOrJobsiteBidded(project.id).subscribe(
        res => {
          isAllowToEdit = res.data;
          if (isAllowToEdit) {
            this.openWarningDialogForEditProject(project);
          } else {
            this.projectIsEditable(project);
          }
        }
      );
    }
  }

  viewProject(project){ 
    if(project.id !== 'pid'){
      this.router.navigate([PATH_CONSTANTS.CLIENT_PROJECT_DETAILS]);
    }
  }

  viewJobSite(jobsite){
    this.selectedJobsite = jobsite;
    this.localStorageService.setItem('selectedJobsite', this.selectedJobsite);
    this.projectJobSelectionService.selectedJobsiteSubject.next(this.selectedJobsite);
    this.router.navigate([PATH_CONSTANTS.CLIENT_JOBSITE_DETAILS]);
  }

  viewJob(job){
    this.router.navigate([PATH_CONSTANTS.VIEW_JOB_DETAILS]);
  }

  projectIsEditable(project) {

    this.updateProjectUpdatedDate(project);

    const projectDetail = project;
    this.localStorageService.removeItem('InvitedSubcontracor');
    this.localStorageService.removeItem('inviteSubcontractorFlage');
    this.localStorageService.setItem('isEditMode', true);
    this.selectedProject = projectDetail;
    this.localStorageService.setItem('selectedProject', projectDetail);
    if (this.localStorageService.getItem('addProjectDetail')) {
      this.openWarningDialogForPostProject(projectDetail);
    }
    else {
      const currentUrl = this.router.url;
      if (currentUrl === '/client/post-project') {
        this.localStorageService.setItem('editMode', true);
        this.setValueOfEditProject(projectDetail, 2270);
        this.postProjectService.editProject.next(projectDetail);
        this.localStorageService.setItem('jobsiteScreen', 'jobsiteListing');
        this.postProjectService.jobsiteScreenChange.next('jobsiteListing');
        this.localStorageService.setItem('currentProjectStep', 1);
        this.postProjectService.currentPostProjectStep.next(1);
        this.projectJobSelectionService.addJobsiteSubject.next(projectDetail);
        this.localStorageService.removeItem('editMode');
        if (this.router.url !== '/client/post-project') {
          this.router.navigate(['/client/post-project']);
        }
      }
      else {
        this.setValueOfEditProject(projectDetail, 2283);
        this.postProjectService.currentPostProjectStep.next(1);
        if (this.router.url !== '/client/post-project') {
          this.router.navigate(['/client/post-project']);
        }
      }
    }
  }
  private updateProjectUpdatedDate(project: any) {
    this.projectService.setUpdatedDateForProject(project.id).subscribe(
      res => {
        if (!res.data) {
          this.notificationService.error(this.translator.instant('common.error'), '');
        }
      },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      }
    );
  }

  private updateJobUpdatedDate(job: any) {
    this.jobDetailService.setUpdatedDateForJob(job.id).subscribe(
      res => {
        if (!res.data) {
          this.notificationService.error(this.translator.instant('common.error'), '');
        }
      },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      }
    );
  }

  checkIsJobBided(job) {
    this.jobDetailService.checkIsJobBided(job.id).subscribe(data => {
      if (data.data === false) {
        this.editJob(job);
      }
      else {
        this.openWarningDialogForEditJobForBiddedJob(job);
      }
    });

  }

  editJob(job: any): void {

    this.updateJobUpdatedDate(job);

    const currentUrl = this.router.url;
    this.localStorageService.setItem('selectedJob', job);
    this.localStorageService.setItem('editSelectedJob', job);
    const index = this.jobData.findIndex(x => x.id === this.localStorageService.getItem('selectedJob').id);
    this.selectedJobDetail = this.jobData[index];

    if (this.localStorageService.getItem('editJobId')) {
      if (currentUrl === '/client/post-job' || currentUrl === '/client/edit-job') {
        this.openWarningDialogForEditJob(job);
      } else {
        this.jobDetailService.editJobSubject.next(this.localStorageService.getItem('selectedJob'));
        this.router.navigate(['/client/edit-job']);
      }
    }
    else {
      this.jobDetailService.editJobSubject.next(this.localStorageService.getItem('selectedJob'));
      this.router.navigate(['/client/edit-job']);
    }

  }

  openWarningDialogForEditJob(job): void {
    let options = null;
    options = {
      title: 'Warning',
      message: 'You will lose unsaved data of currently opened job, are you sure you want to edit ' + job.title + '?',
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.localStorageService.removeItem('editJobId');
        this.jobDetailService.editJobSubject.next(job);
        this.projectJobSelectionService.addJobSubject.next(job);
        const currentUrl = this.router.url;
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl]);
        });
      }
    });
  }
  openWarningDialogForEditJobForBiddedJob(job): void {
    let options = null;
    options = {
      title: 'Warning',
      message: 'Job bidding is already started cannot update ' + job.title,
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
      }
    });
  }

  onClear(event) {
    this.localStorageService.removeItem('selectedJobsiteOfDropdown');
  }

  openWarningDialogForEditProject(project) {
    let options = null;
    options = {
      title: 'Warning',
      message: 'Project bidding is already started cannot update.',
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
    });
  }

  openWarningDialogForPostProject(project) {
    let options = null;
    options = {
      title: 'Warning',
      message: 'You will lose unsaved data of currently opened project, are you sure you want to edit ' + project.title + '?',
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.localStorageService.removeItem('addNewProjectFormValue');
        this.localStorageService.removeItem('selectedJobsiteOfDropdown');
        this.localStorageService.removeItem('Data0');
        this.localStorageService.removeItem('addProjectDetail');
        this.localStorageService.removeItem('jobsiteScreen');
        this.localStorageService.removeItem('currentProjectStep');
        this.localStorageService.removeItem('unselectedLineItem');
        this.localStorageService.removeItem('milestoneScreen');
        this.localStorageService.removeItem('addJobsiteScreen');
        this.localStorageService.removeItem('addLineItemScreen');
        this.localStorageService.setItem('editMode', true);
        this.setValueOfEditProject(project, 2427);
        this.postProjectService.editProject.next(project);
        this.localStorageService.setItem('jobsiteScreen', 'jobsiteListing');
        this.postProjectService.jobsiteScreenChange.next('jobsiteListing');
        this.localStorageService.setItem('currentProjectStep', 1);
        this.postProjectService.currentPostProjectStep.next(1);
        this.projectJobSelectionService.addJobsiteSubject.next(project);
        this.localStorageService.removeItem('editMode');
        this.router.navigate(['/client/post-project']);
      }
    });
  }


  setValueOfEditProject(projectDetail, line) {
    this.selectedFilteredJobsite = null;
    this.localStorageService.setItem('addProjectDetail', projectDetail);
    const form = {
      bidDueDate: projectDetail.bidDueDate,
      attachmentLink: projectDetail.attachmentLink,
      company: projectDetail.company,
      completionDate: projectDetail.completionDate,
      createdBy: projectDetail.createdBy,
      id: projectDetail.id,
      industry: projectDetail.industry,
      isNegotiable: projectDetail.isNegotiable,
      region: projectDetail.region,
      startDate: projectDetail.startDate,
      state: projectDetail.state,
      title: projectDetail.title,
      type: projectDetail.type,
      updatedBy: projectDetail.updatedBy
    };
    this.localStorageService.setItem('addNewProjectFormValue', form);
    this.projectToSetPlaceholder = this.localStorageService.getItem('addProjectDetail');
    this.postProjectService.addNewProject.next(projectDetail);
  }

  getFilteredProjectTitle(event) {
    const loggedInUser = this.localStorageService.getLoginUserObject();
    if (loggedInUser.roles[0].roleName === 'ADMIN') {
      this.projectTitleParams = {
        clientId: 'admin',
        name: event.query
      };
    }
    else {
      this.projectTitleParams = {
        clientId: this.loggedInUserId,
        name: event.query
      };
    }

    if (this.router.url === '/client/project-rating-review') {
      this.queryParam = this.prepareQueryParam(this.projectTitleParams);
      this.filterlLeftPanelService.getProjectTitleForClient(this.queryParam).subscribe(data => {

        this.filteredProjectTitles = data.data;
        this.filteredProjectTitles = this.filteredProjectTitles.sort();
      });
    }
    else if (this.router.url === '/admin/set-project-margin') {
      this.projectTitleParamsForSetMargin = {
        name: event.query
      };
      this.queryParam = this.prepareQueryParam(this.projectTitleParamsForSetMargin);
      this.filterlLeftPanelService.getProjectTitleForAdminForSetMargin(this.queryParam).subscribe(data => {

        this.filteredProjectTitles = data.data;
        this.filteredProjectTitles = this.filteredProjectTitles.sort();
      });
    }
    else if (this.router.url === '/client/bidComparision') {
      this.queryParam = this.prepareQueryParam(this.projectTitleParams);
      this.filterlLeftPanelService.getProjectTitleForClientWithoutCompletedAndCancelledAndDraft(this.queryParam).subscribe(data => {

        this.filteredProjectTitles = data.data;
        this.filteredProjectTitles = this.filteredProjectTitles.sort();
      });
    }
    else {
      this.queryParam = this.prepareQueryParam(this.projectTitleParams);
      this.filterlLeftPanelService.getProjectTitleForClientWithoutCompletedAndCancelled(this.queryParam).subscribe(data => {
        this.filteredProjectTitles = data.data;
        this.filteredProjectTitles = this.filteredProjectTitles.sort();
      });
    }

  }

  getFilteredClientForProject(event) {
    const loggedInUser = this.localStorageService.getLoginUserObject();
    if (loggedInUser.roles[0].roleName === 'ADMIN') {
      this.clientForProjectParams = {
        name: event.query
      };
    }
    else {
      this.clientForProjectParams = {
        name: event.query
      };
    }
    this.queryParam = this.prepareQueryParam(this.clientForProjectParams);
    this.filterlLeftPanelService.getAllCompanyNameForClient(this.queryParam).subscribe(data => {
      this.filteredClientForProject = data.data;
      this.filteredClientForProject = this.filteredClientForProject.sort();
    });
  }

  getFilteredStateForProject(event) {
    this.stateForProjectParams = {
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.stateForProjectParams);
    this.filterlLeftPanelService.getStateForProject(this.queryParam).subscribe(data => {
      this.filteredStateForProject = data.data;
      this.filteredStateForProject = this.filteredStateForProject.sort();
    });
  }

  getFilteredCityForProject(event) {
    this.cityForProjectParams = {
      name: event.query
    };

    this.queryParam = this.prepareQueryParam(this.cityForProjectParams);
    this.filterlLeftPanelService.getCityForProject(this.queryParam).subscribe(data => {
      this.filteredCityForProject = data.data;
      this.filteredCityForProject = this.filteredCityForProject.sort();
    });
  }

  getFilteredIndustryForProject(event) {
    const loggedInUser = this.localStorageService.getLoginUserObject();
    if (loggedInUser.roles[0].roleName === 'ADMIN') {
      this.industryForProjectParams = {
        name: event.query
      };
    }
    else {
      this.industryForProjectParams = {
        name: event.query
      };
    }
    this.queryParam = this.prepareQueryParam(this.industryForProjectParams);
    this.filterlLeftPanelService.getAllIndustryForClientByName(this.queryParam).subscribe(data => {
      this.filteredIndustryForProject = data.data;
      this.filteredIndustryForProject = this.filteredIndustryForProject.sort();

    });
  }

  getFilteredRegionForProject(event) {
    this.regionForProjectParams = {
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.regionForProjectParams);
    this.filterlLeftPanelService.getRegionForProject(this.queryParam).subscribe(data => {
      this.filteredRegionForProject = data.data;
      this.filteredRegionForProject = this.filteredRegionForProject.sort();
    });
  }

  filterOrderByFieldsForProject(event): void {
    const filtered: any[] = [];
    const query = event.query;
    for (let i = 0; i < this.orderByFieldsForProject.length; i++) {
      const fields = this.orderByFieldsForProject[i];
      if (fields.label.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(fields);
      }
    }
    this.filteredOrderByForProject = filtered;
    this.filteredOrderByForProject = this.filteredOrderByForProject.sort();
  }

  // jobsite filter...
  getFilteredJobsiteTitle(event) {
    const loggedInUser = this.localStorageService.getLoginUserObject();
    if (loggedInUser.roles[0].roleName === 'ADMIN') {
      this.jobsiteTitleParams = {
        clientId: 'admin',
        name: event.query
      };
    }
    else {
      this.jobsiteTitleParams = {
        clientId: this.loggedInUserId,
        name: event.query
      };
    }

    if (this.router.url === '/client/project-rating-review') {
      this.queryParam = this.prepareQueryParam(this.jobsiteTitleParams);
      this.filterlLeftPanelService.getJobsiteTitleForClient(this.queryParam).subscribe(data => {

        this.filteredjobsiteTitles = data.data;
        this.filteredjobsiteTitles = this.filteredjobsiteTitles.sort();
      });
    }
    else {
      this.queryParam = this.prepareQueryParam(this.jobsiteTitleParams);
      this.filterlLeftPanelService.getJobsiteTitleForClientWithoutCompletedCancelled(this.queryParam).subscribe(data => {
        this.filteredjobsiteTitles = data.data;
        this.filteredjobsiteTitles = this.filteredjobsiteTitles.sort();
      });
    }
  }

  getFilteredStateForJobsite(event) {
    this.stateForJobsiteParams = {
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.stateForJobsiteParams);
    this.filterlLeftPanelService.getStateForJobsite(this.queryParam).subscribe(data => {
      this.filteredStateForJobsite = data.data;
      this.filteredStateForJobsite = this.filteredStateForJobsite.sort();

    });
  }

  getFilteredCityForJobsite(event) {
    this.cityForJobsiteParams = {
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.cityForJobsiteParams);
    this.filterlLeftPanelService.getCityForJobsite(this.queryParam).subscribe(data => {
      this.filteredCityForJobsite = data.data;
      this.filteredCityForJobsite = this.filteredCityForJobsite.sort();
    });
  }

  filterStatusForJobsite(event): void {
    const filtered: any[] = [];
    if (this.router.url === '/client/project-rating-review') {
      this.statusForJobsite = [
        { label: 'Canceled', value: 'CANCELLED' },
        { label: 'Completed', value: 'COMPLETED' },
      ];
    }
    // tslint:disable-next-line: max-line-length
    if (this.localStorageService.getLoginUserObject().roles[0].roleName === 'ADMIN' || this.localStorageService.getLoginUserObject().roles[0].roleName === 'SUBADMIN') {
      this.statusForJobsite = [
        { label: 'Canceled', value: 'CANCELLED' },
        { label: 'Completed', value: 'COMPLETED' },
        { label: 'Draft', value: 'DRAFT' },
        { label: 'In Progress', value: 'IN_PROGRESS' },
        { label: 'Posted', value: 'POSTED' },
      ];
    }
    const query = event.query;
    for (const element of this.statusForJobsite) {
      if (element.label.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(element);
      }
    }
    this.filteredStatusForJobsite = filtered;
    this.filteredStatusForJobsite = this.filteredStatusForJobsite.sort();

  }

  getAddressFromAutocompleteMapsApi(event): void {
    if (event.get('NO_DATA_FOUND')) {
      this.jobsiteFilerFormGroup.get('autoComplete').setValue('');
      this.latitude = null;
      this.longitude = null;
    }
    else {

      this.jobsiteFilerFormGroup.get('autoComplete').setValue(event.get('ADDRESS'));
      if (event.get('LOCALITY')) {
        let cityArray = [];
        if (this.jobsiteFilerFormGroup.get('city').value) {
          cityArray = this.jobsiteFilerFormGroup.get('city').value;
        }
        if (!cityArray.includes(event.get('LOCALITY'))) {
          cityArray.push(event.get('LOCALITY'));
        }
        this.jobsiteFilerFormGroup.get('city').setValue(cityArray);
      }

      if (event.get('STATE')) {
        let stateArray = [];
        if (this.jobsiteFilerFormGroup.get('state').value) {
          stateArray = this.jobsiteFilerFormGroup.get('state').value;
        }
        if (!stateArray.includes(event.get('STATE'))) {
          stateArray.push(event.get('STATE'));
        }
        this.jobsiteFilerFormGroup.get('state').setValue(stateArray);
      }

      this.latitude = event.get('LATITUDE');
      this.longitude = event.get('LONGITUDE');
    }
  }

  getAddressForJobFromAutocompleteMapsApi(event): void {
    if (event.get('NO_DATA_FOUND')) {
      this.jobFilterFormGroup.get('autoComplete').setValue('');
    }
    else {
      this.jobFilterFormGroup.get('autoComplete').setValue(event.get('ADDRESS'));
    }
  }

  onShowJobsiteOverlay(event) {
    this.locationFlage = true;
  }
  onHideJobsiteOverlay(event) {
    this.locationFlage = false;
  }
  onLocationRadius(event): void {
    this.jobFilterFormGroup.get('miles').setValue(event.value);
  }

  getFullName(data: User) {
    return data.firstName + ' ' + data.lastName;
  }

}

