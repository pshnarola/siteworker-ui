import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver/dist/FileSaver';
import { Subscription } from 'rxjs';
import { FileDownloadService } from 'src/app/service/admin-services/fileDownload/file-download.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { DateHelperService } from 'src/app/service/date-helper.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { InvoiceService } from 'src/app/service/subcontractor-services/invoice.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
@Component({
  selector: 'app-job-invoice',
  templateUrl: './job-invoice.component.html',
  styleUrls: ['./job-invoice.component.css']
})
export class JobInvoiceComponent implements OnInit {
  myForm: FormGroup;
  isFilterOpened = false;
  status = [
    { label: 'Due', value: 'DUE' },
    { label: 'Paid', value: 'PAID' },
  ];
  filteredStatus: any[];
  columns;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  totalRecords;
  jobTitle: any;
  subscription = new Subscription();
  selectedJob: any;
  isSelectedJob = false;
  dataTableParam = new DataTableParam();
  queryParam;
  loggedInUserId: any;
  globalFilter: string;
  invoicesList = [];
  dateErrorFlag = false;
  workWeekEndDate = new Date();
  workWeekStartDate;
  weekErrorFlag = false;
  invoiceDatefrom;
  invoiceDateto;
  _selectedColumns: any[];
  sortField = 'CREATED_DATE';
  offset = 0;
  sortOrder = 0;
  constructor(
    private formBuilder: FormBuilder,
    private captionChangeService: HeaderManagementService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private localStorageService: LocalStorageService,
    private invoiceService: InvoiceService,
    private fileService: FileDownloadService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private dateHelperService: DateHelperService) {
    this.captionChangeService.hideHeaderSubject.next(true);
  }

