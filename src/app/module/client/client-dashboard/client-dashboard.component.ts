import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChartOptions, ChartType } from 'chart.js';
import { Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip, SingleDataSet } from 'ng2-charts';
import { ReplaySubject, Subject } from 'rxjs';
import { concatMap, groupBy, map, toArray } from 'rxjs/operators';
import { StateService } from 'src/app/service/admin-services/state/state.service';
import { ClientProfileService } from 'src/app/service/client-services/client-profile/client-profile.service';
import { JobDetailService } from 'src/app/service/client-services/job-detail/job-detail.service';
import { JobsiteService } from 'src/app/service/client-services/post-project/jobsite.service';
import { ProjectDetailService } from 'src/app/service/client-services/project-detail.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { DashboardService } from 'src/app/service/dashboard-services/dashboard.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { ProjectBidService } from 'src/app/service/subcontractor-services/project-bid/project-bid.service';
import { TimesheetService } from 'src/app/service/worker-services/timesheet.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { User } from 'src/app/shared/vo/User';

@Component({
  selector: 'app-client-dashboard',
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css']
})
export class ClientDashboardComponent implements OnInit, OnDestroy {

  queryParam;
  datatableParam: DataTableParam = {
    offset: 0,
    size: 100000,
    sortField: '',
    sortOrder: 1,
    searchText: null
  };
  filteredState: any[];
  state = [];

  groupedWorkerTimesheet = [];
  groupedTimesheetList = [];


  selectedType = {
    type: 'All',
    value: 'all'
  };

  filteredType = [];

  typesForLocationDropdown = [
    {
      type: 'All',
      value: 'all'
    },
    {
      type: 'Project',
      value: 'project'
    },
    {
      type: 'Jobsite',
      value: 'jobsite'
    },
    {
      type: 'Job',
      value: 'job'
    }
  ];

  toDoButtonOptions: any[];
  selectedToDoOption: any = { label: 'Project', value: 'project' };

  totalProject = 0;
  totalJobsite = 0;
  totalJob = 0;
  lat = 40.730610;
  lng = -73.935242;

  pendingCloseOutPackageRequest = [];


  pendingTimesheet = [];

  projects = [];
  jobsites = [];
  jobs = [];

  selectedState: any;

  clientProfile: any;
  hasProjectAccess = false;
  hasJobAccess = false;

  defaultState = {
    name: 'All'
  };
  filterMapForProject = new Map();
  globalFilterForProject;
  dataTableParamForProject: DataTableParam;
  queryParamForProject;
  groupByStatusProject = [];
  numberOfDraftedProject = 0;
  numberOfPostedProject = 0;
  numberOfInProcessProject = 0;
  numberOfCompletedProject = 0;

  dataOfDraftedProject = [];
  dataOfPostedProject = [];
  dataOfInProcessProject = [];
  dataOfCompletedProject = [];

  // load data for jobsite

  filterMapForJobsite = new Map();
  globalFilterForJobsite;
  dataTableParamForJobsite: DataTableParam;
  queryParamForJobsite;
  groupByStatusJobsite = [];
  numberOfDraftedJobsite = 0;
  numberOfPostedJobsite = 0;
  numberOfInProcessJobsite = 0;
  numberOfCompletedJobsite = 0;

  dataOfDraftedJobsite = [];
  dataOfPostedJobsite = [];
  dataOfInProcessJobsite = [];
  dataOfCompletedJobsite = [];

  // load data for jobsite

  filterMapForJob = new Map();
  globalFilterForJob;
  dataTableParamForJob: DataTableParam;
  queryParamForJob;
  groupByStatusJob = [];
  numberOfDraftedJob = 0;
  numberOfPostedJob = 0;
  numberOfInProcessJob = 0;
  numberOfCompletedJob = 0;

  dataOfDraftedJob = [];
  dataOfPostedJob = [];
  dataOfInProcessJob = [];
  dataOfCompletedJob = [];

  globalFilterForCloseOut;
  dataTableParamForCloseOut: DataTableParam;
  filterMapForCloseOut = new Map();

  pieChartColorsForProject = [
    {
      backgroundColor: ['rgb(255,148,150)', 'rgb(246,214,82)', 'rgb(91,203,112)', 'rgb(136,145,160)'],
    },
  ];

  pieChartColorsForJobsite = [
    {
      backgroundColor: ['rgb(255,148,150)', 'rgb(246,214,82)', 'rgb(91,203,112)', 'rgb(136,145,160)'],
    },
  ];

