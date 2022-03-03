import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { concatMap, groupBy, map, toArray } from 'rxjs/operators';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { DateHelperService } from 'src/app/service/date-helper.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { TimesheetService } from 'src/app/service/worker-services/timesheet.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { User } from 'src/app/shared/vo/User';
import { TimesheetGroupByDTO } from '../../admin/vos/TimesheetGroupByDTO';

@Component({
  selector: 'app-client-job-time-sheet',
  templateUrl: './client-job-time-sheet.component.html',
  styleUrls: ['./client-job-time-sheet.component.css']
})
export class ClientJobTimeSheetComponent implements OnInit, OnDestroy {
  myForm: FormGroup;
  columns = [{ label: 'Worker', value: 'worker.firstName', sortable: true, isHidden: false, field: 'worker' },
  { label: 'Job Title', value: 'jobBidDetail.jobDetail.title', sortable: true, isHidden: false, field: 'title' },
  { label: 'Work Week', value: 'weekStart', sortable: true, isHidden: false, field: 'workWeek' },
  { label: 'Employment Type', value: 'jobBidDetail.jobDetail.employmentType', sortable: true, isHidden: false, field: 'employmentType' },
  { label: 'Region', value: 'jobBidDetail.jobDetail.region', sortable: true, isHidden: false, field: 'region' },
  { label: 'View Timesheet', value: 'timsheet', sortable: false, isHidden: false, field: 'timsheet' },
  { label: 'Status', value: 'status', sortable: true, isHidden: false, field: 'status' },
  ];
  isFilterOpened = false;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  totalRecords: 2;
  jobTitle: any;
  isSelectedJob: boolean;
  selectedJob: any;
  jobStatus;
  workWeekStartDate;
  filteredEmployeeType: any;
  filteredStatus: any;
  timesheets: any[];
  subscription = new Subscription();
  status = [
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Requested', value: 'REQUESTED' }
  ];
  employeeType = [
    { label: 'Temporary Worker - 1099', value: 'WORKER_1099' },
    { label: 'Temporary Worker - W2', value: 'WORKER_W2' },
  ];
  datatableParam: DataTableParam;
  queryParam: URLSearchParams;
  timesheetList = [];
  startDate;
  dateErrorFlag: boolean;
  globalFilter: string;
  weekErrorFlag: boolean;
  workWeekEndDate: Date;
  workerNameParams: { name: any; };
  filterWorkers: any;
  timesheetGroupByDTOList: TimesheetGroupByDTO[] = [];
  groupedTimesheetList: any;
  groupedTimesheetListWorker: any[];
  groupedWorkerWorkWeekTimesheet = [];
  constructor(private formBuilder: FormBuilder,
    private captionChangeService: HeaderManagementService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private timesheetService: TimesheetService,
    private dateHelperService: DateHelperService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private filterLeftPanelService: FilterLeftPanelDataService) {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.datatableParam = new DataTableParam();
    this.datatableParam = {
      offset: 0,
      size: 10000,
      sortField: 'CREATED_DATE',
      sortOrder: 1,
      searchText: null
    };
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.initializeForm();
    this.getSelectedJobDetails();
    this.myForm.get('workerWeekStart').valueChanges.subscribe(data => {
      this.workWeekEndDate = new Date(data);
      this.workWeekEndDate.setDate(this.workWeekEndDate.getDate() + 6);
      if (data === undefined) {
        this.myForm.get('workerWeekEnd').patchValue(null);
      }
      else {
        this.myForm.get('workerWeekEnd').patchValue(this.workWeekEndDate);
      }
    });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  setDefaultCriteria(): void {
    const filterMap = new Map();
    let user = this.localStorageService.getLoginUserObject() as User;
    let loggedInUserId = this.localStorageService.getLoginUserId();
    filterMap.set('WITHOUT_CANCELLED_AND_COMPLETED', ['COMPLETED', 'CANCELLED'].toString());
    if (user.roles[0].roleName === 'SUPERVISOR') {
      let clientOfLoggedInSupervisor = this.localStorageService.getItem('clientOfLoggedInSupervisor');
      filterMap.set('SUPERVISOR_ID_FOR_TIMESHEET', loggedInUserId);
      filterMap.set('USER_ID', clientOfLoggedInSupervisor.id);
    }
    else {
      filterMap.set('USER_ID', loggedInUserId);
    }
    if (this.selectedJob) {
      filterMap.set('JOB_ID', this.selectedJob.id);
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
  initializeForm(): void {
    this.myForm = this.formBuilder.group({
      workerWeekStart: [],
      workerWeekEnd: [],
      employmentType: [],
      workerName: [],
      status: []
    });
  }
  filter(): void {
    const filterMap = new Map();
    const filterWorkersFromList = [];
    const loggedInUserId = this.localStorageService.getLoginUserId();
    this.dateErrorFlag = false;
    filterMap.set('WITHOUT_CANCELLED_AND_COMPLETED', ['COMPLETED', 'CANCELLED'].toString());
    let user = this.localStorageService.getLoginUserObject() as User;
    if (user.roles[0].roleName === 'SUPERVISOR') {
      let clientOfLoggedInSupervisor = this.localStorageService.getItem('clientOfLoggedInSupervisor');
      filterMap.set('SUPERVISOR_ID_FOR_TIMESHEET', loggedInUserId);
      filterMap.set('USER_ID', clientOfLoggedInSupervisor.id);
    }
    else {
      filterMap.set('USER_ID', loggedInUserId);
    }

    if (this.selectedJob) {
      filterMap.set('JOB_ID', this.selectedJob.id);
    }
    const datePipe = new DatePipe('en-US');
    if (((this.myForm.value.workerWeekStart && !this.myForm.value.workerWeekEnd) ||
      (!this.myForm.value.workerWeekStart && this.myForm.value.workerWeekEnd))) {
      this.weekErrorFlag = true;
    }

    if (!this.myForm.value.workerWeekStart && !this.myForm.value.workerWeekEnd) {
      this.weekErrorFlag = false;
    }
    if (this.myForm.value.workerWeekStart) {
      this.dateHelperService.setStartDate(this.myForm.value.workerWeekStart);
      const value = datePipe.transform(this.myForm.value.workerWeekStart, 'yyyy-MM-dd HH:mm:ss');
      filterMap.set('WEEK_START', value);
    }
    if (this.myForm.value.workerWeekEnd) {
      this.dateHelperService.setEndDate(this.myForm.value.workerWeekEnd);
      const valueEnd = datePipe.transform(this.myForm.value.workerWeekEnd, 'yyyy-MM-dd HH:mm:ss');
      filterMap.set('WEEK_END', valueEnd);
    }
    if (this.myForm.value.status) {
      filterMap.set('STATUS', this.myForm.value.status.value);
    }
    if (this.myForm.value.employmentType) {
      filterMap.set('EMPLOYMENT_TYPE', this.myForm.value.employmentType.value);
    }
    if (this.myForm.value.workerName) {
      this.myForm.value.workerName.forEach(element => {
        filterWorkersFromList.push(element.id);
        filterMap.set('WORKER_ID', filterWorkersFromList.toString());
      });
    }
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    if (!this.weekErrorFlag) {

      this.globalFilter = JSON.stringify(jsonObject);
      this.datatableParam = {
        offset: 0,
        size: this.size,
        sortField: '',
        sortOrder: 1,
        searchText: this.globalFilter
      };
      this.getTimesheetData();
    }
    else {
      this.notificationService.error(this.translator.instant('please.enter.appropriate.date.range'), '');
    }
  }
  onFilterClear(): void {
    this.myForm.reset();
    const emptyArray = [];
    this.myForm.get('workerName').patchValue(emptyArray);
    this.setDefaultCriteria();
  }
  onFilterOpen(): void {
    this.isFilterOpened = !this.isFilterOpened;
  }
  getWorkerByName(name): void {
    this.workerNameParams = {
      name: name.query
    };
    this.queryParam = this.prepareQueryParam(this.workerNameParams);
    this.filterLeftPanelService.getWorkerByName(this.queryParam).subscribe(data => {
      this.filterWorkers = data.data;
      this.filterWorkers = this.filterWorkers.sort();
    });
  }
  filterStatus(event): void {
    const filtered: any[] = [];
    const query = event.query;
    for (let i = 0; i < this.status.length; i++) {
      const status = this.status[i];
      if (status.label.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(status);
      }
    }
    this.filteredStatus = filtered;
    this.filteredStatus = this.filteredStatus.sort();
  }
  filterEmployeeType(event): void {
    const filtered: any[] = [];
    const query = event.query;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.employeeType.length; i++) {
      const employeType = this.employeeType[i];
      if (employeType.label.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(employeType);
      }
    }
    this.filteredEmployeeType = filtered;
    this.filteredEmployeeType = this.filteredEmployeeType.sort();
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
  getTimesheetData(): void {
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.timesheetService.getTimesheetList(this.queryParam).subscribe(data => {
      this.timesheetList = data.data.result;
      this.timesheetGroupByDTOList = [];
      const datePipe = new DatePipe('en-US');
      this.timesheetList.forEach(element => {
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
        this.timesheetGroupByDTOList.push(timesheetGroupByDTO);
      });
      this.groupByWorkerTimesheet();
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
    // tslint:disable-next-line: deprecation
    result.subscribe(x => {
      this.groupedTimesheetList.push(x);
    });
    records.forEach(x => {
      pipedRecords.next(x);
    });
    pipedRecords.complete();
    this.groupedTimesheetList.forEach(element => {
      element.value.forEach(data => {
        // tslint:disable-next-line: max-line-length
        if (!this.groupedWorkerWorkWeekTimesheet.some(item => item.workWeek === data.workWeek && item.worker.id === data.worker.id && item.jobBidDetail.jobDetail.id === data.jobBidDetail.jobDetail.id)) {
          this.groupedWorkerWorkWeekTimesheet.push(data);
        }
      });
    });
  }
  groupByWorkerTimesheet(): void {
    this.groupedTimesheetListWorker = [];
    this.groupedWorkerWorkWeekTimesheet = [];
    const records = this.timesheetGroupByDTOList;
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
    // tslint:disable-next-line: deprecation
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
  viewTimesheetDetails(data): void {
    this.router.navigate([PATH_CONSTANTS.TIMESHEET_DETAILS]);
  }
  getSelectedJobDetails(): void {
    this.subscription.add(this.projectJobSelectionService.selectedJobSubject.subscribe(data => {
      const job = this.localStorageService.getSelectedJob();
      if (job) {
        if (job.id === 'jobId') {
          this.isSelectedJob = false;
          this.selectedJob = null;
          this.jobTitle = null;
        }
        else {
          this.selectedJob = job;
          if (this.selectedJob !== null) {
            this.isSelectedJob = true;
            this.jobTitle = this.selectedJob.title;
          }
        }
      }
      this.setDefaultCriteria();
    }));
  }
  redirectToTimesheetDetails(data): void {
    this.localStorageService.setItem('timesheetData', data);
    this.router.navigate([PATH_CONSTANTS.CLIENT_TIMESHEETDETAILS]);
  }
  redirectToWorker(id): void {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_WORKER_PROFILE + '?user=' + id);
  }
  getFullName(data: User) {
    return data.firstName + ' ' + data.lastName;
  }
}
