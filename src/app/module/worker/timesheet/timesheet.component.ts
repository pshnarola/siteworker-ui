import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver/dist/FileSaver';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { concatMap, groupBy, map, toArray } from 'rxjs/operators';
import { DateHelperService } from 'src/app/service/date-helper.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { TimesheetService } from 'src/app/service/worker-services/timesheet.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { WorkerSidebarJobListService } from 'src/app/shared/worker-sidebar-job-list.service';
import { TimesheetGroupByDTO } from '../../admin/vos/TimesheetGroupByDTO';

@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.css']
})
export class TimesheetComponent implements OnInit {

  jobDetail: any;
  isSelectedJob: boolean;
  subscription = new Subscription();
  endDate;
  columns = [{ label: 'Posted By', value: 'client.firstName', sortable: true, isHidden: false },
  { label: 'Job Title', value: 'jobBidDetail.jobDetail.title', sortable: true, isHidden: false },
  { label: 'City', value: 'jobBidDetail.jobDetail.city', sortable: true, isHidden: false },
  { label: 'State', value: 'jobBidDetail.jobDetail.state', sortable: true, isHidden: false },
  { label: 'Work Week', value: 'weekStart', sortable: true, isHidden: false },
  { label: 'Status', value: 'status', sortable: true, isHidden: false },
  { label: 'View Timesheet', value: 'view_timesheet', sortable: false, isHidden: false },
  { label: 'View Invoice', value: 'view_invoice', sortable: false, isHidden: false },
  ];

  isFilterOpened = false;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  totalRecords;

  filterForm: FormGroup;

  status = [
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Requested', value: 'REQUESTED' },
  ];

  filteredStatus: any;
  datatableParam: DataTableParam;
  queryParam: URLSearchParams;
  timesheetList = [];
  jobTitle: any;
  startDate;
  myForm: FormGroup;
  dateErrorFlag: boolean;
  globalFilter: string;
  timesheetGroupByDTOList: TimesheetGroupByDTO[] = [];
  groupedTimesheetList: any;
  groupedTimesheetListWorker: any[];
  groupedWorkerWorkWeekTimesheet = [];
  constructor(private captionChangeService: HeaderManagementService,
    private workerSideBarJobListService: WorkerSidebarJobListService,
    private formBuilder: FormBuilder,
    private localStorageService: LocalStorageService,
    private timesheetService: TimesheetService,
    private router: Router,
    private dateHelperService: DateHelperService,
    private translator: TranslateService,
    private notificationService: UINotificationService) {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.datatableParam = new DataTableParam();
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.subscription.add(this.workerSideBarJobListService.workerSidebarJobChanged.subscribe(data => {
      const job = this.localStorageService.getItem('workerSelectedJob');
      if (job) {
        if (job.id === 'jobId') {
          this.isSelectedJob = false;
          this.jobDetail = null;
          this.jobTitle = null;
        }
        else {
          this.jobDetail = job;
          this.isSelectedJob = true;
          this.jobTitle = job.title;
        }
      }
      else {
        this.isSelectedJob = false;
        this.jobDetail = null;
        this.jobTitle = null;
      }
      this.setDefaultCriteria();
    }));
    this.initializeForm();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.localStorageService.removeItem('workerSelectedJob');
  }
  setDefaultCriteria(): void {
    const filterMap = new Map();
    if (this.jobDetail) {
      filterMap.set('JOB_ID', this.jobDetail.id);
    }
    let loggedInUserId = this.localStorageService.getLoginUserId();
    filterMap.set('WORKER_ID', loggedInUserId);
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
      startDate: [],
      endDate: [],
      status: []
    });
  }

  filter(): void {
    const filterMap = new Map();
    const loggedInUserId = this.localStorageService.getLoginUserId();
    filterMap.set('WORKER_ID', loggedInUserId);
    if (this.isSelectedJob) {
      filterMap.set('JOB_ID', this.jobDetail.id);
    }
    this.localStorageService.setItem('filter', Array.from(filterMap));
    const datePipe = new DatePipe('en-US');
    this.dateErrorFlag = false;
    if (((this.myForm.value.startDate && !this.myForm.value.endDate) ||
      (!this.myForm.value.startDate && this.myForm.value.endDate))) {
      this.dateErrorFlag = true;
    }

    if (!this.myForm.value.startDate && !this.myForm.value.endDate) {
      this.dateErrorFlag = false;
    }
    if (this.myForm.value.startDate) {
      this.dateHelperService.setStartDate(this.myForm.value.startDate);
      const value = datePipe.transform(this.myForm.value.startDate, 'yyyy-MM-dd HH:mm:ss');
      filterMap.set('WORK_START_DATE', value);
    }
    if (this.myForm.value.endDate) {
      this.dateHelperService.setEndDate(this.myForm.value.endDate);
      const valueEnd = datePipe.transform(this.myForm.value.endDate, 'yyyy-MM-dd HH:mm:ss');
      filterMap.set('WORK_END_DATE', valueEnd);
    }
    if (this.myForm.value.status) {
      filterMap.set('STATUS', this.myForm.value.status.value);
    }
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    if (!this.dateErrorFlag) {

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
    else {
      this.notificationService.error(this.translator.instant('please.enter.appropriate.date.range'), '');
    }
  }

  onFilterClear(): void {
    this.myForm.reset();
    this.setDefaultCriteria();
  }

  onFilterOpen(): void {
    this.isFilterOpened = !this.isFilterOpened;
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
      this.groupByJobTimesheet();
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
        if (!this.groupedWorkerWorkWeekTimesheet.some(item => item.workWeek === data.workWeek && item.worker.id === data.worker.id && item.jobBidDetail.jobDetail.id === data.jobBidDetail.jobDetail.id)) {
          this.groupedWorkerWorkWeekTimesheet.push(data);
        }
      });
    });
  }
  groupByJobTimesheet(): void {
    this.groupedTimesheetListWorker = [];
    this.groupedWorkerWorkWeekTimesheet = [];
    const records = this.timesheetGroupByDTOList;
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
    this.localStorageService.setItem('timesheetData', data);
    this.router.navigate([PATH_CONSTANTS.TIMESHEET_DETAILS]);
  }
  viewInvoice(workerId, jobBidDetailId, weekStart, weekEnd): void {
    let datePipe = new DatePipe('en-US');
    const value = datePipe.transform(weekStart, 'yyyy-MM-dd HH:mm:ss');
    const valueEnd = datePipe.transform(weekEnd, 'yyyy-MM-dd HH:mm:ss');

    let downloadParam = {
      workerId,
      jobBidDetailId,
      weekStart: value,
      weekEnd: valueEnd
    };
    let queryParamForDownload = this.prepareQueryParam(downloadParam);
    this.timesheetService.downloadInvoice(queryParamForDownload).subscribe(data => {
      const blob = new Blob([data], { type: 'application/pdf' });
      const fileName = 'Invoice';
      saveAs(blob, fileName);
      this.getTimesheetData();
    });
  }
}
