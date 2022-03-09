import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChartOptions, ChartType } from 'chart.js';
import { Label, SingleDataSet } from 'ng2-charts';
import { ReplaySubject, Subject } from 'rxjs';
import { concatMap, groupBy, map, toArray } from 'rxjs/operators';
import { StateService } from 'src/app/service/admin-services/state/state.service';
import { DashboardService } from 'src/app/service/dashboard-services/dashboard.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { JobBidService } from 'src/app/service/worker-services/job-bid.service';
import { TimesheetService } from 'src/app/service/worker-services/timesheet.service';
import { WorkerProfileDetailService } from 'src/app/service/worker-services/worker-profile-detail/worker-profile-detail.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { WorkerSidebarJobListService } from 'src/app/shared/worker-sidebar-job-list.service';
import { TimesheetGroupByDTO } from '../../admin/vos/TimesheetGroupByDTO';

@Component({
  selector: 'app-worker-dashboard',
  templateUrl: './worker-dashboard.component.html',
  styleUrls: ['./worker-dashboard.component.css']
})
export class WorkerDashboardComponent implements OnInit, OnDestroy {

  selectedState: any;
  totalPaidInvoice = 0;
  totalDueInvoice = 0;
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

  todayDate = new Date();
  lat = 40.730610;
  lng = -73.935242;

  workerProfile: any;

  defaultState = {
    name: 'All'
  };

  totalJob = 0;
  totalTimesheet = 0;
  totalInvoice = 0;
  onGoingJobs = 0;
  jobSuccessRatio: any;
  isFromList = false;

  completedJobs = [];
  acceptedJobs = [];

  requiredCertificates = [];

  jobs = [];

  pendingInvitation = [];

  favoriteJob = [];

  pendingTimesheet = [];

  timesheetData = [];

  selectedType = 'week';

  // data for week job variable
  weekData = [];
  groupByWeekJob = [];
  numberOfAppliedWeekJob = 0;
  numberOfAwardedWeekJob = 0;
  numberOfAcceptedWeekJob = 0;

  // data for month job variable
  monthData = [];
  groupByMonthJob = [];
  numberOfAppliedMonthJob = 0;
  numberOfAwardedMonthJob = 0;
  numberOfAcceptedMonthJob = 0;

  // data for year job variable
  yearData = [];
  groupByYearJob = [];
  numberOfAppliedYearJob = 0;
  numberOfAwardedYearJob = 0;
  numberOfAcceptedYearJob = 0;

  // data for invoices variable
  groupByStatusInvoices = [];
  numberOfDueInvoices = 0;
  numberOfPaidInvoices = 0;

  // load job bid detail
  filterMapForJob = new Map();
  globalFilterForJob;
  dataTableParamForJob: DataTableParam;
  queryParamForJob;

  groupedTimesheetList = [];
  groupedTimesheetListWorker = [];
  groupedWorkerWorkWeekTimesheet = [];

  pieChartColorsForJob = [
    {
      backgroundColor: ['rgb(255,148,150)', 'rgb(91,203,112)', 'rgb(184,158,126)'],
    },
  ];

  pieChartColorsForTimesheet = [
    {
      backgroundColor: ['rgb(255,148,150)', 'rgb(91,203,112)'],
    },
  ];

  pieChartColorsForInvoice = [
    {
      backgroundColor: ['rgb(255,148,150)', 'rgb(91,203,112)'],
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
  public pieChartLabelsForInvoice: Label[] = ['Due', 'Paid'];
  public pieChartDataForInvoice: SingleDataSet = [0, 0];
  public pieChartLabelsForTimesheet: Label[] = ['Approval Pending', 'Approved'];
  public pieChartDataForTimesheet: SingleDataSet = [0, 0];
  public pieChartLabelsForJob: Label[] = ['Applied', 'Awarded', 'Accepted'];
  public pieChartDataForJob: SingleDataSet = [0, 0, 0];
  public pieChartType: ChartType = 'doughnut';
  public pieChartLegend = true;
  public pieChartPlugins = [];

  constructor(private captionChangeService: HeaderManagementService,
    private stateService: StateService,
    private jobBidService: JobBidService,
    private router: Router,
    private workerProfileDetailService: WorkerProfileDetailService,
    private localStrorageService: LocalStorageService,
    private workerSideBarJobListService: WorkerSidebarJobListService,
    private timesheetService: TimesheetService,
    private dashboardService: DashboardService) {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.DASHBOARD);
    this.captionChangeService.hideSidebarSubject.next(true);
  }

  ngOnDestroy(): void {
    this.captionChangeService.hideSidebarSubject.next(false);
    if (!this.isFromList) {
      this.localStrorageService.removeItem('workerSelectedJob');
    }
  }

  ngOnInit(): void {
    this.getStateList();
    this.loadDataForDashboard();
    this.setParamForBidDetail();
    this.getWorkerProfileDetail();
    this.getTimesheetDetailById();
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.DASHBOARD);
    this.captionChangeService.hideSidebarSubject.next(true);
  }

