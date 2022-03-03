import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { JobDetails } from 'src/app/module/client/post-job/job-details';
import { SideBarEnumForWorker } from 'src/app/module/worker/enums/sideBarEnumForWorker';
import { JobDetailService } from 'src/app/service/client-services/job-detail/job-detail.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { PATH_CONSTANTS } from '../PathConstants';
import { DataTableParam } from '../vo/DataTableParam';
import { User } from '../vo/User';
import { WorkerSidebarJobListService } from '../worker-sidebar-job-list.service';

@Component({
  selector: 'app-worker-sidebar-job-list',
  templateUrl: './worker-sidebar-job-list.component.html',
  styleUrls: ['./worker-sidebar-job-list.component.css']
})
export class WorkerSidebarJobListComponent implements OnInit {

  offset = 0;

  noJobData = [
    { title: 'No Job' }
  ];

  noselectedJobModel = this.noJobData[0];

  jobData: JobDetails[];

  selectedJobDetail: JobDetails;

  sortOrder = -1;
  size = 100000;

  queryParam;

  datatableParam: DataTableParam;

  globalFilter;

  jobFilterFormGroup: FormGroup;
  cityParams: { name: any; };
  filteredCityForJob = [];
  stateParams: { name: any; };
  filteredStateForJob = [];
  regionParams: { name: any; };
  filteredRegionForJob = [];
  clients = [];
  clientNameParams: { name: any; };
  jobTitleParams: { workerId: any; name: any; };
  jobTitles = [];
  loggedInUserId: any;
  emptyArray: any[] = [];
  employeType = [
    { label: 'Temporary Worker - 1099', value: 'WORKER_1099' },
    { label: 'Temporary Worker - W2', value: 'WORKER_W2' },
    { label: 'Full-time Employee', value: 'FULL_TIME' },
  ];
  filteredEmployeType: any[];
  filterMap = new Map();
  title = [];
  postedByList = [];
  employementType: any;
  cityFilter = [];
  stateFilter = [];
  regionFilter = [];

  sideBarUrlSetOne = ['/worker/dashboard', '/worker/worker-job-details', '/worker/view-reimbursements', '/worker/invoices', '/worker/timesheet', '/worker/invoice', '/notification/bellNotification'];

  sideBarUrlSetTwo = ['/worker/accept-job'];

  sideBarUrlSetThree = ['/worker/apply-for-job'];

  sideBarUrlSetFour = ['/worker/rating-review'];
  sideBarUrlSetFive = ['/worker/chat-messages'];
  allLabelUrls = ['/worker/view-reimbursements', '/worker/invoices', '/worker/rating-review', '/notification/bellNotification', '/worker/timesheet'];
  acceptedJobFlag = false;
  defaultJob = new JobDetails();

