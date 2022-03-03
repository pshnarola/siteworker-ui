import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DateHelperService } from 'src/app/service/date-helper.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { InvoiceService } from 'src/app/service/subcontractor-services/invoice.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { User } from 'src/app/shared/vo/User';

@Component({
  selector: 'app-w2-worker-invoice-report',
  templateUrl: './w2-worker-invoice-report.component.html',
  styleUrls: ['./w2-worker-invoice-report.component.css']
})
export class W2WorkerInvoiceReportComponent implements OnInit {
  isFilterOpened: boolean;
  columns;
  dataTableParam = new DataTableParam();
  queryParam;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  totalRecords;
  myForm: FormGroup;
  invoicesList = [];
  globalFilter;
  workWeekEndDate = new Date();
  workWeekStartDate;
  workerNameParams: { name: any; };
  filterWorkers: any;
  weekErrorFlag: boolean;
  employeType = [
    { label: 'Temporary Worker - 1099', value: 'WORKER_1099' },
    { label: 'Temporary Worker - W2', value: 'WORKER_W2' },
  ];
  filteredEmployeType: any[];
  constructor(
    private captionChangeService: HeaderManagementService,
    private formBuilder: FormBuilder,
    private invoiceService: InvoiceService,
    private dateHelperService: DateHelperService,
    private translator: TranslateService,
    private filterLeftPanelService: FilterLeftPanelDataService) {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.W2_REVENUE_REPORT);
  }

  ngOnInit(): void {
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.W2_REVENUE_REPORT);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.setColumnOfTable();
    this.initializeForm();
    this.setDefaultCriteria();
  }
  ngOnDestroy(): void {
    this.captionChangeService.hideSidebarSubject.next(false);

  }
  setColumnOfTable(): void {
    this.columns = [
      { label: 'Worker', value: 'worker.firstName', sortable: true, isHidden: false, field: 'worker', selected: true },
      { label: 'Job Name', value: 'jobBidDetail.jobDetail.title', sortable: true, isHidden: false, field: 'job', selected: true },
      { label: 'Employment Type', value: 'jobBidDetail.jobDetail.employmentType', sortable: true, isHidden: false, field: 'employmentType', selected: true },
      { label: 'Work Week', value: 'weekStart', sortable: false, isHidden: false, field: 'workWeek' },
      { label: 'Invoice Date', value: 'invoiceDate', sortable: true, isHidden: false, field: 'invoiceDate', selected: false },
      { label: 'Invoice No', value: 'invoiceNumber', sortable: true, isHidden: false, field: 'invoiceNumber', selected: false },
      { label: 'Invoice Amount', value: 'invoiceAmount', sortable: true, isHidden: false, field: 'invoiceAmount', selected: true },
    ];
  }
  initializeForm(): void {
    this.myForm = this.formBuilder.group({
      worker: [],
      workerWeekStart: [],
      workerWeekEnd: [],
      employmentType: []

    });
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
  onFilterOpen() {
    this.isFilterOpened = !this.isFilterOpened;
  }
  setDefaultCriteria() {
    let filterMap = new Map();
    filterMap.set('STATUS', 'DUE');
    filterMap.set('TYPE', 'JOB');
    filterMap.set('TO_TYPE', 'WORKER_TO_PLATFORM');
    filterMap.set('EMPLOPYEE_TYPE', ['WORKER_W2', 'WORKER_1099'].toString());
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: 0,
      size: 100000,
      sortField: 'CREATED_DATE',
      sortOrder: 1,
      searchText: this.globalFilter
    };
    this.getInvoiceList();
  }
  getInvoiceList(): void {
    this.invoicesList = [];
    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.invoiceService.getAllInvoices(this.queryParam).subscribe(data => {
      this.invoicesList = data.data.result;
      this.totalRecords = data.data.totalRecords;
    });
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
  filter(): void {
    const filterMap = new Map();
    // filterMap.set('WITHOUT_CANCELLED_AND_COMPLETED_JOB', ['CANCELLED', 'COMPLETED'].toString());
    const datePipe = new DatePipe('en-US');
    if (((this.myForm.value.workerWeekStart && !this.myForm.value.workerWeekEnd) ||
      (!this.myForm.value.workerWeekStart && this.myForm.value.workerWeekEnd))) {
      this.weekErrorFlag = true;
    }

    if (!this.myForm.value.workerWeekStart && !this.myForm.value.workerWeekEnd) {
      this.weekErrorFlag = false;
    }
    filterMap.set('STATUS', 'DUE');
    filterMap.set('TYPE', 'JOB');
    filterMap.set('TO_TYPE', 'WORKER_TO_PLATFORM');


    if (this.myForm.value.worker) {
      filterMap.set('WORKER_ID', this.myForm.value.worker.id);
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
    if (this.myForm.value.employmentType) {
      if (this.myForm.value.employmentType === 'WORKER_W2') {
        filterMap.set('EMPLOPYEE_TYPE', 'WORKER_W2');
      }
      else if (this.myForm.value.employmentType === 'WORKER_1099') {
        filterMap.set('EMPLOPYEE_TYPE', 'WORKER_1099');
      }
    }
    else {
      filterMap.set('EMPLOPYEE_TYPE', ['WORKER_W2', 'WORKER_1099'].toString());
    }

    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: 0,
      size: 10000,
      sortField: 'CREATED_DATE',
      sortOrder: 1,
      searchText: this.globalFilter
    };
    this.getInvoiceList();
  }
  clear(): void {
    this.myForm.reset();
    this.setDefaultCriteria();
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
  exportExcelRevenue() {
    const datePipe = new DatePipe('en-US');
    let excelData = [];
    this.invoicesList.forEach(element => {
      const weekStart = datePipe.transform(element.weekStart, 'MM-dd-yyyy');
      const weekEnd = datePipe.transform(element.weekEnd, 'MM-dd-yyyy');
      const invoiceDate = datePipe.transform(element.invoiceDate, 'MM-dd-yyyy');
      let JSON = {
        'Worker': element.worker.firstName + ' ' + element.worker.lastName,
        'Job': element.jobBidDetail.jobDetail.title,
        'Employment Type': element.jobBidDetail.jobDetail.employmentType === 'WORKER_1099' ? 'Temporary Worker - 1099' : 'Temporary Worker - W2',
        'Work Week': weekStart + '-' + weekEnd,
        'Invoice Date': invoiceDate,
        'Invoice No': element.invoiceNumber,
        'Invoice Amount': '$' + element.invoiceAmount,
      }
      excelData.push(JSON);
    });

    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(excelData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "W2-worker-invoice-report");
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    import("file-saver").then(FileSaver => {
      let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      let EXCEL_EXTENSION = '.xlsx';
      const data: Blob = new Blob([buffer], {
        type: EXCEL_TYPE
      });
      FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
    });
  }
  getFullName(data: User) {
    return data.firstName + ' ' + data.lastName;
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
}