  pieChartColorsForJob = [
    {
      backgroundColor: ['rgb(255,148,150)', 'rgb(246,214,82)', 'rgb(91,203,112)', 'rgb(136,145,160)'],
    },
  ];

  public pieChartOptions: ChartOptions = {
    responsive: true,
    legend: {
      position: 'bottom',
      labels: {
        fontSize: 10,
        usePointStyle: true
      }
    }
  };
  public pieChartLabelsForProject: Label[] = ['Draft', 'Posted', 'In Progress', 'Completed'];
  public pieChartLabelsForJobsite: Label[] = ['Draft', 'Posted', 'In Progress', 'Completed'];
  public pieChartLabelsForJob: Label[] = ['Draft', 'Posted', 'In Progress', 'Completed'];
  public pieChartDataForProject: SingleDataSet = [0, 0, 0, 0];
  public pieChartDataForJobsite: SingleDataSet = [0, 0, 0, 0];
  public pieChartDataForJob: SingleDataSet = [0, 0, 0, 0];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];
  globalFilter: string;
  timesheetList: any;
  timesheetGroupByDTOList: any[];
  loggedInUserId: any;

  constructor(
    private captionChangeService: HeaderManagementService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private stateService: StateService,
    private timeshhetService: TimesheetService,
    private projectBidService: ProjectBidService,
    private _clientProfile: ClientProfileService,
    private localStrorageService: LocalStorageService,
    private router: Router,
    private dashboardService: DashboardService) {
    this.projectJobSelectionService.hideJobsiteListBehaviourSubject.next(false);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.DASHBOARD);
    this.captionChangeService.hideSidebarSubject.next(true);
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
    this.toDoButtonOptions = [
      { label: 'Project', value: 'project' },
      { label: 'Job', value: 'job' }
    ];
  }

  ngOnDestroy(): void {
    this.captionChangeService.hideSidebarSubject.next(false);
  }

  ngOnInit(): void {
    this.loggedInUserId = this.localStrorageService.getLoginUserId();
    this.getClientDetailByUserId();
    this.loadDataForProjectJobsiteJob();

    this.setDefaultCriteriaForCloseOut();
    this.getCloseOutList();
    this.setDefaultCriteriaForTimesheet();
    this.projectJobSelectionService.hideJobsiteListBehaviourSubject.next(false);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.DASHBOARD);
    this.captionChangeService.hideSidebarSubject.next(true);

  }

  validateChart() {
    let count = 0;
    this.pieChartDataForProject.forEach(element => {
      if (element === 0) {
        count++;
      }
    });
    if (count === 4) {
      return false;
    }
    else {
      return true;
    }
  }

  validateChartJobsite() {
    let count = 0;
    this.pieChartDataForJobsite.forEach(element => {
      if (element === 0) {
        count++;
      }
    });
    if (count === 4) {
      return false;
    }
    else {
      return true;
    }
  }

  validateChartJob() {
    let count = 0;
    this.pieChartDataForJob.forEach(element => {
      if (element === 0) {
        count++;
      }
    });
    if (count === 4) {
      return false;
    }
    else {
      return true;
    }
  }

  filterType(event) {
    const filtered: any[] = [];
    const query = event.query;
    for (let i = 0; i < this.typesForLocationDropdown.length; i++) {
      const type = this.typesForLocationDropdown[i];
      if (type.type.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(type);
      }
    }
    this.filteredType = filtered;
    this.filteredType = this.filteredType.sort();
  }

  filterState(event) {
    const filtered: any[] = [];
    const query = event.query;
    for (let i = 0; i < this.state.length; i++) {
      const state = this.state[i];
      if (state.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(state);
      }
    }
    this.filteredState = filtered;
    this.filteredState = this.filteredState.sort();

  }

  private prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  private getStateList() {
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.stateService.getStateList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.state = data.data.result;
            this.state.splice(0, 0, this.defaultState);
          }
        } else {
        }
      },
      error => {
      }
    );
  }



  setProjectChartData(projectData: any[]) {
    this.dataOfDraftedProject = [];
    this.dataOfPostedProject = [];
    this.dataOfInProcessProject = [];
    this.dataOfCompletedProject = [];
    projectData.forEach(element => {
      if (element.status === 'DRAFT') {
        this.dataOfDraftedProject.push(element);
      }
      if (element.status === 'POSTED') {
        this.dataOfPostedProject.push(element);
      }
      if (element.status === 'IN_PROGRESS') {
        this.dataOfInProcessProject.push(element);
      }
      if (element.status === 'COMPLETED') {
        this.dataOfCompletedProject.push(element);
      }
    });
    this.numberOfDraftedProject = this.dataOfDraftedProject?.length;
    this.numberOfPostedProject = this.dataOfPostedProject?.length;
    this.numberOfInProcessProject = this.dataOfInProcessProject?.length;
    this.numberOfCompletedProject = this.dataOfCompletedProject?.length;
    if (!this.selectedState) {
      // tslint:disable-next-line: max-line-length
      this.pieChartDataForProject = [this.numberOfDraftedProject, this.numberOfPostedProject, this.numberOfInProcessProject, this.numberOfCompletedProject];
    }

    if (this.selectedState && (this.selectedType.value === 'all' || this.selectedType.value === 'project')) {
      this.dataOfDraftedProject = this.dataOfDraftedProject.filter(e => e.state === this.selectedState);
      this.dataOfCompletedProject = this.dataOfCompletedProject.filter(e => e.state === this.selectedState);
      this.dataOfInProcessProject = this.dataOfInProcessProject.filter(e => e.state === this.selectedState);
      this.dataOfPostedProject = this.dataOfPostedProject.filter(e => e.state === this.selectedState);
    }
  }





  setJobsiteChartData(projectData: any[]) {
    this.dataOfDraftedJobsite = [];
    this.dataOfPostedJobsite = [];
    this.dataOfInProcessJobsite = [];
    this.dataOfCompletedJobsite = [];
    projectData.forEach(element => {
      if (element.status === 'DRAFT') {
        this.dataOfDraftedJobsite.push(element);
      }
      if (element.status === 'POSTED') {
        this.dataOfPostedJobsite.push(element);
      }
      if (element.status === 'IN_PROGRESS') {
        this.dataOfInProcessJobsite.push(element);
      }
      if (element.status === 'COMPLETED') {
        this.dataOfCompletedJobsite.push(element);
      }
    });
    this.numberOfDraftedJobsite = this.dataOfDraftedJobsite?.length;
    this.numberOfPostedJobsite = this.dataOfPostedJobsite?.length;
    this.numberOfInProcessJobsite = this.dataOfInProcessJobsite?.length;
    this.numberOfCompletedJobsite = this.dataOfCompletedJobsite?.length;
    if (!this.selectedState) {
      this.pieChartDataForJobsite = [
        this.numberOfDraftedJobsite,
        this.numberOfPostedJobsite,
        this.numberOfInProcessJobsite,
        this.numberOfCompletedJobsite
      ];
    }
    if (this.selectedState && (this.selectedType.value === 'all' || this.selectedType.value === 'jobsite')) {
      this.dataOfDraftedJobsite = this.dataOfDraftedJobsite.filter(e => e.state === this.selectedState);
      this.dataOfCompletedJobsite = this.dataOfCompletedJobsite.filter(e => e.state === this.selectedState);
      this.dataOfInProcessJobsite = this.dataOfInProcessJobsite.filter(e => e.state === this.selectedState);
      this.dataOfPostedJobsite = this.dataOfPostedJob.filter(e => e.state === this.selectedState);
    }
  }




  setJobChartData(projectData: any[]) {
    this.dataOfDraftedJob = [];
    this.dataOfPostedJob = [];
    this.dataOfInProcessJob = [];
    this.dataOfCompletedJob = [];
    projectData.forEach(element => {
      if (element.status === 'DRAFT') {
        this.dataOfDraftedJob.push(element);
      }
      if (element.status === 'POSTED') {
        this.dataOfPostedJob.push(element);
      }
      if (element.status === 'IN_PROGRESS') {
        this.dataOfInProcessJob.push(element);
      }
      if (element.status === 'COMPLETED') {
        this.dataOfCompletedJob.push(element);
      }
    });
    this.numberOfDraftedJob = this.dataOfDraftedJob?.length;
    this.numberOfPostedJob = this.dataOfPostedJob?.length;
    this.numberOfInProcessJob = this.dataOfInProcessJob?.length;
    this.numberOfCompletedJob = this.dataOfCompletedJob?.length;
    if (!this.selectedState) {
      this.pieChartDataForJob = [this.numberOfDraftedJob, this.numberOfPostedJob, this.numberOfInProcessJob, this.numberOfCompletedJob];
    }

    if (this.selectedState && (this.selectedType.value === 'all' || this.selectedType.value === 'job')) {
      this.dataOfDraftedJob = this.dataOfDraftedJob.filter(e => e.state === this.selectedState);
      this.dataOfCompletedJob = this.dataOfCompletedJob.filter(e => e.state === this.selectedState);
      this.dataOfInProcessJob = this.dataOfInProcessJob.filter(e => e.state === this.selectedState);
      this.dataOfPostedJob = this.dataOfPostedJob.filter(e => e.state === this.selectedState);
    }
  }

  setDefaultCriteriaForTimesheet(): void {
    const filterMap = new Map();
    const user = this.localStrorageService.getLoginUserObject() as User;
    const loggedInUserId = this.localStrorageService.getLoginUserId();
    filterMap.set('WITHOUT_CANCELLED_AND_COMPLETED', ['COMPLETED', 'CANCELLED'].toString());
    filterMap.set('STATUS', 'REQUESTED');
    if (user.roles[0].roleName === 'SUPERVISOR') {
      const clientOfLoggedInSupervisor = this.localStrorageService.getItem('clientOfLoggedInSupervisor');
      filterMap.set('SUPERVISOR_ID_FOR_TIMESHEET', loggedInUserId);
      filterMap.set('USER_ID', clientOfLoggedInSupervisor.id);
    }
    else {
      filterMap.set('USER_ID', loggedInUserId);
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
    this.getTimesheetData();
  }
  getTimesheetData(): void {
    setTimeout(() => {
      this.localStrorageService.removeItem('isFromLogin');
    }, 2000);
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.timeshhetService.getTimesheetList(this.queryParam).subscribe(data => {
      this.pendingTimesheet = [];
      this.groupByWorkerTimesheet(data.data.result);
    });
  }
  setDefaultCriteriaForCloseOut(): void {
    this.filterMapForCloseOut.clear();
    const userId = this.localStrorageService.getLoginUserId();
    this.filterMapForCloseOut.set('CLIENT_ID', userId);
    this.filterMapForCloseOut.set('REQUESTED_STATUS', '');
    this.filterMapForCloseOut.set('WITHOUT_CANCELLED_COMPLETED_PROJECT', ['COMPLETED', 'CANCELLED'].toString());
    const jsonObject = {};
    this.filterMapForCloseOut.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilterForCloseOut = JSON.stringify(jsonObject);
    this.dataTableParamForCloseOut = {
      offset: 0,
      size: 100000,
      sortField: 'CREATED_DATE',
      sortOrder: 1,
      searchText: this.globalFilterForCloseOut
    };
    this.getCloseOutList();
  }
  getCloseOutList(): void {
    const queryParamForCloseOut = this.prepareQueryParam(this.dataTableParamForCloseOut);
    this.projectBidService.getCloseout(queryParamForCloseOut).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {
        this.pendingCloseOutPackageRequest = [];
        this.pendingCloseOutPackageRequest = data.data.result;
      }
    });
  }

  getPendingCloseout() {
    this.dashboardService.getDashboardCloseoutforClient(this.loggedInUserId).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {
        if (data.data) {
          this.pendingCloseOutPackageRequest = data.data.lstCloseoutDataDTO;
        }
      }
    });
  }

  getTimesheetDetailById(): void {
    setTimeout(() => {
      this.localStrorageService.removeItem('isFromLogin');
    }, 2000);
    const id = this.localStrorageService.getLoginUserId();
    this.timeshhetService.getTimesheetListByClientId(id).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {
        this.pendingTimesheet = [];
        this.groupByWorkerTimesheet(data.data);
      }
    });
  }

  groupByWorkerTimesheet(data): void {
    this.groupedWorkerTimesheet = [];
    this.groupedTimesheetList = [];
    const records = data;
    const pipedRecords = new Subject();
    const result = pipedRecords.pipe(
      groupBy(
        (x: any) => x.worker.id,
        null,
        null,
        () => new ReplaySubject()
      ),
      concatMap(
        object => object.pipe(
          toArray(),
          map((obj: any) =>
            ({ key: object.key, value: obj })
          ))
      )
    );
    result.subscribe(x => {
      this.groupedWorkerTimesheet.push(x);
    });
    records.forEach(x => { pipedRecords.next(x); });
    pipedRecords.complete();
    this.groupedWorkerTimesheet.forEach(data => {
      const worker = data.value;
      this.groupByWorkWeekTimesheet(worker);
    });
  }


  groupByWorkWeekTimesheet(groupedTimesheetListWorker): void {
    this.groupedTimesheetList = [];
    const records = groupedTimesheetListWorker;
    const pipedRecords = new Subject();
    const result = pipedRecords.pipe(
      groupBy(
        (x: any) => x.jobBidDetail.jobDetail.id,
        null,
        null,
        () => new ReplaySubject()
      ),
      concatMap(
        object => object.pipe(
          toArray(),
          map((obj: any) =>
            ({ key: object.key, value: obj })
          ))
      )
    );
    result.subscribe(x => {
      this.groupedTimesheetList.push(x);
    });
    records.forEach(x => {
      pipedRecords.next(x);
    });
    pipedRecords.complete();
    this.groupedTimesheetList.forEach(element => {
      element.value.forEach(data => {
        if (!this.pendingTimesheet.some(item => item.jobBidDetail.jobDetail.id === data.jobBidDetail.jobDetail.id && item.worker.id === data.worker.id)) {
          data.numberOfTimeshhet = element.value.length;
          this.pendingTimesheet.push(data);
        }
      });
    });
  }

  redirectToCloseOut(projectDetail) {
    this.projectJobSelectionService.addProjectSubject.next(projectDetail);
    this.localStrorageService.setItem('selectedProject', projectDetail);
    this.router.navigate(['/client/closeOutPackageRequest']);
  }

  redirectToTimesheet(jobDetail) {
    this.projectJobSelectionService.addJobSubject.next(jobDetail);
    this.localStrorageService.setItem('selectedJob', jobDetail);
    this.router.navigate(['/client/clientJobTimeSheet']);
  }

  redirectTo(route: string) {
    if (route === 'job') {
      this.localStrorageService.setItem('Post_Type', 'JOB', false);
      this.router.navigate(['/client/job-list']);
    } else {
      this.localStrorageService.setItem('Post_Type', 'PROJECT', false);
      this.router.navigate(['/client/project-list']);
    }
  }

  getClientDetailByUserId(): void {
    const userId = this.localStrorageService.getLoginUserId();
    this._clientProfile.getClientProfileDetailById(userId).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.clientProfile = data.data;
          if (this.clientProfile.basicProfile) {
            if (this.clientProfile.basicProfile.latitude !== 0 && this.clientProfile.basicProfile.longitude !== 0) {
              this.lat = this.clientProfile.basicProfile.latitude;
              this.lng = this.clientProfile.basicProfile.longitude;
            }
          }
          this.hasProjectAccess = this.clientProfile.basicProfile.isProjectAccess;
          this.hasJobAccess = this.clientProfile.basicProfile.isJobAccess;
          if (this.hasJobAccess && this.hasProjectAccess) {
            this.selectedToDoOption = { label: 'Project', value: 'project' };
            this.typesForLocationDropdown = [
              {
                type: 'All',
                value: 'all'
              },
              {
                type: 'Project',
                value: 'project'
              },
              {
                type: 'Jobsite',
                value: 'jobsite'
              },
              {
                type: 'Job',
                value: 'job'
              }
            ];
          }
          else if (this.hasProjectAccess) {
            this.selectedToDoOption = { label: 'Project', value: 'project' };
            this.typesForLocationDropdown = [
              {
                type: 'All',
                value: 'all'
              },
              {
                type: 'Project',
                value: 'project'
              },
              {
                type: 'Jobsite',
                value: 'jobsite'
              }
            ];
          }
          else if (this.hasJobAccess) {
            this.selectedToDoOption = { label: 'Job', value: 'job' };
            this.typesForLocationDropdown = [
              {
                type: 'All',
                value: 'all'
              },
              {
                type: 'Job',
                value: 'job'
              }
            ];
          }
        }
      });
  }

  onStateSelect(event) {
    if (this.selectedState === 'All') {
      this.selectedState = null;
    }
    this.loadDataForProjectJobsiteJob();
  }
  onTypeSelect(event) {
    this.loadDataForProjectJobsiteJob();
  }

  onStateUnselect(event) {
    this.loadDataForProjectJobsiteJob();
  }

  loadDataForProjectJobsiteJob() {
    this.dashboardService.getDashboardProjectAndJobAndJobsiteforClient(this.localStrorageService.getLoginUserId()).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {

        this.totalProject = data.data.lstAdminProjectDataDTO?.length;
        this.totalJob = data.data.lstAdminJobDataDTO?.length;
        this.totalJobsite = data.data.lstAdminJobsiteDataDTO?.length;

        this.setProjectChartData(data.data.lstAdminProjectDataDTO);
        this.setJobsiteChartData(data.data.lstAdminJobsiteDataDTO);
        this.setJobChartData(data.data.lstAdminJobDataDTO);

        this.state = data.data.states;
        this.state.splice(0, 0, 'All');
      } else {

      }
    });
  }

}
