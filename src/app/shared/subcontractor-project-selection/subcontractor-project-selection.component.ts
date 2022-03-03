import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { JobsiteDetail } from 'src/app/module/client/Vos/jobsitemodel';
import { ProjectDetail } from 'src/app/module/client/Vos/projectDetailmodel';
import { ProjectFullDetail } from 'src/app/module/client/Vos/ProjectFullDetail';
import { SideBarEnumForSubContractor } from 'src/app/module/subcontractor/enums/subcontractorSidebarEnum';
import { JobsiteService } from 'src/app/service/client-services/post-project/jobsite.service';
import { ProjectDetailService } from 'src/app/service/client-services/project-detail.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { DateHelperService } from 'src/app/service/date-helper.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { isNullOrUndefined } from 'util';
import { COMMON_CONSTANTS } from '../CommonConstants';
import { UINotificationService } from '../notification/uinotification.service';
import { DataTableParam } from '../vo/DataTableParam';
import { User } from '../vo/User';

@Component({
  selector: 'app-subcontractor-project-selection',
  templateUrl: './subcontractor-project-selection.component.html',
  styleUrls: ['./subcontractor-project-selection.component.css']
})
export class SubcontractorProjectSelectionComponent implements OnInit, OnDestroy {

  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;

  // project filter
  projectTitleParams: { subcontractorId: any; name: any; };
  filteredProjectTitles = [];
  clientForProjectParams: { subcontractorId: any; name: any; };
  filteredClientForProject = [];
  industryForProjectParams: { subcontractorId: any; name: any; };
  stateForProjectParams: { name: any; };
  filteredStateForProject = [];
  filteredIndustryForProject = [];
  regionForProjectParams: { name: any; };
  filteredRegionForProject = [];
  filteredCityForProject = [];
  cityForProjectParams;
  filteredOrderByForProject: any[];
  filteredOrderBy: any[];
  client = [];
  stateArray = [];
  regionArray = [];
  industryType = [];
  title = [];
  postedBy = [];
  dateFlage = false;
  startDate: Date;
  endDate: Date;
  sortField = 'PROJECT_TITLE';
  jobsiteSortField = 'TITLE';
  sortOrder = -1;

  orderByFieldsForProject = [
    { label: 'Client Name', value: 'COMPANY_NAME' },
    { label: 'Project Title', value: 'PROJECT_TITLE' },
    { label: 'Project Post Date', value: 'UPDATED_DATE' },
    { label: 'Bid End Date', value: 'BID_DUE_DATE' }
  ];

  orderBy = [
    { label: 'Asc', value: '1' },
    { label: 'Desc', value: '-1' },
  ];


  allJobsiteStatus = [
    { label: 'Posted', value: 'POSTED' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'In Progress', value: 'IN_PROGRESS' }
  ];

  statusForJobsite = this.allJobsiteStatus;
  completedAndCanceledStatus = [{ label: 'Cancelled', value: 'CANCELED' },
  { label: 'Completed', value: 'COMPLETED' }];

  emptyArray: any[] = [];

  selectedProject: ProjectDetail;

  selectedFullProjectDetail: ProjectFullDetail;

  selectedJobsite: JobsiteDetail;

  subscription = new Subscription();

  datatableParam: DataTableParam;

  defaultProject = new ProjectFullDetail();

  defaultDummyProject = new ProjectDetail();

  defaultJobsite = new JobsiteDetail();

  queryParam;
  globalFilter;

  loggedInUserId;
  offset = 0;

  projectData: ProjectDetail[] = [];

  projectFullDetailData: ProjectFullDetail[] = [];

  jobsiteData: JobsiteDetail[] = [];

  hideAllLabelsFromProjectJobsiteAndJob = true;

  noJobsiteData = [
    { title: 'No Jobsite' }
  ];

  noselectedJobsiteModel = this.noJobsiteData[0];

  noProjectData = [
    { title: 'No Project' }
  ];
  noselectedProjectModel = this.noProjectData[0];

  projectFilterFormGroup: FormGroup;
  jobsiteFilterFormGroup: FormGroup;


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
  size = 10;
  postedByParam;
  filteredPostedForProject = [];


  // Selected Jobsite To Bid
  JobsitesToBid = [];

  // sideBarUrlSetOne = ['/subcontractor/dashboard', '/subcontractor/project-detail', '/subcontractor/jobsite-detail', '/subcontractor/payment-milestone'];

  sideBarUrlSetTwo = ['/subcontractor/bid-quotation', '/subcontractor/project-bid-review'];

  sideBarUrlSetThree = ['/subcontractor/select-jobsite', '/subcontractor/question-answer', '/subcontractor/question-answer-reply'];

  sideBarUrlSetFour = ['/subcontractor/rating-review'];

  sideBarUrlSetFive = ['/subcontractor/accept-project'];

  withoutAllLabelUrl = ['/subcontractor/question-answer', '/subcontractor/question-answer-reply', '/subcontractor/payment-milestone', '/subcontractor/jobsite-detail', '/subcontractor/accept-project', '/subcontractor/project-detail', '/subcontractor/select-jobsite', '/subcontractor/bid-quotation', '/subcontractor/chat-messages'];

  sideBarUrlSetforOfferedAndAccepted = ['/subcontractor/dashboard', '/subcontractor/project-detail', '/subcontractor/jobsite-detail', '/subcontractor/payment-milestone', '/subcontractor/change-request', '/subcontractor/closeout-packages', '/subcontractor/invoices', '/notification/bellNotification'];

  sideBarUrlSetforOfferedAndAcceptedAndApplied = ['/subcontractor/chat-messages'];

  // sideBarUrlSetforBiddedOfferedAndAccepted = ['/notification/bellNotification'];

  withIconsSideBarUrl = ['/subcontractor/select-jobsite', '/subcontractor/bid-quotation'];

  loadDataForCompletedAndCancelledProject = false;

  showIconsOnSidebar = false;

  sideBarUrlSetforProjectList = ['/subcontractor/project-list'];
  hideFilter = false;


