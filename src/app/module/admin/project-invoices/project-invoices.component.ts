import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver/dist/FileSaver';
import { Subscription } from 'rxjs';
import { FileDownloadService } from 'src/app/service/admin-services/fileDownload/file-download.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { InvoiceService } from 'src/app/service/subcontractor-services/invoice.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { InvoiceDTO } from '../vos/InvoiceDTO';
import { ProjectInvoiceDTO } from '../vos/ProjectInvoiceDTO';

@Component({
  selector: 'app-project-invoices',
  templateUrl: './project-invoices.component.html',
  styleUrls: ['./project-invoices.component.css']
})
export class ProjectInvoicesComponent implements OnInit, OnDestroy {
  columns = [
    { label: 'User', value: 'user', sortable: false, isHidden: false, field: 'user', selected: true },
    { label: 'Jobsite Title', value: 'JOBSITE_TITLE', sortable: true, isHidden: false, field: 'jobsiteTitle', selected: true },
    { label: 'Milestone Name', value: 'MILESTONE_NAME', sortable: true, isHidden: false, field: 'milestoneDescription', selected: false },
    { label: 'Invoice Type', value: 'status', sortable: false, isHidden: false, field: 'invoiceType', selected: true },
    { label: 'Invoice Date', value: 'INVOICE_DATE', sortable: true, isHidden: false, field: 'invoiceDate', selected: false },
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
  totalRecords = 0;
  queryParam: URLSearchParams;
  invoiceList = [];
  globalFilter: any;
  datatableParam: { offset: number; size: number; sortField: string; sortOrder: number; searchText: any; };
  selectedJob: any;
  groupedInvoices: any[];
  projectInvoiceDtoList: ProjectInvoiceDTO[] = [];
  subcontractorNameParams: { name: any; };
  filterSubcontractors: any;
  subscription = new Subscription();
  isSelectedProject: boolean;
  selectedProject: any;
  projectTitle: any;
  isSelectedJobsite: boolean;
  selectedJobsite: any;
  jobsiteTitle: any;
  statusToChange;
  showButtons = true;
  subcontractorAccess: any;
  btnDisabled = false;
  isFilterOpened = false;
  _selectedColumns: any[];
  sortField = 'CREATED_DATE';
  offset = 0;
  sortOrder = 0;

  constructor(
    private captionChangeService: HeaderManagementService,
    private formBuilder: FormBuilder,
    private invoiceService: InvoiceService,
    private fileService: FileDownloadService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private filterLeftPanelService: FilterLeftPanelDataService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private localStorageService: LocalStorageService
  ) {
    this.captionChangeService.hideHeaderSubject.next(true);
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.subcontractorAccess = this.localStorageService.getItem('userAccess');

    this.subscription.add(this.projectJobSelectionService.selectedProjectSubject.subscribe(e => {
      const project = this.localStorageService.getSelectedProjectObject();
      if (project) {
        if (project.id !== 'pid') {
          this.isSelectedProject = true;
          this.selectedProject = project;
          this.projectTitle = project.title;
          this.setDefaultCriteria();

        }
        else {
          this.isSelectedProject = false;
          this.selectedProject = null;
          this.projectTitle = null;
          this.setDefaultCriteria();

        }
      }
      else {
        this.isSelectedProject = false;
        this.selectedProject = null;
        this.projectTitle = null;
        this.setDefaultCriteria();

      }
      this.initializeForm();
    }));

    this.subscription.add(this.projectJobSelectionService.selectedJobsiteSubject.subscribe(jobsite1 => {

      const jobsite = this.localStorageService.getSelectedJobsiteObject();
      if (jobsite) {
        if (jobsite.id !== 'jid') {
          this.isSelectedJobsite = true;
          this.selectedJobsite = jobsite;
          this.jobsiteTitle = jobsite.title;
          this.setDefaultCriteria();

        } else {
          this.isSelectedJobsite = false;
          this.selectedJobsite = null;
          this.jobsiteTitle = null;
          this.setDefaultCriteria();

        }
      }
      else {
        this.isSelectedJobsite = false;
        this.selectedJobsite = null;
        this.jobsiteTitle = null;
        this.setDefaultCriteria();

      }
      this.initializeForm();
    }));

    if (this.subcontractorAccess) {
      this.menuAccess();
    }

    this._selectedColumns = this.columns.filter(a => a.selected == true);

  }
  onFilterOpen() {
    this.isFilterOpened = !this.isFilterOpened;
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  initializeForm(): void {

    this.myForm = this.formBuilder.group({
      subcontractor: [],
      status: []

    });
  }
  downloadExcel(): void {
    const filterMap = new Map();
    filterMap.set('TYPE', 'PROJECT');
    // filterMap.set('WITHOUT_CANCELLED_AND_COMPLETED', ['CANCELLED', 'COMPLETED'].toString());
    if (this.selectedProject) {
      filterMap.set('PROJECT_DETAIL_ID', this.selectedProject.id);
    }
    if (this.selectedJobsite) {
      filterMap.set('JOBSITE_DETAIL_ID', this.selectedJobsite.id);
    }
    if (this.myForm.value.subcontractor) {
      filterMap.set('SUBCONTRACTOR_ID', this.myForm.value.subcontractor.id);
    }
    if (this.myForm.value.status) {
      filterMap.set('STATUS', this.myForm.value.status.value);
    }
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });

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
        const fileName = 'project-invoices';
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
    const selectedProjectObject = this.localStorageService.getSelectedProjectObject();
    const selectedJobsiteObject = this.localStorageService.getSelectedJobsiteObject();
    filterMap.set('TYPE', 'PROJECT');
    if (this.selectedProject) {
      if (this.selectedProject.id !== 'pid') {
        filterMap.set('PROJECT_DETAIL_ID', this.selectedProject.id);
      }
    }
    else if (selectedProjectObject) {
      if (selectedProjectObject.id !== 'pid') {
        filterMap.set('PROJECT_DETAIL_ID', selectedProjectObject.id);
      }
    }
    if (this.selectedJobsite) {
      if (this.selectedJobsite.id !== 'jid') {
        filterMap.set('JOBSITE_DETAIL_ID', this.selectedJobsite.id);
      }
    }
    else if (selectedJobsiteObject) {
      if (selectedJobsiteObject.id !== 'jid') {
        filterMap.set('JOBSITE_DETAIL_ID', selectedJobsiteObject.id);
      }
    }
    if (this.myForm.value.subcontractor) {
      filterMap.set('SUBCONTRACTOR_ID', this.myForm.value.subcontractor.id);
      filterMap.set('TO_TYPE', 'SUBCONTRACTOR_TO_PLATFORM');

    }
    if (this.myForm.value.status) {
      filterMap.set('STATUS', this.myForm.value.status.value);
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
    const selectedProjectObject = this.localStorageService.getSelectedProjectObject();
    const selectedJobsiteObject = this.localStorageService.getSelectedJobsiteObject();
    filterMap.set('TYPE', 'PROJECT');
    if (this.selectedProject) {
      if (this.selectedProject.id !== 'pid') {
        filterMap.set('PROJECT_DETAIL_ID', this.selectedProject.id);
      }
    }
    else if (selectedProjectObject) {
      if (selectedProjectObject.id !== 'pid') {
        filterMap.set('PROJECT_DETAIL_ID', selectedProjectObject.id);
      }
    }
    if (this.selectedJobsite) {
      if (this.selectedJobsite.id !== 'jid') {
        filterMap.set('JOBSITE_DETAIL_ID', this.selectedJobsite.id);
      }
    }
    else if (selectedJobsiteObject) {
      if (selectedJobsiteObject.id !== 'jid') {
        filterMap.set('JOBSITE_DETAIL_ID', selectedJobsiteObject.id);
      }
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

      if (data.data.result) {
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
  getSubcontractorByName(name): void {

    this.subcontractorNameParams = {
      name: name.query
    };
    this.queryParam = this.prepareQueryParam(this.subcontractorNameParams);
    this.filterLeftPanelService.getSubcontractorByNameForAdminProjectInvoice(this.queryParam).subscribe(data => {

      this.filterSubcontractors = data.data;
      this.filterSubcontractors = this.filterSubcontractors.sort();
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
    if (this.subcontractorAccess) {
      const accessPermission = this.subcontractorAccess.filter(e => e.menuName == 'Projects');
      if (accessPermission[0].canModify) {
        this.showButtons = true;
        this.btnDisabled = false;
      }
      else {
        this.showButtons = false;
        this.btnDisabled = true;
      }
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
    const selectedProjectObject = this.localStorageService.getSelectedProjectObject();
    const selectedJobsiteObject = this.localStorageService.getSelectedJobsiteObject();
    filterMap.set('TYPE', 'PROJECT');
    if (this.selectedProject) {
      if (this.selectedProject.id !== 'pid') {
        filterMap.set('PROJECT_DETAIL_ID', this.selectedProject.id);
      }
    }
    else if (selectedProjectObject) {
      if (selectedProjectObject.id !== 'pid') {
        filterMap.set('PROJECT_DETAIL_ID', selectedProjectObject.id);
      }
    }
    if (this.selectedJobsite) {
      if (this.selectedJobsite.id !== 'jid') {
        filterMap.set('JOBSITE_DETAIL_ID', this.selectedJobsite.id);
      }
    }
    else if (selectedJobsiteObject) {
      if (selectedJobsiteObject.id !== 'jid') {
        filterMap.set('JOBSITE_DETAIL_ID', selectedJobsiteObject.id);
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
