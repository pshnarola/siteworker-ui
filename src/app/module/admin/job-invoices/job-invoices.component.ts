import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver/dist/FileSaver';
import { Subscription } from 'rxjs';
import { FileDownloadService } from 'src/app/service/admin-services/fileDownload/file-download.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { DateHelperService } from 'src/app/service/date-helper.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { InvoiceService } from 'src/app/service/subcontractor-services/invoice.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { InvoiceDTO } from '../vos/InvoiceDTO';

@Component({
  selector: 'app-job-invoices',
  templateUrl: './job-invoices.component.html',
  styleUrls: ['./job-invoices.component.css']
})
export class JobInvoicesComponent implements OnInit {

  columns = [
    { label: 'User', value: 'user', sortable: false, isHidden: false, field: 'user', selected: true },
    { label: 'Week', value: 'WEEK_START', sortable: true, isHidden: false, field: 'week', selected: true },
    { label: 'Invoice Date', value: 'INVOICE_DATE', sortable: true, isHidden: false, field: 'invoiceDate', selected: false },
    { label: 'Invoice Type', value: 'status', sortable: false, isHidden: false, field: 'invoiceType', selected: true },
    { label: 'Invoice No', value: 'invoiceNumber', sortable: false, isHidden: false, field: 'invoiceNumber', selected: false },
    { label: 'Invoice Amount', value: 'INVOICE_AMOUNT', sortable: true, isHidden: false, field: 'invoiceAmount', selected: true },
    { label: 'Invoice', value: 'invoice', sortable: false, isHidden: false, field: 'invoice', selected: false },
    { label: 'Invoice Status', value: 'status', sortable: false, isHidden: false, field: 'status', selected: true },
  ];
  myForm: FormGroup;
  status = [
    { label: 'Due', value: 'DUE' },
    { label: 'Paid', value: 'PAID' }
  ];
  filteredStatus: any[];
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  totalRecords;
  _selectedColumns: any[];
  workWeekEndDate = new Date();
  workWeekStartDate;
  subscription = new Subscription();
  selectedJob: any;
  globalFilter: string;
  datatableParam = new DataTableParam();
  queryParam;
  invoiceList = [];
  workerNameParams: { name: any; };
  filterWorkers: any;
  isSelectedJob: boolean;
  jobTitle: any;
  weekErrorFlag: boolean;
  showButtons: boolean = true;
  jobAccess: any;
  btnDisabled: boolean = false;
  isFilterOpened = false;
  sortField = 'CREATED_DATE';
  offset = 0;
  sortOrder = 0;
  constructor(
    private captionChangeService: HeaderManagementService,
    private formBuilder: FormBuilder,
    private invoiceService: InvoiceService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private filterLeftPanelService: FilterLeftPanelDataService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private localStorageService: LocalStorageService,
    private fileService: FileDownloadService,
    private dateHelperService: DateHelperService) {
    this.captionChangeService.hideHeaderSubject.next(true);

  }