  // tslint:disable-next-line: max-line-length
  constructor(
    private localStorageService: LocalStorageService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private projectService: ProjectDetailService,
    private jobsiteService: JobsiteService,
    private router: Router,
    private filterLeftPanelService: FilterLeftPanelDataService,
    private formBuilder: FormBuilder,
    private notificationService: UINotificationService,
    private dateHelperService: DateHelperService
  ) {
    const user = this.localStorageService.getLoginUserObject() as User;
    this.loggedInUserId = user.id;

    this.defaultDummyProject.title = 'All Projects';
    this.defaultDummyProject.id = 'pid';

    this.defaultProject.projectDetail = this.defaultDummyProject;

    this.defaultJobsite.title = 'All Jobsites';
    this.defaultJobsite.id = 'jid';

    router.events.pipe(filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.getSuggestedFilter(event.url);
    });
  }

  getSuggestedFilter(url: string): void {
    if (url !== '/login') {
      this.hideShowAllLabelDeciderMethod(url);
      this.showSideBarIcons(url);
      if (this.sideBarUrlSetTwo.includes(url)) {
        if (this.localStorageService.getSidebarSubcontractorFilterEnum()) {
          this.setProjectAndJobsiteForBidQuotation();
        } else {
          if (this.localStorageService.getSidebarSubcontractorFilterEnum() !== SideBarEnumForSubContractor.BID_QUOTATION) {
            this.setProjectAndJobsiteForBidQuotation();
          }
        }
      } else if (this.sideBarUrlSetThree.includes(url)) {
        if (this.localStorageService.getSidebarSubcontractorFilterEnum()
          !== SideBarEnumForSubContractor.BIDDED_FAVOURITE_GOT_INVITATIONS) {
          if (this.localStorageService.getItem('selectedFullProjectDetail')) {
            // tslint:disable-next-line: max-line-length
            this.loadDataForProject(this.localStorageService.getItem('selectedFullProjectDetail'), this.prepareDefaultCriteriasForBiddedAndGotInvitations());
          } else {
            this.loadDataForProject(this.defaultProject, this.prepareDefaultCriteriasForBiddedAndGotInvitations());
          }
        } else {
          this.loadDataForProject(this.defaultProject, this.prepareDefaultCriteriasForBiddedAndGotInvitations());
        }
      } else if (this.sideBarUrlSetFour.includes(url)) {
        if (this.localStorageService.getSidebarSubcontractorFilterEnum()
          !== SideBarEnumForSubContractor.RATING_AND_REVIEW) {
          if (this.localStorageService.getItem('selectedFullProjectDetail')) {
            // tslint:disable-next-line: max-line-length
            this.loadDataForProject(this.localStorageService.getItem('selectedFullProjectDetail'), this.prepareDefaultCriteriasForRatingAndReview());
          } else {
            this.loadDataForProject(this.defaultProject, this.prepareDefaultCriteriasForRatingAndReview());
          }
        } else {
          this.loadDataForProject(this.defaultProject, this.prepareDefaultCriteriasForRatingAndReview());
        }
      } else if (this.sideBarUrlSetFive.includes(url)) {
        if (this.localStorageService.getSidebarSubcontractorFilterEnum()
          !== SideBarEnumForSubContractor.ACCEPT_REJECT_PROJECT) {
          if (this.localStorageService.getItem('selectedFullProjectDetail')) {
            // tslint:disable-next-line: max-line-length
            this.loadDataForProject(this.defaultProject, this.prepareDefaultCriteriasForAcceptRejectProject());
          } else {
            this.loadDataForProject(this.defaultProject, this.prepareDefaultCriteriasForAcceptRejectProject());
          }
        } else {
          this.loadDataForProject(this.defaultProject, this.prepareDefaultCriteriasForAcceptRejectProject());
        }
      }
      else if (this.sideBarUrlSetforOfferedAndAccepted.includes(url)) {
        if (this.localStorageService.getSidebarSubcontractorFilterEnum()
          !== SideBarEnumForSubContractor.OFFERED_ACCEPTED) {
          if (this.localStorageService.getItem('selectedFullProjectDetail')) {
            // tslint:disable-next-line: max-line-length
            this.loadDataForProject(this.localStorageService.getItem('selectedFullProjectDetail'), this.prepareDefaultCriteriasForOfferedAndAccepted());
          } else {
            this.loadDataForProject(this.defaultProject, this.prepareDefaultCriteriasForOfferedAndAccepted());
          }
        } else {
          this.loadDataForProject(this.defaultProject, this.prepareDefaultCriteriasForOfferedAndAccepted());
        }
      } else if (this.sideBarUrlSetforOfferedAndAcceptedAndApplied.includes(url)) {
        if (this.localStorageService.getSidebarSubcontractorFilterEnum()
          !== SideBarEnumForSubContractor.OFFERD_ACCEPTED_APPLIED) {
          if (this.localStorageService.getItem('selectedFullProjectDetail')) {
            // tslint:disable-next-line: max-line-length
            this.loadDataForProject(this.localStorageService.getItem('selectedFullProjectDetail'), this.prepareDefaultCriteriasForOfferedAndAcceptedAndApplied());
          } else {
            this.loadDataForProject(this.defaultProject, this.prepareDefaultCriteriasForOfferedAndAcceptedAndApplied());
          }
        } else {
          this.loadDataForProject(this.defaultProject, this.prepareDefaultCriteriasForOfferedAndAcceptedAndApplied());
        }
      } else if (this.sideBarUrlSetforProjectList.includes(url)) {
        this.localStorageService.setSidebarSubcontractorFilterEnum(SideBarEnumForSubContractor.PROJECT_LIST);
      }
      else {
        // this.loadDataForProject(this.defaultProject, this.prepareDefaultCriterias());
      }
    }
  }

  prepareDefaultCriteriasForOfferedAndAcceptedAndApplied(): any {
    const filterMap = new Map();
    filterMap.set('OFFERD_ACCEPTED_APPLIED', this.loggedInUserId);
    filterMap.set('WITHOUT_CANCELLED', 'CANCELLED');
    filterMap.set('WITHOUT_COMPLETED', 'COMPLETED');
    this.localStorageService.setSidebarSubcontractorFilterEnum(SideBarEnumForSubContractor.OFFERD_ACCEPTED_APPLIED);
    return filterMap;
  }

  prepareDefaultCriteriasForOfferedAndAccepted(): any {
    const filterMap = new Map();
    filterMap.set('OFFERED_ACCEPTED', this.loggedInUserId);
    this.localStorageService.setSidebarSubcontractorFilterEnum(SideBarEnumForSubContractor.OFFERED_ACCEPTED);
    return filterMap;
  }

  prepareDefaultCriteriasForAcceptRejectProject(): any {
    const filterMap = new Map();
    filterMap.set('ACCEPT_REJECT_PROJECT', this.loggedInUserId);
    this.localStorageService.setSidebarSubcontractorFilterEnum(SideBarEnumForSubContractor.ACCEPT_REJECT_PROJECT);
    return filterMap;
  }

  setProjectAndJobsiteForBidQuotation(): void {
    this.localStorageService.setSidebarSubcontractorFilterEnum(SideBarEnumForSubContractor.BID_QUOTATION);
    const project = this.localStorageService.getItem('selectedFullProjectDetail');
    const jobsites = this.localStorageService.getSelectedJobsiteForBidQuotation();
    this.projectFullDetailData = [];
    this.projectFullDetailData.push(project);
    this.jobsiteData = jobsites;
    this.selectedJobsite = jobsites[0];
    this.selectedFullProjectDetail = project;
    this.localStorageService.setItem('selectedFullProjectDetail', this.selectedFullProjectDetail);
    this.localStorageService.setItem('selectedProject', this.selectedFullProjectDetail.projectDetail);
    this.localStorageService.setItem('selectedJobsite', this.selectedJobsite);
  }

  prepareDashboardCommonCriterias(): any {
    const filterMap = new Map();
    filterMap.set('COMMON', this.loggedInUserId);
    this.statusForJobsite = [];
    this.statusForJobsite = this.allJobsiteStatus;
    this.localStorageService.setSidebarSubcontractorFilterEnum(SideBarEnumForSubContractor.COMMON);
    return filterMap;
  }

  showSideBarIcons(url: string): void {
    if (this.withIconsSideBarUrl.includes(url)) {
      this.showIconsOnSidebar = true;
    }
    else {
      this.showIconsOnSidebar = false;
    }
    this.localStorageService.setItem('showIconsOnSidebar', this.showIconsOnSidebar);
  }

  hideShowAllLabelDeciderMethod(url: string): void {
    if (this.withoutAllLabelUrl.includes(url)) {
      this.hideAllLabelsFromProjectJobsiteAndJob = false;
    }
    else {
      this.hideAllLabelsFromProjectJobsiteAndJob = true;
    }
    this.localStorageService.setItem('hideAllLabelsFromProjectJobsiteAndJob', this.hideAllLabelsFromProjectJobsiteAndJob);
  }

  prepareDefaultCriteriasForRatingAndReview(): any {
    const filterMap = new Map();

    // filterMap.set('STATUS_IN', ['CANCELLED', 'COMPLETED'].toString());
    // filterMap.set('ASSIGNED_TO', this.localStorageService.getLoginUserId());
    filterMap.set('RAR_FOR_JOBSITE_SUBCONTRACTOR', this.localStorageService.getLoginUserId());

    this.statusForJobsite = [];
    this.statusForJobsite = this.completedAndCanceledStatus;

    this.localStorageService.setSidebarSubcontractorFilterEnum(SideBarEnumForSubContractor.RATING_AND_REVIEW);
    return filterMap;
  }

  prepareDefaultCriteriasForBiddedAndGotInvitations(): any {
    const filterMap = new Map();
    filterMap.set('BIDDED_FAVOURITE_GOT_INVITATIONS', this.loggedInUserId);
    this.statusForJobsite = [];
    this.statusForJobsite = this.allJobsiteStatus;
    this.localStorageService.setSidebarSubcontractorFilterEnum(SideBarEnumForSubContractor.BIDDED_FAVOURITE_GOT_INVITATIONS);
    return filterMap;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.getSuggestedFilter(this.router.url);
    this.initializeProjectFilterFormGroup();
    if (this.router.url === '/subcontractor/project-bid-review' || this.router.url === '/subcontractor/bid-quotation') {
      this.hideFilter = true;
    }
    else {
      this.hideFilter = false;
    }
    // Refresh jobsite For runtime for green tick
    this.subscription.add(this.projectJobSelectionService.refreshBidQuotatiionSideBarForJobsite.subscribe(e => {
      // alert('here ');
      // if (this.router.url === '/subcontractor/project-bid-review' || this.router.url === '/subcontractor/bid-quotation'){
      this.hideFilter = true;
      // }
      // else{
      //   this.hideFilter = false;
      // }
      // this.jobsiteData = [];
      this.jobsiteData = this.localStorageService.getSelectedJobsiteForBidQuotation();
      if (this.localStorageService.getSelectedJobsiteObject()) {
        let index = this.jobsiteData.findIndex(x => x.id === this.localStorageService.getSelectedJobsiteObject().id);
        if (index >= 0) {
          this.selectedJobsite = this.jobsiteData[index];
        }
      }
    }));
    this.projectJobSelectionService.refreshSidebarAfterAcceptRejectProject.subscribe(data => {
      this.refreshSideBarAfterAcceptRejectProject();
    });
  }

  public initializeProjectFilterFormGroup(): void {
    this.projectFilterFormGroup = this.formBuilder.group({
      projectTitle: [''],
      clientName: [''],
      industryType: [''],
      state: [''],
      region: [''],
      postedBetween: [''],
      fields: [''],
      orderBy: [''],
      postedBy: [null]
    });
  }

  public initializeJobsiteFilterFormGroup(): void {
    this.jobsiteFilterFormGroup = this.formBuilder.group({
      keyword: [''],
      jobsiteTitle: [''],
      city: null,
      state: null,
      zipcode: [''],
      status: [''],
      estimatedCostFrom: [0],
      estimatedCostTo: [0],
      autoComplete: ['']
    });
  }

  prepareDefaultCriterias(): any {
    const filterMap = new Map();
    filterMap.set('WITHOUT_CANCELLED', 'CANCELLED');
    filterMap.set('WITHOUT_COMPLETED', 'COMPLETED');
    filterMap.set('STATUS', 'POSTED');
    this.statusForJobsite = [];
    this.statusForJobsite = this.allJobsiteStatus;
    this.localStorageService.setSidebarSubcontractorFilterEnum(SideBarEnumForSubContractor.DUMMY);
    return filterMap;
  }

  prepareDefaultCriteriasForJobsite(): any {
    const filterMap = new Map();
    filterMap.set('PROJECT_ID', this.selectedProject.id);
    filterMap.set('WITHOUT_CANCELLED', 'CANCELLED');
    filterMap.set('WITHOUT_COMPLETED', 'COMPLETED');
    return filterMap;
  }

  prepareDefaultCriteriasForSelectedJobsiteToBid(): any {
    const filterMap = new Map();
    const jobsiteList = [];
    this.JobsitesToBid.forEach(jobsite => {
      jobsiteList.push(jobsite);
      filterMap.set('JOBSITE_ID', jobsiteList);
    });
    filterMap.set('WITHOUT_CANCELLED', 'CANCELLED');
    filterMap.set('WITHOUT_COMPLETED', 'COMPLETED');
    return filterMap;
  }

  loadDataForProject(selectedProject: any, filterMap: any): void {

    this.projectData = [];
    this.jobsiteData = [];
    this.projectFullDetailData = [];

    const jsonObject = {};
    this.initializeJobsiteFilterFormGroup();
    if (this.router.url === '/subcontractor/project-bid-review' || this.router.url === '/subcontractor/bid-quotation') {
      this.hideFilter = true;
    }
    else {
      this.hideFilter = false;
    }
    // tslint:disable-next-line: no-shadowed-variable
    if (filterMap === null) {
      filterMap = this.prepareDefaultCriterias();
      filterMap.forEach((value, key) => {
        jsonObject[key] = value;
      });
    }
    else {
      filterMap.forEach((value, key) => {
        jsonObject[key] = value;
      });
    }
    if (!isNullOrUndefined(this.localStorageService.getItem('hideAllLabelsFromProjectJobsiteAndJob'))) {
      this.hideAllLabelsFromProjectJobsiteAndJob = this.localStorageService.getItem('hideAllLabelsFromProjectJobsiteAndJob');
    } else {
      this.hideAllLabelsFromProjectJobsiteAndJob = true;
    }
    // this.projectData = [];
    this.globalFilter = JSON.stringify(jsonObject);

    this.datatableParam = {
      offset: this.offset,
      size: 10000,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.projectService.getProjectForSubContractor(this.queryParam).subscribe(e => {
      this.projectFullDetailData = e.data?.result as ProjectFullDetail[];

      this.projectFullDetailData.forEach(e =>
        this.projectData.push(e.projectDetail));
      // tslint:disable-next-line: max-line-length
      if (this.projectFullDetailData.length) {
        // tslint:disable-next-line: max-line-length
        if (!this.projectFullDetailData.some((item) => item.projectDetail.id === this.defaultProject.projectDetail.id) && this.hideAllLabelsFromProjectJobsiteAndJob) {
          this.projectFullDetailData.splice(0, 0, this.defaultProject);
        }
      }

      //In case no full project data available in list remove selected project and full project 
      if (this.projectFullDetailData.length === 0) {
        this.localStorageService.removeItem('selectedProject');
        this.localStorageService.removeItem('selectedJobsite');
        this.localStorageService.removeItem('selectedFullProjectDetail');
      }

      // tslint:disable-next-line: max-line-length
      if (selectedProject.projectDetail.id === 'pid' && this.localStorageService.getItem('selectedFullProjectDetail') && this.projectFullDetailData.length) {
        let project = this.localStorageService.getSelectedProjectObject();
        let index = this.projectFullDetailData.findIndex(x => x.projectDetail.id === project.id);
        if (index >= 0) {
          this.selectedFullProjectDetail = this.projectFullDetailData[index];
          this.selectedProject = this.selectedFullProjectDetail.projectDetail;
          this.localStorageService.setItem('selectedFullProjectDetail', this.selectedFullProjectDetail);
          this.localStorageService.setItem('selectedProject', this.selectedProject);
          this.projectJobSelectionService.selectedProjectSubject.next(this.selectedProject);
        }
        else {
          if (this.projectFullDetailData[0].id !== 'pid') {
            if (this.localStorageService.getItem('selectedFullProjectDetail')) {
              this.selectedFullProjectDetail = this.localStorageService.getItem('selectedFullProjectDetail');
              this.selectedProject = this.selectedFullProjectDetail.projectDetail;
              this.localStorageService.setItem('selectedFullProjectDetail', this.selectedFullProjectDetail);
              this.localStorageService.setItem('selectedProject', this.selectedProject);
              this.projectJobSelectionService.selectedProjectSubject.next(this.selectedProject);
            } else {
              this.selectedFullProjectDetail = this.projectFullDetailData[0];
              this.selectedProject = this.selectedFullProjectDetail.projectDetail;
              this.localStorageService.setItem('selectedFullProjectDetail', this.selectedFullProjectDetail);
              this.localStorageService.setItem('selectedProject', this.selectedProject);
              this.projectJobSelectionService.selectedProjectSubject.next(this.selectedProject);
            }
          }
        }

        // only cancelled and Completed jobsited For Rating and review
        if (this.router.url === '/subcontractor/rating-review') {
          this.projectFullDetailData[index].projectDetail.jobsite?.forEach(data => {

            if (data.status === 'COMPLETED' || data.status === 'CANCELLED') {
              this.jobsiteData.push(data);
            }
          });
        }
        else {
          if (this.selectedFullProjectDetail !== null || this.selectedFullProjectDetail !== undefined) {
            this.setJobsites(this.selectedFullProjectDetail.projectDetail);
          }
        }
        if (this.jobsiteData === null || this.jobsiteData === undefined) {
          this.jobsiteData = [];
        }
        if (this.jobsiteData.length) {
          if (!this.jobsiteData.some((item) => item.id === this.defaultJobsite.id) && this.hideAllLabelsFromProjectJobsiteAndJob) {
            this.jobsiteData.splice(0, 0, this.defaultJobsite);
          }
        }
      } else if (this.projectFullDetailData.length) {
        const index = this.projectFullDetailData.findIndex(x => x.projectDetail.id === selectedProject.id);
        if (index >= 0) {
          this.selectedFullProjectDetail = this.projectFullDetailData[index];
          this.selectedProject = this.selectedFullProjectDetail.projectDetail;
          if (this.router.url === '/subcontractor/rating-review') {
            this.projectFullDetailData[index].projectDetail.jobsite.forEach(data => {

              if (data.status === 'COMPLETED' || data.status === 'CANCELLED') {
                this.jobsiteData.push(data);
              }
            });
          }
          else {
            this.jobsiteData = this.selectedFullProjectDetail.projectDetail.jobsite;
          }
          this.localStorageService.setItem('selectedProject', this.selectedProject);
          this.localStorageService.setItem('selectedFullProjectDetail', this.selectedFullProjectDetail);
          this.projectJobSelectionService.selectedProjectSubject.next(this.selectedFullProjectDetail.projectDetail);
        } else {
          if (this.projectFullDetailData.length > 0) {
            if (this.router.url === '/subcontractor/select-jobsite') {
              if ((this.projectFullDetailData.some((item) => item.projectDetail.id !== 'pid')) &&
                !this.localStorageService.getItem('selectedFullProjectDetail')) {
                // tslint:disable-next-line: no-shadowed-variable
                const selectedProjectOfLocalStorage = this.localStorageService.getItem('selectedProject');
                this.projectFullDetailData.forEach(element => {
                  if (this.localStorageService.getItem('selectedProject')) {
                    if (element.projectDetail.id === selectedProjectOfLocalStorage.id) {
                      this.localStorageService.setItem('selectedFullProjectDetail', element);
                      this.selectedFullProjectDetail = element;
                      this.setJobsites(element.projectDetail);
                    }
                  } else if (this.localStorageService.getItem('viewMoreProjectDetail')) {
                    this.setViewMoreProjects();
                  }
                });
              } else if ((this.projectFullDetailData.some((item) => item.projectDetail.id !== 'pid')) &&
                this.localStorageService.getItem('selectedFullProjectDetail')) {
                const selectedFullProjectDetailForInvitedProject = this.localStorageService.getItem('selectedFullProjectDetail')
                this.setJobsites(selectedFullProjectDetailForInvitedProject.projectDetail);
              }
            } else if (this.localStorageService.getItem('selectedFullProjectDetail')) {
              this.selectedFullProjectDetail = this.localStorageService.getItem('selectedFullProjectDetail');
              this.selectedProject = this.selectedFullProjectDetail.projectDetail;
              this.localStorageService.setItem('selectedFullProjectDetail', this.selectedFullProjectDetail);
              this.localStorageService.setItem('selectedProject', this.selectedProject);
              this.projectJobSelectionService.selectedProjectSubject.next(this.selectedProject);
              this.jobsiteData = this.selectedFullProjectDetail.projectDetail.jobsite;
            } else {
              this.selectedFullProjectDetail = this.projectFullDetailData[0];
              this.selectedProject = this.selectedFullProjectDetail.projectDetail;
              this.localStorageService.setItem('selectedFullProjectDetail', this.selectedFullProjectDetail);
              this.localStorageService.setItem('selectedProject', this.selectedProject);
              this.jobsiteData = this.selectedFullProjectDetail.projectDetail.jobsite;
              this.projectJobSelectionService.selectedProjectSubject.next(this.selectedProject);
            }
          }
        }
        if (this.jobsiteData?.length) {
          if (!this.jobsiteData.some((item) => item.id === this.defaultJobsite.id) && this.hideAllLabelsFromProjectJobsiteAndJob) {
            this.jobsiteData.splice(0, 0, this.defaultJobsite);
          }
        }
      }

      if (this.projectFullDetailData.length > 0) {
        // tslint:disable-next-line: max-line-length
        if (this.selectedFullProjectDetail) {
          if (this.selectedFullProjectDetail.projectDetail.id !== 'pid' && this.localStorageService.getSelectedJobsiteObject()) {
            const jobsite = this.localStorageService.getSelectedJobsiteObject();
            if (this.jobsiteData.some((item) => item.id === jobsite.id)) {
              this.selectedJobsite = jobsite;
            }
            else {
              if (jobsite.length) {
                this.selectedJobsite = this.selectedProject.jobsite[0];
                this.localStorageService.setItem('selectedJobsite', this.selectedJobsite);
              } else {
                this.localStorageService.removeItem('selectedJobsite');
              }
            }
          }
        }
      }

      // Added Logic when No fullprojectDetail is available or no default project is selected
      if (this.projectFullDetailData.length) {

        if ((this.projectFullDetailData.some((item) => item.projectDetail.id !== 'pid')) &&
          !this.localStorageService.getItem('selectedFullProjectDetail')) {

          // tslint:disable-next-line: no-shadowed-variable
          this.projectFullDetailData.forEach(element => {
            if (this.localStorageService.getItem('viewMoreProjectDetail')) {
              this.setViewMoreProjects();
            } else if (this.localStorageService.getItem('selectedProject')) {
              const selectedProjectOfLocalStorage = this.localStorageService.getItem('selectedProject');
              if (element.projectDetail.id === selectedProjectOfLocalStorage.id) {
                this.localStorageService.setItem('selectedFullProjectDetail', element);
                this.selectedFullProjectDetail = element;
                this.setJobsites(element.projectDetail);
              }
            } else if (!this.localStorageService.getItem('selectedProject')) {
              this.selectedFullProjectDetail = this.projectFullDetailData[0];
              this.selectedProject = this.selectedFullProjectDetail.projectDetail;
              this.localStorageService.setItem('selectedFullProjectDetail', this.selectedFullProjectDetail);
              this.localStorageService.setItem('selectedProject', this.selectedProject);
              this.setJobsites(this.selectedFullProjectDetail.projectDetail);
            }
          });
        }
        else if ((this.projectFullDetailData.some((item) => item.projectDetail.id !== 'pid')) &&
          this.localStorageService.getItem('selectedFullProjectDetail') && !this.localStorageService.getItem('viewMoreProjectDetail')) {
          let projectTEmp = this.localStorageService.getItem('selectedFullProjectDetail');

          this.selectedFullProjectDetail = projectTEmp;
          const index = this.projectFullDetailData.findIndex(x => x.projectDetail.id === projectTEmp.projectDetail.id);
          if (index >= 0) {
            this.selectedFullProjectDetail = this.projectFullDetailData[index];
            this.localStorageService.setItem('selectedFullProjectDetail', this.selectedFullProjectDetail);
            this.localStorageService.setItem('selectedProject', this.selectedFullProjectDetail.projectDetail);
          } else {
            this.selectedFullProjectDetail = this.projectFullDetailData[0];
            this.localStorageService.setItem('selectedFullProjectDetail', this.selectedFullProjectDetail);
            this.localStorageService.setItem('selectedProject', this.selectedFullProjectDetail.projectDetail);
          }
        }
        else {
          this.setViewMoreProjects();
        }
      } else {
        if (this.router.url === '/subcontractor/select-jobsite') {
          // in case if View More is available from session storage
          this.setViewMoreProjects();
        }
      }
      if (this.router.url === '/subcontractor/accept-project') {
        this.jobsiteData = [];
        if (this.projectFullDetailData.length) {

          if (this.projectFullDetailData.some(item => item.projectDetail.id === this.selectedProject.id)) {
            const index = this.projectFullDetailData.findIndex(x => x.projectDetail.id === this.selectedProject.id);
            if (index >= 0) {
              this.selectedFullProjectDetail = this.projectFullDetailData[index];
              this.localStorageService.setItem('selectedFullProjectDetail', this.selectedFullProjectDetail);
              this.localStorageService.setItem('selectedProject', this.selectedFullProjectDetail.projectDetail);
            } else {
              this.selectedFullProjectDetail = this.projectFullDetailData[0];
              this.localStorageService.setItem('selectedFullProjectDetail', this.selectedFullProjectDetail);
              this.localStorageService.setItem('selectedProject', this.selectedFullProjectDetail.projectDetail);
            }
          } else {
            this.selectedFullProjectDetail = this.projectFullDetailData[0];
            this.localStorageService.setItem('selectedFullProjectDetail', this.selectedFullProjectDetail);
            this.localStorageService.setItem('selectedProject', this.selectedFullProjectDetail.projectDetail);
          }
          this.setJobsites(this.selectedFullProjectDetail.projectDetail);
        }

      }

      if (this.router.url === '/subcontractor/chat-messages') {
        if (this.projectFullDetailData.length) {
          if (this.projectFullDetailData.some(item => item.projectDetail.id === this.selectedProject.id)) {
            const index = this.projectFullDetailData.findIndex(x => x.projectDetail.id === this.selectedProject.id);
            if (index >= 0) {
              this.selectedFullProjectDetail = this.projectFullDetailData[index];
              this.localStorageService.setItem('selectedFullProjectDetail', this.selectedFullProjectDetail);
              this.localStorageService.setItem('selectedProject', this.selectedFullProjectDetail.projectDetail);
            } else {
              this.selectedFullProjectDetail = this.projectFullDetailData[0];
              this.localStorageService.setItem('selectedFullProjectDetail', this.selectedFullProjectDetail);
              this.localStorageService.setItem('selectedProject', this.selectedFullProjectDetail.projectDetail);
            }
          } else {
            this.selectedFullProjectDetail = this.projectFullDetailData[0];
            this.localStorageService.setItem('selectedFullProjectDetail', this.selectedFullProjectDetail);
            this.localStorageService.setItem('selectedProject', this.selectedFullProjectDetail.projectDetail);
          }
        }
        this.setJobsiteForChatMessage();
      }

      // In case if any component fails to get project from session
      this.projectJobSelectionService.selectedProjectSubject.next(this.selectedProject);
      if (this.projectFullDetailData?.length === 0) {
        this.projectJobSelectionService.selectedJobsiteSubject.next(this.defaultJobsite);
      }
      if (this.router.url === '/subcontractor/rating-review') {
        this.jobsiteData = [];
        if (this.projectFullDetailData.some(item => item.projectDetail.id === this.selectedProject.id)) {
          const index = this.projectFullDetailData.findIndex(x => x.projectDetail.id === this.selectedProject.id);
          if (index >= 0) {
            this.selectedFullProjectDetail = this.projectFullDetailData[index];
            this.localStorageService.setItem('selectedFullProjectDetail', this.selectedFullProjectDetail);
            this.localStorageService.setItem('selectedProject', this.selectedFullProjectDetail.projectDetail);
          } else {
            this.selectedFullProjectDetail = this.projectFullDetailData[0];
            this.localStorageService.setItem('selectedFullProjectDetail', this.selectedFullProjectDetail);
            this.localStorageService.setItem('selectedProject', this.selectedFullProjectDetail.projectDetail);
          }
        } else {
          this.localStorageService.removeItem('selectedFullProjectDetail');
          this.localStorageService.removeItem('selectedProject');
          this.selectedFullProjectDetail = this.projectFullDetailData[0];
          this.localStorageService.setItem('selectedFullProjectDetail', this.selectedFullProjectDetail);
          this.localStorageService.setItem('selectedProject', this.selectedFullProjectDetail.projectDetail);
        }
        this.setJobsites(this.selectedFullProjectDetail.projectDetail);

      }

      if (this.router.url === '/subcontractor/dashboard') {
        this.selectedFullProjectDetail = this.defaultProject;
        this.jobsiteData = [];
      }

      if (this.router.url === '/subcontractor/project-detail' && this.projectFullDetailData.length) {
        this.jobsiteData = [];
        if (this.projectFullDetailData.some(item => item.projectDetail.id === this.selectedProject.id)) {
          const index = this.projectFullDetailData.findIndex(x => x.projectDetail.id === this.selectedProject.id);
          if (index >= 0) {
            this.selectedFullProjectDetail = this.projectFullDetailData[index];
            this.localStorageService.setItem('selectedFullProjectDetail', this.selectedFullProjectDetail);
            this.localStorageService.setItem('selectedProject', this.selectedFullProjectDetail.projectDetail);
          } else {
            this.selectedFullProjectDetail = this.projectFullDetailData[0];
            this.localStorageService.setItem('selectedFullProjectDetail', this.selectedFullProjectDetail);
            this.localStorageService.setItem('selectedProject', this.selectedFullProjectDetail.projectDetail);
          }
        } else {
          this.localStorageService.removeItem('selectedFullProjectDetail');
          this.localStorageService.removeItem('selectedProject');
          this.selectedFullProjectDetail = this.projectFullDetailData[0];
          this.localStorageService.setItem('selectedFullProjectDetail', this.selectedFullProjectDetail);
          this.localStorageService.setItem('selectedProject', this.selectedFullProjectDetail.projectDetail);
        }
        this.setJobsites(this.selectedFullProjectDetail.projectDetail);
      }
      if (this.router.url === '/subcontractor/jobsite-detail' && this.projectFullDetailData.length) {
        this.jobsiteData = [];
        if (this.projectFullDetailData.some(item => item.projectDetail.id === this.selectedProject.id)) {
          const index = this.projectFullDetailData.findIndex(x => x.projectDetail.id === this.selectedProject.id);
          if (index >= 0) {
            this.selectedFullProjectDetail = this.projectFullDetailData[index];
            this.localStorageService.setItem('selectedFullProjectDetail', this.selectedFullProjectDetail);
            this.localStorageService.setItem('selectedProject', this.selectedFullProjectDetail.projectDetail);
          } else {
            this.selectedFullProjectDetail = this.projectFullDetailData[0];
            this.localStorageService.setItem('selectedFullProjectDetail', this.selectedFullProjectDetail);
            this.localStorageService.setItem('selectedProject', this.selectedFullProjectDetail.projectDetail);
          }
        } else {
          this.localStorageService.removeItem('selectedFullProjectDetail');
          this.localStorageService.removeItem('selectedProject');
          this.selectedFullProjectDetail = this.projectFullDetailData[0];
          this.localStorageService.setItem('selectedFullProjectDetail', this.selectedFullProjectDetail);
          this.localStorageService.setItem('selectedProject', this.selectedFullProjectDetail.projectDetail);
        }
        this.setJobsites(this.selectedFullProjectDetail.projectDetail);
      }

    });
  }

  public setJobsiteForChatMessage(): void {
    if (this.jobsiteData.length && (this.router.url === '/subcontractor/chat-messages' || this.router.url === '/subcontractor/question-answer-reply')) {
      if (!this.jobsiteData.some((item) => item.id === this.defaultJobsite.id)) {
        this.jobsiteData.splice(0, 0, this.defaultJobsite);
        this.localStorageService.setItem('selectedJobsite', this.defaultJobsite, false);
        this.selectedJobsite = this.defaultJobsite;
      }
    }
  }

  setViewMoreProjects(): void {
    if (this.localStorageService.getItem('viewMoreProjectDetail')) {
      const project = this.localStorageService.getItem('viewMoreProjectDetail');
      const viewMoreProjectObject = new ProjectFullDetail();

      viewMoreProjectObject.projectDetail = project;
      let temp: any = {
        'projectDetail': viewMoreProjectObject.projectDetail,
        'bidStatus': null,
        'hasMarkedAsFavourite': false,
        'inviteeStatus': null
      };
      let i;

      if (this.projectFullDetailData.some(item => item.projectDetail.id === temp.projectDetail.id)) {
        // if project is already in the list
      }
      else {
        // if project is not in the list
        this.projectFullDetailData.push(temp);
        this.projectFullDetailData.forEach((element, index) => {
          if (element.projectDetail.id === temp.projectDetail.id) {
            i = index;
          }
        });
        this.selectedFullProjectDetail = this.projectFullDetailData[i];
        this.localStorageService.setItem('selectedFullProjectDetail', this.selectedFullProjectDetail);
        this.projectJobSelectionService.selectedProjectSubject.next(this.selectedFullProjectDetail);
        this.setJobsites(viewMoreProjectObject.projectDetail);
      }

    } else {
      const index = this.projectFullDetailData.findIndex(x => x.projectDetail.id === this.selectedFullProjectDetail.projectDetail.id);
      if (index >= 0) {
        this.selectedFullProjectDetail = this.projectFullDetailData[index];
        this.localStorageService.setItem('selectedFullProjectDetail', this.selectedFullProjectDetail);
        this.localStorageService.setItem('selectedProject', this.selectedFullProjectDetail.projectDetail);
        this.projectJobSelectionService.selectedProjectSubject.next(this.selectedFullProjectDetail.projectDetail);
      } else {
        if (this.projectFullDetailData.length) {
          this.selectedFullProjectDetail = this.projectFullDetailData[0];
          this.localStorageService.setItem('selectedFullProjectDetail', this.selectedFullProjectDetail);
          this.localStorageService.setItem('selectedProject', this.selectedFullProjectDetail.projectDetail);
          this.projectJobSelectionService.selectedProjectSubject.next(this.selectedFullProjectDetail.projectDetail);
        }
      }
    }

  }

  loadDataForJobsite(selectedJobsite: any, filterMap: any): void {
    this.jobsiteData = [];
    const jsonObject = {};
    if (filterMap === null) {
      filterMap = this.prepareDefaultCriteriasForJobsite();
      filterMap.forEach((value, key) => {
        jsonObject[key] = value;
      });
    } else {
      filterMap.forEach((value, key) => {
        jsonObject[key] = value;
      });
    }
    if (!isNullOrUndefined(this.localStorageService.getItem('hideAllLabelsFromProjectJobsiteAndJob'))) {
      this.hideAllLabelsFromProjectJobsiteAndJob = this.localStorageService.getItem('hideAllLabelsFromProjectJobsiteAndJob');
    } else {
      this.hideAllLabelsFromProjectJobsiteAndJob = true;
    }
    this.globalFilter = JSON.stringify(jsonObject);

    this.datatableParam = {
      offset: this.offset,
      size: 10000,
      sortField: this.jobsiteSortField,
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };

    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.jobsiteService.getAllJobsiteList(this.queryParam).subscribe(e => {

      this.jobsiteData = e.data.result;
      filterMap.clear();
      if (this.jobsiteData.length) {
        if (!this.jobsiteData.some((item) => item.id === this.defaultJobsite.id) && this.hideAllLabelsFromProjectJobsiteAndJob) {
          this.jobsiteData.splice(0, 0, this.defaultJobsite);
        }
      }

      if (selectedJobsite.id === 'jid' && this.localStorageService.getItem('selectedJobsite')) {
        let jobsite = this.localStorageService.getSelectedJobsiteObject();
        let index = this.jobsiteData.findIndex(x => x.id === jobsite.id);
        this.selectedJobsite = this.jobsiteData[index];
        if (this.jobsiteData.length) {
          if (!this.jobsiteData.some((item) => item.id === this.defaultJobsite.id) && this.hideAllLabelsFromProjectJobsiteAndJob) {
            this.jobsiteData.splice(0, 0, this.defaultJobsite);
          }
        }
      } else {
        const index = this.jobsiteData.findIndex(x => x.id === selectedJobsite.id);
        if (index >= 0) {
          this.selectedJobsite = this.jobsiteData[index];
          this.localStorageService.setItem('selectedJobsite', this.selectedJobsite);
        } else {
          this.selectedJobsite = this.jobsiteData[0];
        }
        if (this.jobsiteData.length) {
          if (!this.jobsiteData.some((item) => item.id === this.defaultJobsite.id) && this.hideAllLabelsFromProjectJobsiteAndJob) {
            this.jobsiteData.splice(0, 0, this.defaultJobsite);
          }
        }
      }
    });
  }

  projectChanged(event): void {
    const project = event.value as ProjectFullDetail;
    this.localStorageService.setItem('selectedFullProjectDetail', project);
    this.setJobsites(project.projectDetail);
  }

  setJobsites(project: any): void {
    this.jobsiteData = [];
    if (this.localStorageService.getItem('hideAllLabelsFromProjectJobsiteAndJob')) {
      this.hideAllLabelsFromProjectJobsiteAndJob = this.localStorageService.getItem('hideAllLabelsFromProjectJobsiteAndJob');
    } else {
      this.hideShowAllLabelDeciderMethod(this.router.url);
    }
    this.selectedProject = project;
    this.localStorageService.setItem('selectedProject', this.selectedProject, false);
    if (this.selectedProject.id !== 'pid') {
      if (this.router.url === '/subcontractor/rating-review') {
        project.jobsite.forEach(data => {

          if (data.status === 'COMPLETED' || data.status === 'CANCELLED') {
            this.jobsiteData.push(data);
          }
        });
      }
      else {
        this.jobsiteData = project.jobsite;
      }
    }
    if (this.jobsiteData.length) {
      if (!this.jobsiteData.some((item) => item.id === this.defaultJobsite.id) && this.hideAllLabelsFromProjectJobsiteAndJob) {
        this.jobsiteData.splice(0, 0, this.defaultJobsite);
        this.localStorageService.setItem('selectedJobsite', this.defaultJobsite);
        this.selectedJobsite = this.defaultJobsite;
      }
    }
    if (this.jobsiteData.length) {
      const url = this.router.url;
      this.localStorageService.setItem('allJobsites', this.jobsiteData, false);
      if (this.localStorageService.getSelectedJobsiteObject()) {
        let jobsite1 = this.localStorageService.getSelectedJobsiteObject();
        if (this.jobsiteData.some((jobsite) => jobsite.id === jobsite1.id)) {
          this.selectedJobsite = this.localStorageService.getSelectedJobsiteObject();
        }
        else {
          if (this.withoutAllLabelUrl.includes(url)) {
            this.selectedJobsite = this.jobsiteData[0];
          }
          else {
            this.selectedJobsite = this.defaultJobsite;
          }
        }
      } else if (this.withoutAllLabelUrl.includes(url)) {
        this.selectedJobsite = this.jobsiteData[0];
      } else {
        this.selectedJobsite = this.defaultJobsite;
      }
      if (this.jobsiteData.length) {
        this.localStorageService.setItem('selectedJobsite', this.selectedJobsite, false);
      }
    } else {
      this.localStorageService.setItem('selectedJobsite', this.defaultJobsite);
      this.selectedJobsite = this.defaultJobsite;
    }

    this.setJobsiteForChatMessage();

    if (this.jobsiteData.length) {
      let jobsite = this.localStorageService.getSelectedJobsiteObject();
      let index = this.jobsiteData.findIndex(x => x.id === jobsite.id);
      this.selectedJobsite = this.jobsiteData[index];
      this.localStorageService.setItem('selectedJobsite', this.selectedJobsite);
    }

    this.projectJobSelectionService.selectedProjectSubject.next(this.selectedProject);
    // }
    this.projectJobSelectionService.selectedJobsiteSubject.next(this.selectedJobsite);
  }

  jobsiteChanged(event): void {
    this.selectedJobsite = event.value;
    this.localStorageService.setItem('selectedJobsite', this.selectedJobsite, false);
    this.projectJobSelectionService.selectedJobsiteSubject.next(this.selectedJobsite);
  }

  private prepareQueryParam(paramObject): URLSearchParams {
    const params = new URLSearchParams();
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }


  clearProject(): any {
    // this.filterMap.clear()
    this.projectFilterFormGroup.reset();
    this.projectFilterFormGroup.get('projectTitle').patchValue(this.emptyArray);
    this.projectFilterFormGroup.get('clientName').patchValue(this.emptyArray);
    this.projectFilterFormGroup.get('state').patchValue(this.emptyArray);
    this.projectFilterFormGroup.get('region').patchValue(this.emptyArray);
    this.projectFilterFormGroup.get('industryType').patchValue(this.emptyArray);
    this.onProjectFilter();
  }

  onProjectFilter(): void {
    if (!isNullOrUndefined(this.localStorageService.getItem('hideAllLabelsFromProjectJobsiteAndJob'))) {
      this.hideAllLabelsFromProjectJobsiteAndJob = this.localStorageService.getItem('hideAllLabelsFromProjectJobsiteAndJob');
    } else {
      this.hideAllLabelsFromProjectJobsiteAndJob = true;
    }
    this.projectData = [];
    this.postedBy = [];
    this.client.length = 0;
    this.title.length = 0;
    this.regionArray.length = 0;
    this.stateArray.length = 0;
    this.industryType.length = 0;
    this.dateFlage = false;


    const filterMap = new Map();

    if (this.projectFilterFormGroup.value.projectTitle) {
      this.projectFilterFormGroup.value.projectTitle.forEach(element => {
        this.title.push(element);
        filterMap.set('PROJECT_TITLE', this.title.toString());
      });
    }

    if (this.projectFilterFormGroup.value.clientName) {
      this.projectFilterFormGroup.value.clientName.forEach(element => {
        this.client.push(element);
        filterMap.set('COMPANY_NAME', this.client.toString());
      });
    }

    if (this.projectFilterFormGroup.value.postedBy) {
      this.projectFilterFormGroup.value.postedBy.forEach(element => {
        this.postedBy.push(element.id);
        filterMap.set('USER_ID', this.postedBy.toString());
      });
    }

    if (this.projectFilterFormGroup.value.industryType) {
      this.projectFilterFormGroup.value.industryType.forEach(element => {
        this.industryType.push(element);
        filterMap.set('INDUSTRY_NAME', this.industryType.toString());
      });
    }

    if (this.projectFilterFormGroup.value.state) {
      this.projectFilterFormGroup.value.state.forEach(element => {
        this.stateArray.push(element);
        filterMap.set('STATE_NAME', this.stateArray.toString());
      });
    }

    if (this.projectFilterFormGroup.value.region) {
      this.projectFilterFormGroup.value.region.forEach(element => {
        this.regionArray.push(element);
        filterMap.set('REGION_NAME', this.regionArray.toString());
      });
    }

    if (this.projectFilterFormGroup.value.postedBetween) {
      this.startDate = this.projectFilterFormGroup.value.postedBetween[0];
      this.dateHelperService.setStartDate(this.startDate);
      const datePipe = new DatePipe('en-US');
      const value = datePipe.transform(this.startDate, 'yyyy-MM-dd HH:mm:ss');
      filterMap.set('POSTED_DATE_ONE', value);
      this.endDate = this.projectFilterFormGroup.value.postedBetween[1];
      if (this.endDate) {
        this.dateHelperService.setEndDate(this.endDate);
        const datePipe = new DatePipe('en-US');
        const value = datePipe.transform(this.endDate, 'yyyy-MM-dd HH:mm:ss');
        filterMap.set('POSTED_DATE_TWO', value);
      } else {
        this.dateFlage = true;
        this.notificationService.error('Enter appropriate dateRange', '');
      }
    }

    let sidebarEnum = this.localStorageService.getSidebarSubcontractorFilterEnum();

    if (sidebarEnum) {
      switch (sidebarEnum) {
        case 5:
          let defaultCriteria = this.prepareDefaultCriteriasForAcceptRejectProject();
          defaultCriteria.forEach((value: any, key: any) => {

            filterMap.set(key, value);
          });
          break;
        case 0:
          let defaultCriteria2 = this.prepareDashboardCommonCriterias();
          defaultCriteria2.forEach((value: any, key: any) => {

            filterMap.set(key, value);
          });
          break;
        case 3:
          let defaultCriteria3 = this.prepareDefaultCriterias();
          defaultCriteria3.forEach((value: any, key: any) => {

            filterMap.set(key, value);
          });
          break;
        case 8:
          let defaultCriteria4 = this.prepareDefaultCriteriasForOfferedAndAcceptedAndApplied();
          defaultCriteria4.forEach((value: any, key: any) => {

            filterMap.set(key, value);
          });
          break;
        case 6:
          let defaultCriteria5 = this.prepareDefaultCriteriasForOfferedAndAccepted();
          defaultCriteria5.forEach((value: any, key: any) => {

            filterMap.set(key, value);
          });
          break;
        case 1:
          let defaultCriteria7 = this.prepareDefaultCriteriasForBiddedAndGotInvitations();
          defaultCriteria7.forEach((value: any, key: any) => {

            filterMap.set(key, value);
          });
          break;
        case 2:
          let defaultCriteria6 = this.prepareDefaultCriteriasForRatingAndReview();
          defaultCriteria6.forEach((value: any, key: any) => {

            filterMap.set(key, value);
          });
          break;
        default:
          break;
      }
    }

    if (this.projectFilterFormGroup.value.fields) {
      this.sortField = this.projectFilterFormGroup.value.fields.value;
    }
    if (this.projectFilterFormGroup.value.orderBy) {
      this.sortOrder = this.projectFilterFormGroup.value.orderBy.value;
    }


    const project = this.localStorageService.getSelectedProjectObject();
    if (!this.projectData.some((item) => item.id === project.id)) {
      this.loadDataForProject(this.defaultProject, filterMap);
    }
    else {
      this.loadDataForProject(project, filterMap);
    }

  }

  onJobsiteFilter(): void {
    this.jobsiteData = [];
    this.jobsiteTitle.length = 0;
    this.cityArrayJobsite.length = 0;
    this.stateArrayJobsite.length = 0;
    this.statusFilterForJobsite.length = 0;
    this.costFlage = false;


    this.hideAllLabelsFromProjectJobsiteAndJob = this.localStorageService.getItem('hideAllLabelsFromProjectJobsiteAndJob');

    const filterMap = new Map();

    filterMap.set('PROJECT_ID', this.selectedProject.id);

    filterMap.set('WITHOUT_CANCELLED', 'CANCELLED');
    filterMap.set('WITHOUT_COMPLETED', 'COMPLETED');

    if (this.jobsiteFilterFormGroup.value.keyword) {
      this.jobsiteKeyword = this.jobsiteFilterFormGroup.value.keyword;
      filterMap.set('KEYWORD', this.jobsiteKeyword);
    }

    if (this.jobsiteFilterFormGroup.value.jobsiteTitle) {
      this.jobsiteFilterFormGroup.value.jobsiteTitle.forEach(element => {
        this.jobsiteTitle.push(element);
        filterMap.set('TITLE', this.jobsiteTitle.toString());
      });
    }

    if (this.jobsiteFilterFormGroup.value.state) {
      this.jobsiteFilterFormGroup.value.state.forEach(element => {
        this.stateArrayJobsite.push(element);
        filterMap.set('STATE', this.stateArrayJobsite.toString());
      });
    }
    if (this.jobsiteFilterFormGroup.value.city) {
      this.jobsiteFilterFormGroup.value.city.forEach(element => {
        this.cityArrayJobsite.push(element);
        filterMap.set('CITY', this.cityArrayJobsite.toString());
      });
    }
    if (this.jobsiteFilterFormGroup.value.zipcode) {
      this.jobsitezipcode = this.jobsiteFilterFormGroup.value.zipcode;
      filterMap.set('ZIP_CODE', this.jobsitezipcode);
    }

    if (this.jobsiteFilterFormGroup.value.status) {
      this.jobsiteFilterFormGroup.value.status.forEach(element => {
        this.statusFilterForJobsite.push(element.value);
        filterMap.set('STATUS', this.statusFilterForJobsite.toString());
      });
    }

    const cost = this.jobsiteFilterFormGroup.value.estimatedCostTo - this.jobsiteFilterFormGroup.value.estimatedCostFrom;

    if (cost >= 0) {
      if (cost !== 0) {
        filterMap.set('GREATER_THAN_COST', this.jobsiteFilterFormGroup.value.estimatedCostFrom);
        filterMap.set('LESS_THAN_COST', this.jobsiteFilterFormGroup.value.estimatedCostTo);
      }
    }
    else {
      this.costFlage = true;
      this.notificationService.error('Enter appropriate cost', '');
    }

    if (this.latitude !== null && this.longitude !== null) {
      filterMap.set('MILES', 100);
      filterMap.set('LATITUDE', this.latitude);
      filterMap.set('LONGITUDE', this.longitude);
    }


    const jobsite = this.localStorageService.getSelectedJobsiteObject();
    if (!this.jobsiteData.some((item) => item.id === jobsite.id)) {
      this.loadDataForJobsite(this.defaultJobsite, filterMap);
    }
    else {
      this.loadDataForJobsite(jobsite, filterMap);
    }
  }


  public filterJobsite(): void {

    this.jobsiteFilterFormGroup.markAllAsTouched();

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

    if (this.jobsiteFilterFormGroup.value.keyword) {
      this.jobsiteKeyword = this.jobsiteFilterFormGroup.value.keyword;
      this.filterMapOfJobsite.set('KEYWORD', this.jobsiteKeyword);
    }
    if (this.jobsiteFilterFormGroup.value.jobsiteTitle) {
      this.jobsiteFilterFormGroup.value.jobsiteTitle.forEach(element => {
        this.jobsiteTitle.push(element);
        this.filterMapOfJobsite.set('TITLE', this.jobsiteTitle.toString());
      });
    }
    if (this.jobsiteFilterFormGroup.value.state) {
      this.jobsiteFilterFormGroup.value.state.forEach(element => {
        this.stateArrayJobsite.push(element);
        this.filterMapOfJobsite.set('STATE', this.stateArrayJobsite.toString());
      });
    }
    if (this.jobsiteFilterFormGroup.value.city) {
      this.jobsiteFilterFormGroup.value.city.forEach(element => {
        this.cityArrayJobsite.push(element);
        this.filterMapOfJobsite.set('CITY', this.cityArrayJobsite.toString());
      });
    }
    if (this.jobsiteFilterFormGroup.value.zipcode) {
      this.jobsitezipcode = this.jobsiteFilterFormGroup.value.zipcode;
      this.filterMapOfJobsite.set('ZIP_CODE', this.jobsitezipcode);
    }

    if (this.jobsiteFilterFormGroup.value.status) {
      this.jobsiteFilterFormGroup.value.status.forEach(element => {
        this.statusFilterForJobsite.push(element.value);
        this.filterMapOfJobsite.set('STATUS', this.statusFilterForJobsite.toString());
      });
    }

    const cost = this.jobsiteFilterFormGroup.value.estimatedCostTo - this.jobsiteFilterFormGroup.value.estimatedCostFrom;

    if (cost >= 0) {
      if (cost !== 0) {
        this.filterMapOfJobsite.set('GREATER_THAN_COST', this.jobsiteFilterFormGroup.value.estimatedCostFrom);
        this.filterMapOfJobsite.set('LESS_THAN_COST', this.jobsiteFilterFormGroup.value.estimatedCostTo);
      }
    }
    else {
      this.costFlage = true;
      this.notificationService.error('Enter appropriate cost', '');
    }

    if (this.latitude !== null && this.longitude !== null) {
      this.filterMapOfJobsite.set('MILES', 100);
      this.filterMapOfJobsite.set('LATITUDE', this.latitude);
      this.filterMapOfJobsite.set('LONGITUDE', this.longitude);
    }

    this.filterMapOfJobsite.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilterOfJobsite = JSON.stringify(jsonObject);
    this.datatableParamofJobsite = {
      offset: this.offset,
      size: this.size,
      sortField: 'CREATED_DATE',
      sortOrder: 0,
      searchText: this.globalFilterOfJobsite
    };

    this.queryParam = this.prepareQueryParam(this.datatableParamofJobsite);
    if (!this.costFlage) {
      this.jobsiteService.getAllJobsite(this.queryParam).subscribe(e => {

        if (e.totalRecord !== 0) {
          this.jobsiteData = e.result;
          this.filterMapOfJobsite.clear();
          if (!this.jobsiteData.some((item) => item.id === this.defaultJobsite.id) && this.hideAllLabelsFromProjectJobsiteAndJob) {
            this.jobsiteData.splice(0, 0, this.defaultJobsite);
          }
        }
      },
        error => {

        });
    }
    else {
    }

  }

  clearJobsite(): any {
    this.latitude = null;
    this.longitude = null;
    this.jobsiteFilterFormGroup.reset();
    this.jobsiteFilterFormGroup.get('jobsiteTitle').patchValue(this.emptyArray);
    // this.jobsiteFilterFormGroup.get('state').patchValue(this.emptyArray);
    // this.jobsiteFilterFormGroup.get('city').patchValue(this.emptyArray);
    this.jobsiteFilterFormGroup.get('status').patchValue(this.emptyArray);
    this.locationFlage = false;
    // this.filterJobsite();
    this.loadDataForJobsite(this.defaultJobsite, this.prepareDefaultCriteriasForJobsite());
  }

  getProjectTitle(event): void {
    this.projectTitleParams = {
      subcontractorId: this.loggedInUserId,
      name: event.query
    };
    const currentUrl = this.router.url;
    if (this.sideBarUrlSetThree.includes(currentUrl)) {
      this.queryParam = this.prepareQueryParam(this.projectTitleParams);
      this.filterLeftPanelService.getProjectTitlesForSubcontractorForBidedFavAndGotInvitations(this.queryParam).subscribe(data => {
        this.filteredProjectTitles = data.data;
      });
    }
    else if (this.sideBarUrlSetFour.includes(currentUrl)) {
      this.queryParam = this.prepareQueryParam(this.projectTitleParams);
      this.filterLeftPanelService.getProjectTitlesForSubcontractorForCompletedCancelled(this.queryParam).subscribe(data => {
        this.filteredProjectTitles = data.data;
      });
    }
    else if (this.sideBarUrlSetFive.includes(currentUrl)) {
      this.queryParam = this.prepareQueryParam(this.projectTitleParams);
      this.filterLeftPanelService.getProjectTitlesForSubcontractorForAcceptReject(this.queryParam).subscribe(data => {
        this.filteredProjectTitles = data.data;
      });
    }
    else if (this.sideBarUrlSetforOfferedAndAccepted.includes(currentUrl)) {
      this.queryParam = this.prepareQueryParam(this.projectTitleParams);
      this.filterLeftPanelService.getProjectTitlesForSubcontractorForOfferedAccepted(this.queryParam).subscribe(data => {
        this.filteredProjectTitles = data.data;
      });
    }
    else if (this.sideBarUrlSetforOfferedAndAcceptedAndApplied.includes(currentUrl)) {
      this.queryParam = this.prepareQueryParam(this.projectTitleParams);
      this.filterLeftPanelService.getProjectTitlesForSubcontractorForOfferedAcceptedApplied(this.queryParam).subscribe(data => {
        this.filteredProjectTitles = data.data;
      });
    }
    else {
      this.queryParam = this.prepareQueryParam(this.projectTitleParams);
      this.filterLeftPanelService.getProjectTitleForSubcontractor(this.queryParam).subscribe(data => {
        this.filteredProjectTitles = data.data;
      });
    }
  }

  getFilteredClientForProject(event): void {
    this.clientForProjectParams = {
      subcontractorId: this.loggedInUserId,
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.clientForProjectParams);
    this.filterLeftPanelService.getClientForProjectBySubcontractor(this.queryParam).subscribe(data => {
      this.filteredClientForProject = data.data;
    });
  }

  getFilteredIndustryForProject(event): void {
    this.industryForProjectParams = {
      subcontractorId: this.loggedInUserId,
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.industryForProjectParams);
    this.filterLeftPanelService.getIndustryForProjectBySubcontractor(this.queryParam).subscribe(data => {
      this.filteredIndustryForProject = data.data;
    });

  }

  getFilteredPostedByForProject(event): void {
    this.postedByParam = {
      subcontractorId: this.loggedInUserId,
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.postedByParam);
    this.filterLeftPanelService.getpostedByForProject(this.queryParam).subscribe(data => {

      this.filteredPostedForProject = data.data;
    });
  }

  getFilteredRegionForProject(event): void {

    this.regionForProjectParams = {
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.regionForProjectParams);
    this.filterLeftPanelService.getRegionForProject(this.queryParam).subscribe(data => {
      this.filteredRegionForProject = data.data;
    });
  }

  getFilteredStateForProject(event): void {
    this.stateForProjectParams = {
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.stateForProjectParams);
    this.filterLeftPanelService.getStateForProject(this.queryParam).subscribe(data => {
      this.filteredStateForProject = data.data;
    });
  }

  getFilteredCityForProject(event): void {
    this.cityForProjectParams = {
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.cityForProjectParams);
    this.filterLeftPanelService.getCityForProject(this.queryParam).subscribe(data => {
      this.filteredCityForProject = data.data;
    });
  }

  filterOrderByFieldsForProject(event): void {
    const filtered: any[] = [];
    const query = event.query;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.orderByFieldsForProject.length; i++) {
      const fields = this.orderByFieldsForProject[i];
      if (fields.label.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(fields);
      }
    }
    this.filteredOrderByForProject = filtered;
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
  }

  // jobsite filter...
  getFilteredJobsiteTitle(event?): void {
    this.jobsiteTitleParams = {
      name: event.query,
      subcontractorId: this.loggedInUserId
    };
    this.queryParam = this.prepareQueryParam(this.jobsiteTitleParams);
    this.filterLeftPanelService.getJobsiteTitleForSubcontractor(this.queryParam).subscribe(data => {
      this.filteredjobsiteTitles = data.data;
    });
  }

  getFilteredStateForJobsite(event): void {
    this.stateForJobsiteParams = {
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.stateForJobsiteParams);
    this.filterLeftPanelService.getStateForJobsite(this.queryParam).subscribe(data => {
      this.filteredStateForJobsite = data.data;
    });
  }

  getFilteredCityForJobsite(event) {
    this.cityForJobsiteParams = {
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.cityForJobsiteParams);
    this.filterLeftPanelService.getCityForJobsite(this.queryParam).subscribe(data => {
      this.filteredCityForJobsite = data.data;
    });
  }

  filterStatusForJobsite(event): void {
    const filtered: any[] = [];
    if (this.router.url === '/subcontractor/rating-review') {
      this.statusForJobsite = [
        { label: 'Completed', value: 'COMPLETED' },
        { label: 'Canceled', value: 'CANCELED' },
      ];
    }
    const query = event.query;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.statusForJobsite.length; i++) {
      const fields = this.statusForJobsite[i];
      if (fields.label.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(fields);
      }
    }
    this.filteredStatusForJobsite = filtered;
  }

  getAddressFromAutocompleteMapsApi(event): void {

    if (event.get('NO_DATA_FOUND')) {

      this.jobsiteFilterFormGroup.get('autoComplete').setValue('');
      this.latitude = null;
      this.longitude = null;
    }
    else {

      this.jobsiteFilterFormGroup.get('autoComplete').setValue(event.get('ADDRESS'));

      if (event.get('LOCALITY')) {
        let cityArray = [];
        if (this.jobsiteFilterFormGroup.get('city').value) {
          cityArray = this.jobsiteFilterFormGroup.get('city').value;
        }
        if (!cityArray.includes(event.get('LOCALITY'))) {
          cityArray.push(event.get('LOCALITY'));
        }
        this.jobsiteFilterFormGroup.get('city').setValue(cityArray);
      }

      if (event.get('STATE')) {
        let stateArray = [];
        if (this.jobsiteFilterFormGroup.get('state').value) {
          stateArray = this.jobsiteFilterFormGroup.get('state').value;
        }
        if (!stateArray.includes(event.get('STATE'))) {
          stateArray.push(event.get('STATE'));
        }
        this.jobsiteFilterFormGroup.get('state').setValue(stateArray);
      }
      this.latitude = event.get('LATITUDE');
      this.longitude = event.get('LONGITUDE');
    }
  }

  refreshSideBarAfterAcceptRejectProject(): void {
    if (this.sideBarUrlSetFive.includes(this.router.url)) {
      this.loadDataForProject(this.defaultProject, this.prepareDefaultCriteriasForAcceptRejectProject());
    }
  }
  getFullName(data: User) {
    // 
    return data.firstName + ' ' + data.lastName;
  }
}