  getWorkerProfileDetail() {
    let id = this.localStrorageService.getLoginUserId();
    this.workerProfileDetailService.getWorkerDetail(id).subscribe(data => {
      this.workerProfile = data.data;
      if (this.workerProfile.basicProfile) {
        if (this.workerProfile.basicProfile.latitude !== 0 && this.workerProfile.basicProfile.longitude !== 0) {
          this.lat = this.workerProfile.basicProfile.latitude;
          this.lng = this.workerProfile.basicProfile.longitude;
        }
      }
    });
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

  // tslint:disable-next-line: typedef
  private prepareQueryParam(paramObject) {
    // tslint:disable-next-line: new-parens
    const params = new URLSearchParams;
    // tslint:disable-next-line: forin
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
          if (data.message === 'OK') {
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

  getGapBetweenTwoDates(date1, date2): number {

    const datePipe = new DatePipe('en-US');
    const value1 = datePipe.transform(date1, 'yyyy-MM-dd');
    const value2 = datePipe.transform(date2, 'yyyy-MM-dd');

    const date11 = new Date(value1);
    const date22 = new Date(value2);
    let Difference_In_Time = date11.getTime() - date22.getTime();

    let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

    return Difference_In_Days;
  }

  returnFirstCharacterFromString(data) {
    return data.charAt(0);
  }

  validateJobChart() {
    let count = 0;
    this.pieChartDataForJob.forEach(element => {
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

  validateTimeSheetChart() {
    let count = 0;
    this.pieChartDataForTimesheet.forEach(element => {
      if (element === 0) {
        count++;
      }
    });
    if (count === 2) {
      return false;
    }
    else {
      return true;
    }
  }

  getTimesheetDetailById(): void {
    let id = this.localStrorageService.getLoginUserId();
    this.timesheetService.getApprovedAndRejectedTimesheetByWorkerId(id).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {
        this.timesheetData = [];
        const datePipe = new DatePipe('en-US');
        data.data.forEach(element => {
          const weekStart = datePipe.transform(element.weekStart, 'dd-MM-yyyy');
          const weekEnd = datePipe.transform(element.weekEnd, 'dd-MM-yyyy');
          const workWeek = weekStart + ' - ' + weekEnd;
          const timesheetGroupByDTO = new TimesheetGroupByDTO();
          timesheetGroupByDTO.id = element.id;
          timesheetGroupByDTO.workDate = element.workDate;
          timesheetGroupByDTO.weekStart = element.weekStart;
          timesheetGroupByDTO.weekEnd = element.weekEnd;
          timesheetGroupByDTO.workWeek = workWeek;
          timesheetGroupByDTO.workHour = element.workHour;
          timesheetGroupByDTO.workDescription = element.workDescription;
          timesheetGroupByDTO.totalMilesTravelled = element.totalMilesTravelled;
          timesheetGroupByDTO.nonBillableMiles = element.nonBillableMiles;
          timesheetGroupByDTO.billableMiles = element.billableMiles;
          timesheetGroupByDTO.jobBidDetail = element.jobBidDetail;
          timesheetGroupByDTO.worker = element.worker;
          timesheetGroupByDTO.client = element.client;
          timesheetGroupByDTO.status = element.status;
          timesheetGroupByDTO.approvedDate = element.approvedDate;
          timesheetGroupByDTO.tsheetResposeId = element.tsheetResposeId;
          this.timesheetData.push(timesheetGroupByDTO);
        });
        this.groupByWorkerTimesheet();
        this.setTimesheetChartData();
      }
    });
  }

  groupByWorkWeekTimesheet(groupedTimesheetListWorker): void {
    this.groupedTimesheetList = [];
    const records = groupedTimesheetListWorker;
    const pipedRecords = new Subject();
    const result = pipedRecords.pipe(
      groupBy(
        (x: any) => x.workWeek,
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
      this.groupedWorkerWorkWeekTimesheet.push(element);
    });
  }

  setTimesheetChartData() {
    let requested = 0;
    let approved = 0;
    this.groupedWorkerWorkWeekTimesheet.forEach(element => {
      if (element.value[0].status === 'REQUESTED') {
        requested++;
      }

      if (element.value[0].status === 'APPROVED') {
        approved++;
      }
    });
    this.totalTimesheet = requested + approved;
    this.pieChartDataForTimesheet = [requested, approved];
  }


  groupByWorkerTimesheet(): void {
    this.groupedTimesheetListWorker = [];
    this.groupedWorkerWorkWeekTimesheet = [];
    const records = this.timesheetData;
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
      this.groupedTimesheetListWorker.push(x);
    });
    records.forEach(x => { pipedRecords.next(x); });
    pipedRecords.complete();
    this.groupedTimesheetListWorker.forEach(data => {
      const worker = data.value;
      this.groupByWorkWeekTimesheet(worker);
    });
  }

  // load data for dashboard
  loadDataForDashboard() {
    const userId = this.localStrorageService.getLoginUserId();
    this.dashboardService.getDashboardDetailOfWorker(userId).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {
        this.weekData = data.data.lstWeekJobBidDetail;
        this.monthData = data.data.lstMonthJobBidDetail;
        this.yearData = data.data.lstYearJobBidDetail;
        this.pendingInvitation = data.data.lstRecentPendingJobInvitee;
        this.favoriteJob = data.data.lstRecentFavouriteJobs;
        this.jobSuccessRatio = data.data.workerProfile.jobSuccessRatio;
        this.onGoingJobs = data.data.lstStartedJobs.length;
        this.requiredCertificates = data.data.lstWorkerCertificates;
        this.pendingTimesheet = data.data.lstPendingTsheet;

        // set data for week
        if (this.selectedType === 'week') {
          this.groupByWeekJobMethod(data.data.lstWeekJobBidDetail);
          this.setWeekJobChartData();
        }

        // set data for month
        if (this.selectedType === 'month') {
          this.groupByMonthJobMethod(data.data.lstMonthJobBidDetail);
          this.setMonthJobChartData();
        }

        // set data for year
        if (this.selectedType === 'year') {
          this.groupByYearJobMethod(data.data.lstYearJobBidDetail);
          this.setYearJobChartData();
        }

        // set data for invoices
        this.groupByStatusInvoiceMethod(data.data.lstInvoice);
        this.setInvoiceChartData();
        this.setTotalInvoice(data.data.lstInvoice);

      }
    });
  }