  ngOnInit(): void {
    this.jobAccess = this.localStorageService.getItem("userAccess");

    this.captionChangeService.hideHeaderSubject.next(true);
    this.initializeForm();
    this.subscription.add(this.projectJobSelectionService.selectedJobSubject.subscribe(e => {

      const job = this.localStorageService.getSelectedJob();
      if (job) {
        if (job.id !== 'jobId') {
          this.isSelectedJob = true;
          this.selectedJob = job;
          this.jobTitle = job.title;
          this.setDefaultCriteria();

        }
        else {
          this.isSelectedJob = false;
          this.selectedJob = null;
          this.jobTitle = null;
          this.setDefaultCriteria();

        }
      }
      else {
        this.isSelectedJob = false;
        this.selectedJob = null;
        this.jobTitle = null;
        this.setDefaultCriteria();

      }
      this.initializeForm();

    }));
    this._selectedColumns = this.columns.filter(a => a.selected == true);
    if (this.jobAccess) {
      this.menuAccess();
    }
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
    this.isFilterOpened = !this.isFilterOpened
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  initializeForm(): void {
    this.myForm = this.formBuilder.group({
      worker: [],
      status: [],
      workerWeekStart: [],
      workerWeekEnd: []

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
  downloadExcel() {
    const filterMap = new Map();
    filterMap.set('TYPE', 'JOB');
    const datePipe = new DatePipe('en-US');
    if (((this.myForm.value.workerWeekStart && !this.myForm.value.workerWeekEnd) ||
      (!this.myForm.value.workerWeekStart && this.myForm.value.workerWeekEnd))) {
      this.weekErrorFlag = true;
    }

    if (!this.myForm.value.workerWeekStart && !this.myForm.value.workerWeekEnd) {
      this.weekErrorFlag = false;
    }
    if (this.selectedJob) {
      if (this.selectedJob.id !== 'jobId') {
        filterMap.set('JOB_ID', this.selectedJob.id);
      }
    }
    if (this.myForm.value.worker) {
      filterMap.set('WORKER_ID', this.myForm.value.worker.id);
    }
    if (this.myForm.value.status) {
      filterMap.set('STATUS', this.myForm.value.status.value);
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

    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });

    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParam = {
      offset: this.offset,
      size: this.size,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    const queryParam = this.prepareQueryParam(this.datatableParam);
    this.invoiceService.exportToExcel(queryParam).subscribe(
      data => {
        const blob = new Blob([data], { type: 'application/vnd.ms-excel' });
        const fileName = 'invoices';
        saveAs(blob, fileName);
      },
      error => {

      }
    );
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
    const datePipe = new DatePipe('en-US');
    if (((this.myForm.value.workerWeekStart && !this.myForm.value.workerWeekEnd) ||
      (!this.myForm.value.workerWeekStart && this.myForm.value.workerWeekEnd))) {
      this.weekErrorFlag = true;
    }

    if (!this.myForm.value.workerWeekStart && !this.myForm.value.workerWeekEnd) {
      this.weekErrorFlag = false;
    }
    filterMap.set('TYPE', 'JOB');
    if (this.selectedJob) {
      if (this.selectedJob.id !== 'jobId') {
        filterMap.set('JOB_ID', this.selectedJob.id);
      }
    }

    if (this.myForm.value.worker) {
      filterMap.set('WORKER_ID', this.myForm.value.worker.id);
      filterMap.set('TO_TYPE', 'WORKER_TO_PLATFORM');
    }
    if (this.myForm.value.status) {
      filterMap.set('STATUS', this.myForm.value.status.value);
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

    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });

    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParam = {
      offset: this.offset,
      size: this.size,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.getInvoiceList();

  }
  setDefaultCriteria(): void {
    const filterMap = new Map();
    filterMap.set('TYPE', 'JOB');
    if (this.selectedJob) {
      filterMap.set('JOB_ID', this.selectedJob.id);
    }
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });

    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParam = {
      offset: this.offset,
      size: this.size,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.getInvoiceList();
  }
  getInvoiceList(): void {
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.invoiceService.getAllInvoices(this.queryParam).subscribe(data => {
      if (data.data?.result) {
        this.invoiceList = data.data.result;
        this.totalRecords = data.data.totalRecords;
      }
    });
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
        // 
      }
    );
  }

  getWorkerByName(name): void {

    this.workerNameParams = {
      name: name.query
    };
    this.queryParam = this.prepareQueryParam(this.workerNameParams);
    this.filterLeftPanelService.getWorkerByNameForAdminJobInvoice(this.queryParam).subscribe(data => {

      this.filterWorkers = data.data;

      this.filterWorkers = this.filterWorkers.sort();
    });
  }
  clear() {
    this.myForm.reset();
    this.setDefaultCriteria();
  }
  onStatusChange(event, data) {


    const invoiceDTO = new InvoiceDTO();
    invoiceDTO.id = data.id;
    invoiceDTO.status = event.value;

    this.invoiceService.updateStatus(invoiceDTO).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {
        this.notificationService.success(this.translator.instant('status.changed.to.paid'), '');
        this.setDefaultCriteria();
      } else {
        this.notificationService.error(data.errorCode, '');
      }
    });
  }
  menuAccess(): void {
    let accessPermission = this.jobAccess.filter(e => e.menuName == 'Jobs');
    if (accessPermission[0].canModify) {
      this.showButtons = true;
      this.btnDisabled = false;
    }
    else {
      this.showButtons = false;
      this.btnDisabled = true;
    }
  }
  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.columns.filter(col => val.includes(col));
  }
  getFullName(data) {
    // 
    return data.first + ' ' + data.last;
  }
  onLazyLoad(event): void {
    this.sortOrder = event.sortOrder === -1 ? 0 : 1;
    this.offset = event.first / event.rows;
    this.sortField = event.sortField ? event.sortField.toUpperCase() : this.sortField;
    const filterMap = new Map();
    const selectedJobObject = this.localStorageService.getSelectedJob();
    filterMap.set('TYPE', 'JOB');
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
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.getInvoiceList();
  }
}
