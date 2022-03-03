import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Label, SingleDataSet } from 'ng2-charts';
import { ReplaySubject, Subject } from 'rxjs';
import { concatMap, groupBy, map, toArray } from 'rxjs/operators';
import { LoginHistoryService } from 'src/app/service/admin-services/login-history/login-history.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { DashboardService } from 'src/app/service/dashboard-services/dashboard.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { UserService } from 'src/app/service/User.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  currentDate: any;

  currentOnlyDate: any;
  currentHour: any;
  currentMinite: any;


  totalProject = 0;
  totalJobsite = 0;
  totalJob = 0;
  totalUsers = 0;
  tempRoles = [];
  selectedTypeForChart = 'month';

  toDoButtonOptions: any[];
  selectedToDoOption: any = { label: "Project", value: "project" };


  projects = [];
  jobsites = [];
  jobs = [];

  typesForLocationDropdown = [
    {
      'type': 'All',
      'value': 'all'
    },
    {
      'type': 'Project',
      'value': 'project'
    },
    {
      'type': 'Jobsite',
      'value': 'jobsite'
    },
    {
      'type': 'Job',
      'value': 'job'
    }
  ];

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
  lat = 40.730610;
  lng = -73.935242;


  selectedType = {
    'type': 'All',
    'value': 'all'
  };

  filteredType = [];

  defaultState = {
    'name': 'All'
  }


  //load data for project

  filterMapForProject = new Map();
  globalFilterForProject;
  dataTableParamForProject: DataTableParam;
  queryParamForProject;
  groupByStatusProject = [];
  numberOfDraftedProject = 0;
  numberOfAwardedProject: number = 0;
  numberOfUnawardedProject = 0;
  numberOfCompletedProject = 0;
  numberOfCancelledProject = 0;

  dataOfDraftedProject = [];
  dataOfAwardedProject = [];
  dataOfUnawardedProject = [];
  dataOfCancelledProject = [];
  dataOfCompletedProject = [];

  //load data for jobsite

  filterMapForJobsite = new Map();
  globalFilterForJobsite;
  dataTableParamForJobsite: DataTableParam;
  queryParamForJobsite;
  groupByStatusJobsite = [];
  numberOfDraftedJobsite = 0;
  numberOfAwardedJobsite: number = 0;
  numberOfUnawardedJobsite = 0;
  numberOfCompletedJobsite = 0;
  numberOfCancelledJobsite = 0;

  dataOfDraftedJobsite = [];
  dataOfAwardedJobsite = [];
  dataOfUnawardedJobsite = [];
  dataOfCancelledJobsite = [];
  dataOfCompletedJobsite = [];

  //load data for job

  filterMapForJob = new Map();
  globalFilterForJob;
  dataTableParamForJob: DataTableParam;
  queryParamForJob;
  groupByStatusJob = [];
  numberOfDraftedJob = 0;
  numberOfAwardedJob: number = 0;
  numberOfUnawardedJob = 0;
  numberOfCompletedJob = 0;
  numberOfCancelledJob = 0;

  dataOfDraftedJob = [];
  dataOfAwardedJob = [];
  dataOfUnawardedJob = [];
  dataOfCancelledJob = [];
  dataOfCompletedJob = [];

  //load data for user

  filterMapForUser = new Map();
  globalFilterForUser;
  dataTableParamForUser: DataTableParam;
  queryParamForUser;
  groupByStatusUser = [];
  numberOfSubcontractor = 0;
  numberOfClient: number = 0;
  numberOfWorker: number = 0;

  selectedState: any;

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
  public pieChartLabels: Label[] = ['Draft', 'Awarded', 'Unawarded', 'Cancelled', 'Completed'];
  public pieChartLabelsForUser: Label[] = ['Client', 'Subcontractor', 'Worker'];
  public barChartLabelsForRevenue: Label[] = [];
  public barChartDataForRevenue: ChartDataSets[] = [
    { data: [], label: 'Revenue' }
  ];
  public pieChartDataForUser: SingleDataSet = [0, 0, 0];
  public pieChartDataForProject: SingleDataSet = [0, 0, 0, 0, 0];
  public pieChartDataForJobsite: SingleDataSet = [0, 0, 0, 0, 0];
  public pieChartDataForJob: SingleDataSet = [0, 0, 0, 0, 0];
  public pieChartType: ChartType = 'pie';
  public barChartTypeForRevenue: ChartType = 'bar';
  public pieChartLegend = true;
  public pieChartPlugins = [];

  invoiceOfMonth = [];
  invoiceOfYear = [];
  invoiceOfTillNow = [];
  lastLoginDate: Date;
  userAccess: any;
  subcontractorBtnDisabled: boolean = false;
  workerBtnDisabled: boolean = false;
  clientBtnDisabled: boolean = false;
  projectBtnDisabled: boolean = false;
  jobBtnDisabled: boolean = false;


  constructor(
    private captionChangeService: HeaderManagementService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private userService: UserService,
    private translator: TranslateService,
    private notificationService: UINotificationService,
    private loginHistoryService: LoginHistoryService,
    private dashboardService: DashboardService,
    private localStrorageService: LocalStorageService
  ) {
    this.projectJobSelectionService.hideJobsiteListBehaviourSubject.next(false);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.DASHBOARD);
    this.captionChangeService.hideSidebarSubject.next(true);
  }

  ngOnInit(): void {
    this.getLastLoginDetailByUserId();
    this.loadDataForProject();
    this.getUserChartData();
    this.getRevenueData();
    this.projectJobSelectionService.hideJobsiteListBehaviourSubject.next(false);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.DASHBOARD);
    this.captionChangeService.hideSidebarSubject.next(true);

    this.toDoButtonOptions = [
      { label: "Project", value: "project" },
      { label: "Job", value: "job" }
    ];

    this.userAccess = this.localStrorageService.getItem('userAccess');
    if (this.userAccess) {
      this.menuAccess();
    }
  }

  ngOnDestroy(): void {
    this.captionChangeService.hideSidebarSubject.next(false);

  }
  validateProjectChart() {
    let count = 0;
    this.pieChartDataForProject.forEach(element => {
      if (element === 0) {
        count++;
      }
    });
    if (count === 5) {
      return false;
    }
    else {
      return true;
    }
  }

  validateJobsiteChart() {
    let count = 0;
    this.pieChartDataForJobsite.forEach(element => {
      if (element === 0) {
        count++;
      }
    });
    if (count === 5) {
      return false;
    }
    else {
      return true;
    }
  }

  validateJobChart() {
    let count = 0;
    this.pieChartDataForJob.forEach(element => {
      if (element === 0) {
        count++;
      }
    });
    if (count === 5) {
      return false;
    }
    else {
      return true;
    }
  }


  validateUserChart() {
    let count = 0;
    this.pieChartDataForUser.forEach(element => {
      if (element === 0) {
        count++;
      }
    });
    if (count === 3) {
      return false;
    }
    else {
      return true;
    }
  }

  filterType(event) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.typesForLocationDropdown.length; i++) {
      let type = this.typesForLocationDropdown[i];
      if (type.type.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(type);
      }
    }
    this.filteredType = filtered;
    this.filteredType = this.filteredType.sort();
  }

  filterState(event) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.state.length; i++) {
      let state = this.state[i];
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

  //load data for project
  loadDataForProject() {
    this.dashboardService.getDashboardProjectAndJobAndJobsiteforAdmin().subscribe(data => {
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

  groupByStatusProjectMethod(data) {
    this.groupByStatusProject = [];
    const records = data;
    const pipedRecords = new Subject();
    const result = pipedRecords.pipe(
      groupBy(
        (x: any) => x.status,
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
      this.groupByStatusProject.push(x);
    });

    records.forEach(x => pipedRecords.next(x));
    pipedRecords.complete();
  }

  setProjectChartData(projectData: any[]) {
    this.dataOfDraftedProject = [];
    this.dataOfAwardedProject = [];
    this.dataOfUnawardedProject = [];
    this.dataOfCancelledProject = [];
    this.dataOfCompletedProject = [];

    projectData.forEach(element => {
      if (element.status === 'DRAFT') {
        this.dataOfDraftedProject.push(element);
      }
      if (element.status === 'POSTED') {
        this.dataOfUnawardedProject.push(element);
      }
      if (element.status === 'IN_PROGRESS') {
        this.dataOfAwardedProject.push(element);
      }
      if (element.status === 'COMPLETED') {
        this.dataOfCompletedProject.push(element);
      }
      if (element.status === 'CANCELLED') {
        this.dataOfCancelledProject.push(element);
      }
    });

    this.numberOfDraftedProject = this.dataOfDraftedProject?.length;
    this.numberOfUnawardedProject = this.dataOfUnawardedProject?.length;
    this.numberOfAwardedProject = this.dataOfAwardedProject?.length;
    this.numberOfCompletedProject = this.dataOfCompletedProject?.length;
    this.numberOfCancelledProject = this.dataOfCancelledProject?.length;

    if (!this.selectedState) {
      this.pieChartDataForProject = [this.numberOfDraftedProject, this.numberOfAwardedProject, this.numberOfUnawardedProject, this.numberOfCancelledProject, this.numberOfCompletedProject];
    }

    if (this.selectedState && (this.selectedType.value === 'all' || this.selectedType.value === 'project')) {
      this.dataOfAwardedProject = this.dataOfAwardedProject.filter(e => e.state === this.selectedState);
      this.dataOfUnawardedProject = this.dataOfUnawardedProject.filter(e => e.state === this.selectedState);
    }
  }

  groupByStatusJobsiteMethod(data) {
    this.groupByStatusJobsite = [];
    const records = data;
    const pipedRecords = new Subject();
    const result = pipedRecords.pipe(
      groupBy(
        (x: any) => x.status,
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
      this.groupByStatusJobsite.push(x);
    });

    records.forEach(x => pipedRecords.next(x));
    pipedRecords.complete();
  }

  setJobsiteChartData(jobsiteData) {
    this.dataOfDraftedJobsite = [];
    this.dataOfAwardedJobsite = [];
    this.dataOfUnawardedJobsite = [];
    this.dataOfCancelledJobsite = [];
    this.dataOfCompletedJobsite = [];
    jobsiteData.forEach(element => {
      if (element.status === 'DRAFT') {
        this.dataOfDraftedJobsite.push(element);
      }
      if (element.status === 'POSTED') {
        this.dataOfUnawardedJobsite.push(element);
      }
      if (element.status === 'IN_PROGRESS') {
        this.dataOfAwardedJobsite.push(element);
      }
      if (element.status === 'COMPLETED') {
        this.dataOfCompletedJobsite.push(element);
      }
      if (element.status === 'CANCELLED') {
        this.dataOfCancelledJobsite.push(element);
      }

      this.numberOfDraftedJobsite = this.dataOfDraftedJobsite.length;
      this.numberOfUnawardedJobsite = this.dataOfUnawardedJobsite.length;
      this.numberOfAwardedJobsite = this.dataOfAwardedJobsite.length;
      this.numberOfCompletedJobsite = this.dataOfCompletedJobsite.length;
      this.numberOfCancelledJobsite = this.dataOfCancelledJobsite.length;

    });
    if (!this.selectedState) {
      this.pieChartDataForJobsite = [this.numberOfDraftedJobsite, this.numberOfAwardedJobsite, this.numberOfUnawardedJobsite, this.numberOfCancelledJobsite, this.numberOfCompletedJobsite];
    }

    if (this.selectedState && (this.selectedType.value === 'all' || this.selectedType.value === 'jobsite')) {
      this.dataOfAwardedJobsite = this.dataOfAwardedJobsite.filter(e => e.state === this.selectedState);
      this.dataOfUnawardedJobsite = this.dataOfUnawardedJobsite.filter(e => e.state === this.selectedState);
    }
  }

  groupByStatusJobMethod(data) {
    this.groupByStatusJob = [];
    const records = data;
    const pipedRecords = new Subject();
    const result = pipedRecords.pipe(
      groupBy(
        (x: any) => x.status,
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
      this.groupByStatusJob.push(x);
    });

    records.forEach(x => pipedRecords.next(x));
    pipedRecords.complete();
  }

  setJobChartData(jobData) {
    this.dataOfDraftedJob = [];
    this.dataOfAwardedJob = [];
    this.dataOfUnawardedJob = [];
    this.dataOfCancelledJob = [];
    this.dataOfCompletedJob = [];

    jobData.forEach(element => {
      if (element.status === 'DRAFT') {
        this.dataOfDraftedJob.push(element);
      }
      if (element.status === 'POSTED') {
        this.dataOfUnawardedJob.push(element);
      }
      if (element.status === 'IN_PROGRESS') {
        this.dataOfAwardedJob.push(element);
      }
      if (element.status === 'COMPLETED') {
        this.dataOfCompletedJob.push(element);
      }
      if (element.status === 'CANCELLED') {
        this.dataOfCancelledJob.push(element);
      }

      this.numberOfDraftedJob = this.dataOfDraftedJob.length;
      this.numberOfUnawardedJob = this.dataOfUnawardedJob.length;
      this.numberOfAwardedJob = this.dataOfAwardedJob.length;
      this.numberOfCompletedJob = this.dataOfCompletedJob.length;
      this.numberOfCancelledJob = this.dataOfCancelledJob.length;

    });
    if (!this.selectedState) {
      this.pieChartDataForJob = [this.numberOfDraftedJob, this.numberOfAwardedJob, this.numberOfUnawardedJob, this.numberOfCancelledJob, this.numberOfCompletedJob];
    }

    if (this.selectedState && (this.selectedType.value === 'all' || this.selectedType.value === 'job')) {
      this.dataOfAwardedJob = this.dataOfAwardedJob.filter(e => e.state === this.selectedState);
      this.dataOfUnawardedJob = this.dataOfUnawardedJob.filter(e => e.state === this.selectedState);
    }
  }

  groupByStatusUserMethod(data) {
    this.groupByStatusUser = [];
    const records = data;
    const pipedRecords = new Subject();
    const result = pipedRecords.pipe(
      groupBy(
        (x: any) => x.roleName,
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
      this.groupByStatusUser.push(x);
    });

    records.forEach(x => pipedRecords.next(x));
    pipedRecords.complete();
  }


  getUserChartData() {
    this.userService.getUserCountForDashboard().subscribe(
      (data) => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.setUserChartData(data.data);
        } else {
        }
      },
      (error) => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      });
  }

  setUserChartData(data) {
    this.numberOfClient = data.clientUserCount;
    this.numberOfWorker = data.workerUserCount;
    this.numberOfSubcontractor = data.subcontractorUserCount;
    this.pieChartDataForUser = [this.numberOfClient, this.numberOfSubcontractor, this.numberOfWorker];
    this.totalUsers = this.numberOfClient + this.numberOfSubcontractor + this.numberOfWorker;
  }

  onStateSelect(event) {
    if (this.selectedState === 'All') {
      this.selectedState = null;
    }
    this.loadDataForProject();
  }

  onTypeSelect(event) {
    this.loadDataForProject();
  }

  onStateUnselect(event) {
    this.loadDataForProject();
  }

  getRevenueData() {
    this.invoiceOfMonth = [];
    this.invoiceOfYear = [];
    this.invoiceOfTillNow = [];
    this.dashboardService.getDashboardRevenueforAdmin().subscribe(data => {
      let temp = [];
      let temp1 = [];
      this.currentDate = data.data.currentDate;

      if (data.data.lstInvoiceByMonth) {
        this.invoiceOfMonth = this.sortData(data.data.lstInvoiceByMonth);
      }

      if (data.data.lstInvoiceByYear) {
        this.invoiceOfYear = this.sortData(data.data.lstInvoiceByYear);
      }

      if (data.data.lstInvoiceTillNow) {
        this.invoiceOfTillNow = this.sortData(data.data.lstInvoiceTillNow);
      }

      this.invoiceOfMonth.forEach(element => {
        const datePipe = new DatePipe('en-US');
        const value1 = datePipe.transform(element.invoiceDate, 'yyyy-MM-dd');

        let index = temp.indexOf(value1);

        if (index === -1) {
          temp.push(value1);
          temp1.push(element.invoiceAmount);
        }
        else {
          temp1[index] += element.invoiceAmount;
        }
      });
      this.barChartLabelsForRevenue = temp;

      this.barChartDataForRevenue = [
        { data: temp1, label: 'Revenue' }
      ];
    });
  }

  sortData(data) {
    return data.sort((a, b) => {
      return <any>new Date(b.invoiceDate) - <any>new Date(a.invoiceDate);
    });
  }

  onChangeTypeOfRevenue(event) {

    if (this.selectedTypeForChart === 'month') {
      this.setDataOfMonthRevenue();
    }

    if (this.selectedTypeForChart === 'year') {
      this.setDataOfYearRevenue();
    }

    if (this.selectedTypeForChart === 'tillNow') {
      this.setDataOfTillNowRevenue();
    }
  }

  setDataOfMonthRevenue() {

    let temp = [];
    let temp1 = [];
    this.invoiceOfMonth.forEach(element => {
      const datePipe = new DatePipe('en-US');
      const value1 = datePipe.transform(element.invoiceDate, 'yyyy-MM-dd');

      let index = temp.indexOf(value1);

      if (index === -1) {
        temp.push(value1);
        temp1.push(element.invoiceAmount);
      }
      else {
        temp1[index] += element.invoiceAmount;
      }
    });

    this.barChartLabelsForRevenue = temp;
    this.barChartDataForRevenue = [
      { data: temp1, label: 'Revenue' }
    ];
  }


  setDataOfYearRevenue() {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    let temp = [];
    let temp1 = [];

    this.invoiceOfYear.forEach(element => {
      const datePipe = new DatePipe('en-US');
      const value1 = datePipe.transform(element.invoiceDate, 'yyyy-MM-dd');
      let date = new Date(value1);
      let index = temp.indexOf(monthNames[date.getUTCMonth()]);
      if (index === -1) {
        temp.push(monthNames[date.getUTCMonth()]);
        temp1.push(element.invoiceAmount);
      }
      else {
        temp1[index] += element.invoiceAmount;
      }
    });
    this.barChartLabelsForRevenue = temp;
    this.barChartDataForRevenue = [
      { data: temp1, label: 'Revenue' }
    ];
  }

  setDataOfTillNowRevenue() {

    let temp = [];
    let temp1 = [];

    this.invoiceOfTillNow.forEach(element => {
      const datePipe = new DatePipe('en-US');
      const value1 = datePipe.transform(element.invoiceDate, 'yyyy-MM-dd');
      let date = new Date(value1);
      let index = temp.indexOf(date.getUTCFullYear());
      if (index === -1) {
        temp.push(date.getUTCFullYear());
        temp1.push(element.invoiceAmount);
      }
      else {
        temp1[index] += element.invoiceAmount;
      }
    });
    this.barChartLabelsForRevenue = temp;
    this.barChartDataForRevenue = [
      { data: temp1, label: 'Revenue' }
    ];
  }


  openProjectInvoices() {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_PROJECT_INVOICES);
  }

  openJobInvoices() {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_JOB_INVOICES);
  }

  openProjectRatingReview() {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_PROJECT_RATING_AND_REVIEW);
  }

  openJobRatingReview() {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_JOB_RATING_AND_REVIEW);
  }

  openManageWorkerCertificates() {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_WORKER_LIST);
  }

  openManageSubcontractorCertificates() {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_SUBCONTRACTOR_LIST);
  }

  openClientList() {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_CLIENT_LIST);
  }

  openClientListForJob() {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_CLIENT_LIST_JOB);
  }

  getLastLoginDetailByUserId() {
    let loggedInUserId = this.localStrorageService.getLoginUserId();
    this.loginHistoryService.getLastLoginDetailById(loggedInUserId).subscribe(
      data => {
        if (data.statusCode === '200' && data.message == 'OK') {
          this.lastLoginDate = data.data;
        }
        else {
          this.lastLoginDate = null;
        }
      },
      error => {
        this.lastLoginDate = null;
      }
    );
  }

  menuAccess(): void {
    const accessPermission1 = this.userAccess.filter(e => e.menuName == 'Subcontractors');
    if (accessPermission1[0].canView) {
      this.subcontractorBtnDisabled = false;
    }
    else {
      this.subcontractorBtnDisabled = true;
    }

    const accessPermission2 = this.userAccess.filter(e => e.menuName == 'Workers');
    if (accessPermission2[0].canView) {
      this.workerBtnDisabled = false;
    }
    else {
      this.workerBtnDisabled = true;
    }

    const accessPermission3 = this.userAccess.filter(e => e.menuName == 'Clients');
    if (accessPermission3[0].canView) {
      this.clientBtnDisabled = false;
    }
    else {
      this.clientBtnDisabled = true;
    }

    const accessPermission4 = this.userAccess.filter(e => e.menuName == 'Projects');
    if (accessPermission4[0].canView) {
      this.projectBtnDisabled = false;
    }
    else {
      this.projectBtnDisabled = true;
    }

    const accessPermission5 = this.userAccess.filter(e => e.menuName == 'Jobs');
    if (accessPermission5[0].canView) {
      this.jobBtnDisabled = false;
    }
    else {
      this.jobBtnDisabled = true;
    }
  }
}