  ngOnInit(): void {
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.INVOICES);
    this.subscription.add(this.projectJobSelectionService.selectedJobSubject.subscribe(e => {
      const job = this.localStorageService.getSelectedJob();
      if (job) {
        if (job.id !== 'jobId') {
          this.isSelectedJob = true;
          this.selectedJob = job;
          this.jobTitle = job.title;
        }
        else {
          this.isSelectedJob = false;
          this.selectedJob = null;
          this.jobTitle = null;
        }
      }
      else {
        this.isSelectedJob = false;
        this.selectedJob = null;
        this.jobTitle = null;
      }
      this.setColumnOfTable();
      this._selectedColumns = this.columns.filter(x => x.selected == true);
      this.setDefaultCriteria();
    }));
    this.initializeForm();
    this.setColumnOfTable();
    this._selectedColumns = this.columns.filter(x => x.selected == true);

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
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  setColumnOfTable(): void {
    if (this.isSelectedJob) {
      this.columns = [
        { label: 'Worker', value: 'WORKER_NAME', sortable: true, isHidden: false, field: 'worker', selected: true },
        { label: 'Work Week', value: 'WEEK_START', sortable: true, isHidden: false, field: 'workWeek', selected: false },
        { label: 'Invoice Date', value: 'INVOICE_DATE', sortable: true, isHidden: false, field: 'CREATED_DATE', selected: false },
        { label: 'Invoice No', value: 'INVOICE_NUMBER', sortable: true, isHidden: false, field: 'invoiceNo', selected: false },
        { label: 'Invoice Amount', value: 'INVOICE_AMOUNT', sortable: true, isHidden: false, field: 'amount', selected: true },
        { label: 'View Invoice', value: 'attachment', sortable: false, isHidden: false, field: 'attachment', selected: true },
        { label: 'Status', value: 'status', sortable: true, isHidden: false, field: 'status', selected: true },

      ];
    }
    else {
      this.columns = [
        { label: 'Job Title', value: 'JOB_TITLE', sortable: true, isHidden: false, field: 'jobTitle', selected: true },
        { label: 'Worker', value: 'WORKER_NAME', sortable: true, isHidden: false, field: 'worker', selected: true },
        { label: 'Work Week', value: 'WEEK_START', sortable: true, isHidden: false, field: 'workWeek', selected: true },
        { label: 'Invoice Date', value: 'INVOICE_DATE', sortable: true, isHidden: false, field: 'CREATED_DATE', selected: false },
        { label: 'Invoice No', value: 'INVOICE_NUMBER', sortable: true, isHidden: false, field: 'invoiceNo', selected: false },
        { label: 'Invoice Amount', value: 'INVOICE_AMOUNT', sortable: true, isHidden: false, field: 'amount', selected: false },
        { label: 'View Invoice', value: 'attachment', sortable: false, isHidden: false, field: 'attachment', selected: false },
        { label: 'Status', value: 'status', sortable: true, isHidden: false, field: 'status', selected: true },

      ];
    }
  }
  initializeForm() {
    this.myForm = this.formBuilder.group({
      invoiceDateFrom: [],
      invoiceDateTo: [],
      workerWeekStart: [],
      workerWeekEnd: [],
      status: []
    });
  }
  onFilterOpen(): void {
    this.isFilterOpened = !this.isFilterOpened;
  }
  filterStatus(event): void {
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
  filter(): void {
    const filterMap = new Map();
    this.dateErrorFlag = false;
    this.loggedInUserId = this.localStorageService.getLoginUserId();
    filterMap.set('CLIENT_ID', this.loggedInUserId);
    filterMap.set('TYPE', 'JOB');
    filterMap.set('TO_TYPE', 'PLATFORM_TO_CLIENT');
    filterMap.set('WITHOUT_CANCELLED_AND_COMPLETED_JOB', ['CANCELLED', 'COMPLETED'].toString());
    const selectedJobObject = this.localStorageService.getSelectedJob();
    if (this.selectedJob) {
      if (this.selectedJob.id !== 'jobId') {
        filterMap.set('JOB_ID', this.selectedJob.id);
      }
    }
    if (selectedJobObject) {
      if (selectedJobObject.id !== 'jobId') {
        filterMap.set('JOB_ID', selectedJobObject.id);
      }
    }
    const datePipe = new DatePipe('en-US');
    if (((this.myForm.value.invoiceDateFrom && !this.myForm.value.invoiceDateTo) ||
      (!this.myForm.value.invoiceDateFrom && this.myForm.value.invoiceDateTo))) {
      this.dateErrorFlag = true;
    }

    if (!this.myForm.value.invoiceDateFrom && !this.myForm.value.invoiceDateTo) {
      this.dateErrorFlag = false;
    }
    if (((this.myForm.value.workerWeekStart && !this.myForm.value.workerWeekEnd) ||
      (!this.myForm.value.workerWeekStart && this.myForm.value.workerWeekEnd))) {
      this.weekErrorFlag = true;
    }

    if (!this.myForm.value.workerWeekStart && !this.myForm.value.workerWeekEnd) {
      this.weekErrorFlag = false;
    }
    if (this.myForm.value.invoiceDateFrom) {
      this.dateHelperService.setStartDate(this.myForm.value.invoiceDateFrom);
      const value = datePipe.transform(this.myForm.value.invoiceDateFrom, 'yyyy-MM-dd HH:mm:ss');
      filterMap.set('INVOICE_DATE_FROM', value);
    }
    if (this.myForm.value.invoiceDateTo) {
      this.dateHelperService.setEndDate(this.myForm.value.invoiceDateTo);
      const valueEnd = datePipe.transform(this.myForm.value.invoiceDateTo, 'yyyy-MM-dd HH:mm:ss');
      filterMap.set('INVOICE_DATE_TO', valueEnd);
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
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    if (!this.dateErrorFlag && !this.weekErrorFlag) {

      this.globalFilter = JSON.stringify(jsonObject);
      this.dataTableParam = {
        offset: this.offset,
        size: this.size,
        sortField: this.sortField.toUpperCase(),
        sortOrder: this.sortOrder,
        searchText: this.globalFilter
      };
      this.getInvoiceList();
    }
    else {
      this.notificationService.error(this.translator.instant('please.enter.appropriate.date.range'), '');
    }
  }
  filterClear(): void {
    this.myForm.reset();
    this.setDefaultCriteria();
  }
  setDefaultCriteria(): void {
    const filterMap = new Map();
    this.loggedInUserId = this.localStorageService.getLoginUserId();
    filterMap.set('CLIENT_ID', this.loggedInUserId);
    filterMap.set('TYPE', 'JOB');
    filterMap.set('TO_TYPE', 'PLATFORM_TO_CLIENT');
    filterMap.set('WITHOUT_CANCELLED_AND_COMPLETED_JOB', ['CANCELLED', 'COMPLETED'].toString());
    const selectedJobObject = this.localStorageService.getSelectedJob();
    if (this.selectedJob) {
      if (this.selectedJob.id !== 'jobId') {
        filterMap.set('JOB_ID', this.selectedJob.id);
      }
    }
    if (selectedJobObject) {
      if (selectedJobObject.id !== 'jobId') {
        filterMap.set('JOB_ID', selectedJobObject.id);
      }
    }
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: this.offset,
      size: this.size,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.getInvoiceList();
  }
  getInvoiceList(): void {
    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.invoiceService.getAllInvoices(this.queryParam).subscribe(data => {
      if (data.data?.result) {
        this.invoicesList = data.data.result;
        this.totalRecords = data.data.totalRecords;
      }
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
  downloadDocument(id, name): void {
    this.fileService.downloadFiles(id, name).subscribe(
      data => {
        const blob = new Blob([data], { type: 'application/pdf' });
        const fileName = name;
        saveAs(blob, fileName);
      },
      (error) => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      }
    );
  }
  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.columns.filter(col => val.includes(col));
  }
  onLazyLoad(event): void {
    this.sortOrder = event.sortOrder === -1 ? 0 : 1;
    this.offset = event.first / event.rows;
    this.sortField = event.sortField ? event.sortField.toUpperCase() : this.sortField;
    const filterMap = new Map();
    const selectedJobObject = this.localStorageService.getSelectedJob();
    filterMap.set('CLIENT_ID', this.loggedInUserId);
    filterMap.set('TYPE', 'JOB');
    filterMap.set('TO_TYPE', 'PLATFORM_TO_CLIENT');
    filterMap.set('WITHOUT_CANCELLED_AND_COMPLETED_JOB', ['CANCELLED', 'COMPLETED'].toString());
    if (this.selectedJob) {
      if (this.selectedJob.id !== 'jobId') {
        filterMap.set('JOB_ID', this.selectedJob.id);
      }
    }
    if (selectedJobObject) {
      if (selectedJobObject.id !== 'jobId') {
        filterMap.set('JOB_ID', selectedJobObject.id);
      }
    }
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.getInvoiceList();
  }

}