  setTotalInvoice(data) {
    let total = 0;
    data.forEach(element => {
      total += element.invoiceAmount;
    });
    this.totalInvoice = total;
  }

  onSelectedTypeChange(event) {
    // set data for week
    if (this.selectedType === 'week') {
      this.groupByWeekJobMethod(this.weekData);
      this.setWeekJobChartData();
    }

    // set data for month
    if (this.selectedType === 'month') {
      this.groupByMonthJobMethod(this.monthData);
      this.setMonthJobChartData();
    }

    // set data for year
    if (this.selectedType === 'year') {
      this.groupByYearJobMethod(this.yearData);
      this.setYearJobChartData();
    }
  }


  groupByWeekJobMethod(data) {
    this.groupByWeekJob = [];
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
      this.groupByWeekJob.push(x);
    });

    records.forEach(x => pipedRecords.next(x));
    pipedRecords.complete();
  }

  setWeekJobChartData() {
    let count = 0;
    this.groupByWeekJob.forEach(element => {
      if (element.key === 'APPLIED') {
        this.numberOfAppliedWeekJob = element.value.length;
        count += element.value.length;
      }
      if (element.key === 'OFFERED') {
        this.numberOfAwardedWeekJob = element.value.length;
        count += element.value.length;
      }
      if (element.key === 'ACCEPTED') {
        this.numberOfAcceptedWeekJob = element.value.length;
        count += element.value.length;
      }
    });
    this.totalJob = count;
    this.pieChartDataForJob = [
      this.numberOfAppliedWeekJob,
      this.numberOfAwardedWeekJob,
      this.numberOfAcceptedWeekJob
    ];
  }

  groupByMonthJobMethod(data) {
    this.groupByMonthJob = [];
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
      this.groupByMonthJob.push(x);
    });

    records.forEach(x => pipedRecords.next(x));
    pipedRecords.complete();
  }

  setMonthJobChartData() {
    let count = 0;
    this.groupByMonthJob.forEach(element => {
      if (element.key === 'APPLIED') {
        this.numberOfAppliedMonthJob = element.value.length;
        count += element.value.length;
      }
      if (element.key === 'OFFERED') {
        this.numberOfAwardedMonthJob = element.value.length;
        count += element.value.length;
      }
      if (element.key === 'ACCEPTED') {
        this.numberOfAcceptedMonthJob = element.value.length;
        count += element.value.length;
      }
    });
    this.totalJob = count;
    this.pieChartDataForJob = [
      this.numberOfAppliedMonthJob,
      this.numberOfAwardedMonthJob,
      this.numberOfAcceptedMonthJob
    ];
  }

  groupByYearJobMethod(data) {
    this.groupByYearJob = [];
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
      this.groupByYearJob.push(x);
    });

    records.forEach(x => pipedRecords.next(x));
    pipedRecords.complete();
  }

  setYearJobChartData() {
    let count = 0;
    this.groupByYearJob.forEach(element => {
      if (element.key === 'APPLIED') {
        this.numberOfAppliedYearJob = element.value.length;
        count += element.value.length;
      }
      if (element.key === 'OFFERED') {
        this.numberOfAwardedYearJob = element.value.length;
        count += element.value.length;
      }
      if (element.key === 'ACCEPTED') {
        this.numberOfAcceptedYearJob = element.value.length;
        count += element.value.length;
      }
    });
    this.totalJob = count;
    this.pieChartDataForJob = [
      this.numberOfAppliedYearJob,
      this.numberOfAwardedYearJob,
      this.numberOfAcceptedYearJob
    ];
  }

  // data for invoices
  groupByStatusInvoiceMethod(data) {
    this.groupByStatusInvoices = [];
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
      this.groupByStatusInvoices.push(x);
    });

    records.forEach(x => pipedRecords.next(x));
    pipedRecords.complete();
  }

  setInvoiceChartData() {
    let totalPaid = 0;
    let totalDue = 0;
    this.groupByStatusInvoices.forEach(element => {
      if (element.key === 'DUE') {
        element.value.forEach(element => {
          totalDue += element.invoiceAmount;
        });
        this.totalDueInvoice = totalDue;
        this.numberOfDueInvoices = element.value.length;
      }
      if (element.key === 'PAID') {
        element.value.forEach(element => {
          totalPaid += element.invoiceAmount;
        });
        this.totalPaidInvoice = totalPaid;
        this.numberOfPaidInvoices = element.value.length;
      }
    });
    this.pieChartDataForInvoice = [this.numberOfDueInvoices, this.numberOfPaidInvoices];
  }

  validateInvoiceChart() {
    let count = 0;
    this.pieChartDataForInvoice.forEach(element => {
      if (element === 0) {
        count++;
      }
    });
    if (count === 2) {
      return false;
    }
    else {
      return true;
    }
  }

  onStateSelect(event) {

    if (this.selectedState.name === 'All') {
      this.selectedState = null;
    }

    this.setParamForBidDetail();
  }

  onStateUnselect(event) {
    this.setParamForBidDetail();
  }

  setParamForBidDetail() {
    this.filterMapForJob.clear();
    const loggedInUserId = this.localStrorageService.getLoginUserId();
    this.filterMapForJob.set('WORKER_ID', loggedInUserId);
    if (this.selectedState) {
      this.filterMapForJob.set('JOB_DETAIL_STATE', this.selectedState.name);
    }
    const jsonObject = {};
    this.filterMapForJob.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilterForJob = JSON.stringify(jsonObject);
    this.dataTableParamForJob = {
      offset: 0,
      size: 100000,
      sortField: 'CREATED_DATE',
      sortOrder: 0,
      searchText: this.globalFilterForJob
    };
    this.getJobBidDetail();
  }


  getJobBidDetail(): void {
    this.queryParamForJob = this.prepareQueryParam(this.dataTableParamForJob);
    this.jobBidService.getJobBidDetail(this.queryParamForJob).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {
        this.groupByStatusJobMethod(data.data.result);
        this.setJobData();
      }
    });
  }

  groupByStatusJobMethod(data) {
    this.jobs = [];
    const records = data;
    const pipedRecords = new Subject();
    const result = pipedRecords.pipe(
      groupBy(
        (x: any) => x.jobBidDetail.status,
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
      this.jobs.push(x);
    });

    records.forEach(x => pipedRecords.next(x));
    pipedRecords.complete();
  }

  setJobData() {
    this.acceptedJobs = [];
    this.completedJobs = [];
    this.jobs.forEach(element => {
      if (element.key === 'ACCEPTED') {
        this.acceptedJobs = element.value;
      }
      else {
        this.completedJobs.length = 0;
        element.value.forEach(element1 => {
          if (element1.jobBidDetail.jobDetail.status === 'COMPLETED') {
            this.completedJobs.push(element1);
          }
        });
      }
    });
  }

  reditectToBidAndApply(job) {
    this.isFromList = true;
    this.workerSideBarJobListService.workerSidebarJobChanged.next(job);
    this.localStrorageService.setItem('workerSelectedJob', job);
    this.router.navigate(['/worker/apply-for-job']);
  }

  redirectFromDashboardCard(card) {
    if (card === 'job') {
      this.router.navigate(['/worker/job-list']);
    } else if (card === 'timesheet') {
      this.router.navigate(['/worker/timesheet']);
    } else {
      this.router.navigate(['/worker/invoices']);
    }
  }

}