  constructor(
    private workerSideBarJobListService: WorkerSidebarJobListService,
    private jobDetailService: JobDetailService,
    private formBuilder: FormBuilder,
    private router: Router,
    private filterlLeftPanelService: FilterLeftPanelDataService,
    private localStorageService: LocalStorageService,
    private translator: TranslateService,
    private confirmDialogService: ConfirmDialogueService) {
    this.loggedInUserId = this.localStorageService.getLoginUserId();
    this.datatableParam = new DataTableParam();
    this.defaultJob.title = 'All Jobs';
    this.defaultJob.id = 'jobId';
    router.events.pipe(filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.initializeJobfilterFormGroup();
      this.getSuggestedFilter(event.url);
      // this.localStorageService.removeItem('workerSelectedJob');
    });
  }

  getSuggestedFilter(url: string): void {
    if (url !== '/login') {
      if (this.sideBarUrlSetOne.includes(url)) {
        if (this.localStorageService.getSidebarJobSelectionFilterEnum()
          !== SideBarEnumForWorker.GET_WORKER_ACCEPTED_JOB) {
          this.prepareDefaultCriteriaSetOne();
        } else {
          this.prepareDefaultCriteriaSetOne();
        }
      } else if (this.sideBarUrlSetTwo.includes(url)) {
        if (this.localStorageService.getSidebarJobSelectionFilterEnum()
          !== SideBarEnumForWorker.GET_WORKER_LEFT_JOB_FOR_ACCEPT_JOB) {
          this.prepareDefaultCriteriaSetTwo();
        }
        else {
          this.prepareDefaultCriteriaSetTwo();
        }
      }
      else if (this.sideBarUrlSetThree.includes(url)) {
        if (this.localStorageService.getSidebarJobSelectionFilterEnum()
          !== SideBarEnumForWorker.GET_WORKER_LEFT_JOB_FOR_APPLY_JOB) {
          this.prepareDefaultCriteriaSetThree();
        } else {
          this.prepareDefaultCriteriaSetThree();
        }
      }
      else if (this.sideBarUrlSetFour.includes(url)) {
        if (this.localStorageService.getSidebarJobSelectionFilterEnum()
          !== SideBarEnumForWorker.GET_WORKER_COMPLETED_CANCELLED_JOB) {
          this.prepareDefaultCriteriaSetFour();
        } else {
          this.prepareDefaultCriteriaSetFour();
        }
      }
      else if (this.sideBarUrlSetFive.includes(url)) {
        if (this.localStorageService.getSidebarJobSelectionFilterEnum()
          !== SideBarEnumForWorker.GET_WORKER_COMPLETED_APPLIED_OFFERED_ACCEPTED_JOB) {
          this.prepareDefaultCriteriaSetFive();
        } else {
          this.prepareDefaultCriteriaSetFive();
        }
      }
    }
  }

  prepareDefaultCriteriaSetOne(): void {
    const loggedInUserId = this.localStorageService.getLoginUserId();
    const filterMap = new Map();
    filterMap.set('GET_WORKER_ACCEPTED_COMPLETED_CANCELLED_JOB', loggedInUserId);
    this.localStorageService.setSidebarJobSelectionFilterEnum(SideBarEnumForWorker.GET_WORKER_ACCEPTED_JOB);
    this.setJobDetails(filterMap);
  }

  prepareDefaultCriteriaSetTwo(): void {
    const loggedInUserId = this.localStorageService.getLoginUserId();
    const filterMap = new Map();
    filterMap.set('GET_WORKER_LEFT_JOB_FOR_ACCEPT_JOB', loggedInUserId);
    this.localStorageService.setSidebarJobSelectionFilterEnum(SideBarEnumForWorker.GET_WORKER_LEFT_JOB_FOR_ACCEPT_JOB);
    this.setJobDetails(filterMap);
  }

  prepareDefaultCriteriaSetThree(): void {
    const loggedInUserId = this.localStorageService.getLoginUserId();
    const filterMap = new Map();
    filterMap.set('GET_WORKER_LEFT_JOB_FOR_APPLY_JOB', loggedInUserId);
    this.localStorageService.setSidebarJobSelectionFilterEnum(SideBarEnumForWorker.GET_WORKER_LEFT_JOB_FOR_APPLY_JOB);
    this.setJobDetails(filterMap);
  }
  prepareDefaultCriteriaSetFour(): void {
    const loggedInUserId = this.localStorageService.getLoginUserId();
    const filterMap = new Map();
    filterMap.set('GET_WORKER_COMPLETED_CANCELLED_JOB', loggedInUserId);
    this.localStorageService.setSidebarJobSelectionFilterEnum(SideBarEnumForWorker.GET_WORKER_COMPLETED_CANCELLED_JOB);
    this.setJobDetails(filterMap);
  }
  prepareDefaultCriteriaSetFive(): void {
    const loggedInUserId = this.localStorageService.getLoginUserId();
    const filterMap = new Map();
    filterMap.set('GET_WORKER_COMPLETED_APPLIED_OFFERED_ACCEPTED_JOB', loggedInUserId);
    this.localStorageService.setSidebarJobSelectionFilterEnum(SideBarEnumForWorker.GET_WORKER_COMPLETED_APPLIED_OFFERED_ACCEPTED_JOB);
    this.setJobDetails(filterMap);
  }

  ngOnInit(): void {
    this.getSuggestedFilter(this.router.url);
    this.initializeJobfilterFormGroup();
    const currentUrl = this.router.url;
    if (currentUrl === '/worker/accept-job') {
      this.workerSideBarJobListService.workerSidebarJobList.subscribe(e => {

        this.acceptedJobFlag = true;
        this.prepareDefaultCriteriaSetTwo();
      });
    } else if (currentUrl === '/worker/apply-for-job') {
      this.workerSideBarJobListService.workerSidebarJobList.subscribe(e => {

        this.prepareDefaultCriteriaSetThree();
      });
    }
    this.workerSideBarJobListService.refreshSidebarAfterAcceptReject.subscribe(element => {
      this.refreshSideBarAfterAcceptJob();
    });
  }

  setJobDetails(jobDetailsCriteria: Map<any, any>): void {
    const jsonObject = {};
    jobDetailsCriteria.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);

    this.datatableParam = {
      offset: this.offset,
      size: this.size,
      sortField: 'CREATED_DATE',
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.jobDetailService.getJobDetailList(this.queryParam).subscribe(data => {

      if (data?.data) {
        this.jobData = data.data?.result;
        const currentUrl = this.router.url;
        if (this.jobData?.length) {
          if (currentUrl === '/worker/accept-job' && !this.localStorageService.getItem('workerSelectedJob')) {
            if (!this.localStorageService.getItem('workerSelectedJob')) {
              this.selectedJobDetail = this.jobData[0];
              this.localStorageService.setItem('workerSelectedJob', this.selectedJobDetail);
            } else {
              const job = this.localStorageService.getItem('workerSelectedJob');
              const index = this.jobData.findIndex(x => x.id === job.id);
              this.selectedJobDetail = this.jobData[index];
              this.localStorageService.setItem('workerSelectedJob', this.selectedJobDetail);
            }
          }
          else if (currentUrl === '/worker/apply-for-job') {
            if (this.localStorageService.getItem('workerSelectedJob')) {
              const job = this.localStorageService.getItem('workerSelectedJob');
              const index = this.jobData.findIndex(x => x.id === job.id);
              this.selectedJobDetail = this.jobData[index];
              // this.workerSideBarJobListService.workerSidebarJobChanged.next(this.selectedJobDetail);
            }
            else {
              this.selectedJobDetail = this.jobData[0];
              this.localStorageService.setItem('workerSelectedJob', this.selectedJobDetail);
              // this.selectedJobDetail = job.jobDetail as JobDetails;
            }

            // this.workerSideBarJobListService.workerSidebarJobChanged.next(this.selectedJobDetail);
          }
          else if (currentUrl === '/worker/worker-job-details') {
            this.selectedJobDetail = this.jobData[0];
            this.localStorageService.setItem('workerSelectedJob', this.selectedJobDetail);
            this.workerSideBarJobListService.workerSidebarJobChanged.next(this.selectedJobDetail);
          }
          else if (currentUrl === '/worker/dashboard') {
            this.selectedJobDetail = this.jobData[0];
            this.localStorageService.setItem('workerSelectedJob', this.selectedJobDetail);
          }
          else if (this.router.url === '/worker/chat-messages') {
            if (!this.localStorageService.getItem('workerSelectedJob')) {
              this.selectedJobDetail = this.jobData[0];
              this.localStorageService.setItem('workerSelectedJob', this.selectedJobDetail);
            } else {
              const job = this.localStorageService.getItem('workerSelectedJob');
              const index = this.jobData.findIndex(x => x.id === job.id);
              this.selectedJobDetail = this.jobData[index];
              this.localStorageService.setItem('workerSelectedJob', this.selectedJobDetail);
            }
          }
          else if (this.router.url === '/worker/timesheet') {
            if (!this.localStorageService.getItem('workerSelectedJob')) {
              this.selectedJobDetail = this.jobData[0];
            } else {
              const job = this.localStorageService.getItem('workerSelectedJob');
              const index = this.jobData.findIndex(x => x.id === job.id);
              this.selectedJobDetail = this.jobData[index];
            }
          }
          else {
            this.selectedJobDetail = this.localStorageService.getItem('workerSelectedJob');
            // this.workerSideBarJobListService.workerSidebarJobChanged.next(this.selectedJobDetail);
          }
          if (this.allLabelUrls.includes(this.router.url)) {
            if (!this.jobData.some((item) => item.id === this.defaultJob.id) && this.jobData.length) {
              this.jobData.splice(0, 0, this.defaultJob);
              if (!this.localStorageService.getItem('workerSelectedJob')) {
                this.selectedJobDetail = this.defaultJob;
              } else {
                const job = this.localStorageService.getItem('workerSelectedJob');
                const index = this.jobData.findIndex(x => x.id === job.id);
                this.selectedJobDetail = this.jobData[index];
              }
            }
          }
          this.localStorageService.setItem('workerSelectedJob', this.selectedJobDetail);
          this.workerSideBarJobListService.workerSidebarJobChanged.next(this.selectedJobDetail);
          if (this.acceptedJobFlag) {
            this.selectedJobDetail = this.jobData[0];
            this.workerSideBarJobListService.workerSidebarJobChanged.next(this.selectedJobDetail);
          }
        }
      }
    });



  }

  private prepareQueryParam(paramObject): URLSearchParams {
    const params = new URLSearchParams();
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  jobChanged(event): void {
    const currentUrl = this.router.url;
    if (currentUrl === '/worker/apply-for-job') {
      if (this.localStorageService.getItem('startedBidding')) {
        this.confirmDialogForApplyJobChange(event);
      } else {
        this.selectedJobDetail = event.value;
        this.localStorageService.removeItem('jobData');
        this.localStorageService.setItem('workerSelectedJob', this.selectedJobDetail);
        this.workerSideBarJobListService.workerSidebarJobChanged.next(this.selectedJobDetail);
      }
    } else {
      this.selectedJobDetail = event.value;
      this.localStorageService.setItem('workerSelectedJob', this.selectedJobDetail);
      this.workerSideBarJobListService.workerSidebarJobChanged.next(this.selectedJobDetail);
    }
  }
  public initializeJobfilterFormGroup(): void {
    this.jobFilterFormGroup = this.formBuilder.group({
      keyword: [''],
      jobTitle: [''],
      employmentType: [''],
      city: [''],
      state: [''],
      region: [''],
      postedBy: [''],
    });

  }
  confirmDialogForApplyJobChange(event): void {
    let options = null;
    let message;
    message = this.translator.instant('are.you.sure.you.want.to.change.the.job.you will.loose.unsaved.data');
    options = {
      title: this.translator.instant('warning'),
      message,
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        // this.assignSupervisor(jobId, event);
        this.selectedJobDetail = event.value;
        this.localStorageService.setItem('workerSelectedJob', this.selectedJobDetail);
        this.workerSideBarJobListService.workerSidebarJobChanged.next(this.selectedJobDetail);
        this.router.navigate([PATH_CONSTANTS.APPLY_JOB]);
      }
      else {
        const data = this.localStorageService.getItem('biddingForm');
      }
    });
  }
  getFilteredCityForJob(event): void {
    this.cityParams = {
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.cityParams);
    this.filterlLeftPanelService.getCityForJob(this.queryParam).subscribe(data => {
      this.filteredCityForJob = data.data;
      this.filteredCityForJob = this.filteredCityForJob.sort();
    });
  }
  getFilteredStateForJob(event): void {
    this.stateParams = {
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.stateParams);
    this.filterlLeftPanelService.getStateForJob(this.queryParam).subscribe(data => {
      this.filteredStateForJob = data.data;
      this.filteredStateForJob = this.filteredStateForJob.sort();
    });
  }
  getFilteredRegionForJob(event): void {
    this.regionParams = {
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.regionParams);
    this.filterlLeftPanelService.getRegionForJob(this.queryParam).subscribe(data => {

      this.filteredRegionForJob = data.data;
      this.filteredRegionForJob = this.filteredRegionForJob.sort();
    });
  }
  getClientByName(name): void {
    this.clientNameParams = {
      name: name.query
    };
    this.queryParam = this.prepareQueryParam(this.clientNameParams);
    this.filterlLeftPanelService.getClientByName(this.queryParam).subscribe(data => {

      this.clients = data.data;
      this.clients = this.clients.sort();
    });

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

  }
  getJobTitleForWorker(name): void {

    this.jobTitleParams = {
      workerId: this.loggedInUserId,
      name: name.query
    };
    this.queryParam = this.prepareQueryParam(this.jobTitleParams);
    const currentUrl = this.router.url;
    if (this.sideBarUrlSetOne.includes(currentUrl)) {
      this.filterlLeftPanelService.getAcceptedJobTitleForWorker(this.queryParam).subscribe(data => {

        this.jobTitles = data.data;
        this.jobTitles = this.jobTitles.sort();
      });
    }
    else if (this.sideBarUrlSetTwo.includes(currentUrl)) {
      this.filterlLeftPanelService.getOfferedJobTitleForWorker(this.queryParam).subscribe(data => {

        this.jobTitles = data.data;
        this.jobTitles = this.jobTitles.sort();
      });
    } else if (this.sideBarUrlSetThree.includes(currentUrl)) {
      this.filterlLeftPanelService.getApplyJobTitleForWorker(this.queryParam).subscribe(data => {

        this.jobTitles = data.data;
        this.jobTitles = this.jobTitles.sort();
      });
    }
    else if (this.sideBarUrlSetFour.includes(currentUrl)) {
      this.filterlLeftPanelService.getCompletedCancelledAcceptedJobTitleForWorker(this.queryParam).subscribe(data => {

        this.jobTitles = data.data;
        this.jobTitles = this.jobTitles.sort();
      });
    }
    else if (this.sideBarUrlSetFive.includes(currentUrl)) {
      this.filterlLeftPanelService.getOfferedJobTitleForWorker(this.queryParam).subscribe(data => {

        this.jobTitles = data.data;
        this.jobTitles = this.jobTitles.sort();
      });
    }
    else {
      this.filterlLeftPanelService.getJobTitleForWorker(this.queryParam).subscribe(data => {

        this.jobTitles = data.data;
        this.jobTitles = this.jobTitles.sort();
      });
    }
  }
  setFilter(): void {
    this.filterMap.clear();
    // setDefaultCriteria based on Local Session Enum

    // this.filterMap.set('STATUS', 'POSTED');
    // this.filterMap.set('MARKET_TYPE', 'OPEN_MARKET_REQUEST');
    // this.filterMap.set('WITHOUT_CANCELLED', 'CANCELLED');
    // this.filterMap.set('WITHOUT_COMPLETED', 'COMPLETED');
    if (this.localStorageService.getSidebarJobSelectionFilterEnum() === 1) {
      this.filterMap.set('GET_WORKER_LEFT_JOB_FOR_ACCEPT_JOB', this.loggedInUserId);
    } else if (this.localStorageService.getSidebarJobSelectionFilterEnum() === 0) {
      this.filterMap.set('GET_WORKER_ACCEPTED_COMPLETED_CANCELLED_JOB', this.loggedInUserId);
    }
    else if (this.localStorageService.getSidebarJobSelectionFilterEnum() === 2) {
      this.filterMap.set('GET_WORKER_LEFT_JOB_FOR_APPLY_JOB', this.loggedInUserId);
    }
    else if (this.localStorageService.getSidebarJobSelectionFilterEnum() === 3) {
      this.filterMap.set('GET_WORKER_COMPLETED_CANCELLED_JOB', this.loggedInUserId);
    }
    else {
      this.filterMap.set('GET_WORKER_COMPLETED_APPLIED_OFFERED_ACCEPTED_JOB', this.loggedInUserId);
    }
    this.title.length = 0;
    this.postedByList.length = 0;
    this.cityFilter.length = 0;
    this.regionFilter.length = 0;
    this.stateFilter.length = 0;
    if (this.jobFilterFormGroup.value.city) {
      this.jobFilterFormGroup.value.city.forEach(element => {
        this.cityFilter.push(element);
        this.filterMap.set('CITY', this.cityFilter.toString());
      });
    }
    if (this.jobFilterFormGroup.value.state) {
      this.jobFilterFormGroup.value.state.forEach(element => {
        this.stateFilter.push(element);
        this.filterMap.set('STATE', this.stateFilter.toString());
      });
    }
    if (this.jobFilterFormGroup.value.region) {
      this.jobFilterFormGroup.value.region.forEach(element => {
        this.regionFilter.push(element);
        this.filterMap.set('REGION', this.regionFilter.toString());
      });
    }
    if (this.jobFilterFormGroup.value.keyword) {
      this.filterMap.set('KEY_WORD', this.jobFilterFormGroup.value.keyword);
    }
    if (this.jobFilterFormGroup.value.jobTitle) {
      this.jobFilterFormGroup.value.jobTitle.forEach(element => {
        this.title.push(element);
        this.filterMap.set('TITLE', this.title.toString());
      });
    }
    if (this.jobFilterFormGroup.value.employmentType !== '') {
      this.jobFilterFormGroup.value.employmentType.forEach(element => {
        this.employementType = element.value;

        this.filterMap.set('EMPLOYMENT_TYPE', this.employementType);
      });
    }
    if (this.jobFilterFormGroup.value.postedBy.length !== 0) {

      this.jobFilterFormGroup.value.postedBy.forEach(element => {
        this.postedByList.push(element.id);

      });
      this.filterMap.set('USER_ID', this.postedByList.toString());
    }

    const sidebarEnum = this.localStorageService.getSidebarJobSelectionFilterEnum();

    if (sidebarEnum) {
      switch (sidebarEnum) {
        case 0:
          const loggedInUserId = this.localStorageService.getLoginUserId();
          this.filterMap.set('GET_WORKER_ACCEPTED_COMPLETED_CANCELLED_JOB', loggedInUserId);
          break;
        case 1:
          const loggedInUserId1 = this.localStorageService.getLoginUserId();
          this.filterMap.set('GET_WORKER_LEFT_JOB_FOR_ACCEPT_JOB', loggedInUserId1);
          break;
        case 2:
          const loggedInUserId2 = this.localStorageService.getLoginUserId();
          this.filterMap.set('GET_WORKER_LEFT_JOB_FOR_APPLY_JOB', loggedInUserId2);
          break;
        case 3:
          const loggedInUserId3 = this.localStorageService.getLoginUserId();
          this.filterMap.set('GET_WORKER_COMPLETED_CANCELLED_JOB', loggedInUserId3);
          break;
        case 4:
          const loggedInUserId4 = this.localStorageService.getLoginUserId();
          this.filterMap.set('GET_WORKER_COMPLETED_APPLIED_OFFERED_ACCEPTED_JOB', loggedInUserId4);
          break;
        default:
          break;
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
      sortField: 'CREATED_DATE',
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.datatableParam);

    this.jobDetailService.getJobDetailList(this.queryParam).subscribe(data => {

      this.jobData = data.data.result;
      if (this.allLabelUrls.includes(this.router.url)) {
        if (!this.jobData.some((item) => item.id === this.defaultJob.id) && this.jobData.length) {
          this.jobData.splice(0, 0, this.defaultJob);
          if (!this.localStorageService.getItem('workerSelectedJob')) {
            this.selectedJobDetail = this.defaultJob;
          } else {
            const job = this.localStorageService.getItem('workerSelectedJob');
            const index = this.jobData.findIndex(x => x.id === job.id);
            this.selectedJobDetail = this.jobData[index];
          }
        }
      }
    });
  }
  clear(event): void {
    this.filterMap.clear();
    // TODO set filter based on session values
    // this.filterMap=this.localStorageService.getSidebarJobSelectionFilterEnum();
    this.jobFilterFormGroup.reset();
    this.jobFilterFormGroup.get('jobTitle').patchValue(this.emptyArray);
    this.jobFilterFormGroup.get('employmentType').patchValue(this.emptyArray);
    this.jobFilterFormGroup.get('city').patchValue(this.emptyArray);
    this.jobFilterFormGroup.get('state').patchValue(this.emptyArray);
    this.jobFilterFormGroup.get('region').patchValue(this.emptyArray);
    this.jobFilterFormGroup.get('postedBy').patchValue(this.emptyArray);
    if (this.localStorageService.getSidebarJobSelectionFilterEnum() === 1) {
      this.prepareDefaultCriteriaSetTwo();
    }
    else if (this.localStorageService.getSidebarJobSelectionFilterEnum() === 0) {
      this.prepareDefaultCriteriaSetOne();
    }
    else if (this.localStorageService.getSidebarJobSelectionFilterEnum() === 2) {
      this.prepareDefaultCriteriaSetThree();
    }
    else if (this.localStorageService.getSidebarJobSelectionFilterEnum() === 3) {
      this.prepareDefaultCriteriaSetFour();
    }
    else if (this.localStorageService.getSidebarJobSelectionFilterEnum() === 4) {
      this.prepareDefaultCriteriaSetFive();
    }
    else {
      this.setJobDetails(this.filterMap);
    }
  }

  refreshSideBarAfterAcceptJob(): void {
    if (this.sideBarUrlSetTwo.includes(this.router.url)) {
      this.prepareDefaultCriteriaSetTwo();
    }
  }
  getFullName(data: User) {
    // 
    return data.firstName + ' ' + data.lastName;
  }
}
