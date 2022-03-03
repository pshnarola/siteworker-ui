import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver/dist/FileSaver';
import { Subscription } from 'rxjs';
import { FileDownloadService } from 'src/app/service/admin-services/fileDownload/file-download.service';
import { DateHelperService } from 'src/app/service/date-helper.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { InvoiceService } from 'src/app/service/subcontractor-services/invoice.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { WorkerSidebarJobListService } from 'src/app/shared/worker-sidebar-job-list.service';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.css']
})
export class InvoicesComponent implements OnInit {
  myForm: FormGroup;
  isFilterOpened = false;
  status = [
    { label: 'Due', value: 'DUE' },
    { label: 'Paid', value: 'PAID' },
  ];
  invoiceDateFrom;
  filteredStatus: any[];
  columns: { label: string; value: string; sortable: boolean; isHidden: boolean; field: string; }[];
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  totalRecords = 0;
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
  invoicedateTo: Date;
  invoicedateFrom;
  sortField = 'CREATED_DATE';
  offset = 0;
  sortOrder = 0;
  constructor(
    private formBuilder: FormBuilder,
    private captionChangeService: HeaderManagementService,
    private localStorageService: LocalStorageService,
    private invoiceService: InvoiceService,
    private fileService: FileDownloadService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private dateHelperService: DateHelperService,
    private workerSideBarJobListService: WorkerSidebarJobListService) {
    this.captionChangeService.hideHeaderSubject.next(true);
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.initializeForm();
    this.setColumnOfTable();
    this.subscription.add(this.workerSideBarJobListService.workerSidebarJobChanged.subscribe(e => {
      const job = this.localStorageService.getItem('workerSelectedJob');
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
      this.setDefaultCriteria();
    }));

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
    this.localStorageService.removeItem('workerSelectedJob');
    this.subscription.unsubscribe();
  }
  setColumnOfTable(): void {
    if (this.isSelectedJob) {
      this.columns = [
        { label: 'Client', value: 'client', sortable: true, isHidden: false, field: 'postedBy' },
        { label: 'Work Week', value: 'WEEK_START', sortable: true, isHidden: false, field: 'workWeek' },
        { label: 'Invoice Date', value: 'INVOICE_DATE', sortable: true, isHidden: false, field: 'CREATED_DATE' },
        { label: 'Invoice No', value: 'invoiceNumber', sortable: true, isHidden: false, field: 'invoiceNo' },
        { label: 'Invoice Amount', value: 'INVOICE_AMOUNT', sortable: true, isHidden: false, field: 'amount' },
        { label: 'View Invoice', value: 'attachment', sortable: false, isHidden: false, field: 'attachment' },
        { label: 'Status', value: 'status', sortable: true, isHidden: false, field: 'status' },

      ];
    }
    else {
      this.columns = [
        { label: 'Client', value: 'client', sortable: true, isHidden: false, field: 'postedBy' },
        { label: 'Work Week', value: 'WEEK_START', sortable: true, isHidden: false, field: 'workWeek' },
        { label: 'Invoice Date', value: 'INVOICE_DATE', sortable: true, isHidden: false, field: 'CREATED_DATE' },
        { label: 'Invoice No', value: 'invoiceNumber', sortable: false, isHidden: false, field: 'invoiceNo' },
        { label: 'Invoice Amount', value: 'INVOICE_AMOUNT', sortable: true, isHidden: false, field: 'amount' },
        { label: 'View Invoice', value: 'attachment', sortable: false, isHidden: false, field: 'attachment' },
        { label: 'Status', value: 'status', sortable: true, isHidden: false, field: 'status' },

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
    this.loggedInUserId = this.localStorageService.getLoginUserObject().id;
    this.dateErrorFlag = false;
    filterMap.set('WORKER_ID', this.loggedInUserId);
    filterMap.set('TYPE', 'JOB');
    filterMap.set('TO_TYPE', 'WORKER_TO_PLATFORM');
    if (this.selectedJob) {
      filterMap.set('JOB_ID', this.selectedJob.id);
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
    filterMap.set('WORKER_ID', this.loggedInUserId);
    filterMap.set('TYPE', 'JOB');
    filterMap.set('TO_TYPE', 'WORKER_TO_PLATFORM');
    if (this.selectedJob) {
      filterMap.set('JOB_ID', this.selectedJob.id);
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
  onLazyLoad(event): void {
    this.sortOrder = event.sortOrder === -1 ? 0 : 1;
    this.offset = event.first / event.rows;
    this.sortField = event.sortField ? event.sortField.toUpperCase() : this.sortField;
    const filterMap = new Map();
    const selectedJobObject = this.localStorageService.getSelectedJob();
    filterMap.set('WORKER_ID', this.loggedInUserId);
    filterMap.set('TYPE', 'JOB');
    filterMap.set('TO_TYPE', 'WORKER_TO_PLATFORM');
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
