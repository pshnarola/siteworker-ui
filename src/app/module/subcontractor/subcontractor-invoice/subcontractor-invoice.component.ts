import { Component, Input, OnInit } from '@angular/core';
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
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { User } from 'src/app/shared/vo/User';

@Component({
  selector: 'app-subcontractor-invoice',
  templateUrl: './subcontractor-invoice.component.html',
  styleUrls: ['./subcontractor-invoice.component.css']
})
export class SubcontractorInvoiceComponent implements OnInit {
  columns;
  isFilterOpened = false;
  status = [
    { label: 'All', value: 'All' },
    { label: 'Due', value: 'DUE' },
    { label: 'Paid', value: 'PAID' },
  ];
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  totalRecords = 0;
  myForm: FormGroup;
  filteredStatus: any[];
  _selectedColumns: any[];
  projectTitle: any;
  jobsiteTitle: any;
  subscription = new Subscription();
  dataTableParam = new DataTableParam();
  queryParam;
  loggedInUserId: any;
  globalFilter: string;
  selectedProject: any;
  selectedJobsite: any;
  invoicesList = []
  clientNameParams: { name: any; };
  clients: any;
  isSelectedProject = false;
  isSelectedJobsite = false;
  sortField = 'CREATED_DATE';
  offset = 0;
  sortOrder = 0;
  constructor(
    private captionChangeService: HeaderManagementService,
    private formBuilder: FormBuilder,
    private projectJobSelectionService: ProjectJobSelectionService,
    private invoiceService: InvoiceService,
    private localStorageService: LocalStorageService,
    private filterLeftPanelService: FilterLeftPanelDataService,
    private fileService: FileDownloadService,
    private notificationService: UINotificationService,
    private translator: TranslateService
  ) {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.dataTableParam = {
      offset: this.offset,
      size: this.size,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loggedInUserId = this.localStorageService.getLoginUserId();
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.subscription.add(this.projectJobSelectionService.selectedProjectSubject.subscribe(e => {

      let project = this.localStorageService.getSelectedProjectObject();
      if (project) {
        if (project.id !== 'pid') {
          this.isSelectedProject = true;
          this.selectedProject = project;
          this.projectTitle = project.title;
        }
        else {
          this.isSelectedProject = false;
          this.selectedProject = null;
          this.projectTitle = null;
        }
      } else {
        this.isSelectedProject = false;
        this.selectedProject = null;
        this.projectTitle = null;
      }
      this.setColumnOfTable();
      this.setDefaultCriteria();
      this._selectedColumns = this.columns.filter(x => x.selected == true);
    }));
    this.subscription.add(this.projectJobSelectionService.selectedJobsiteSubject.subscribe(jobsite1 => {
      let jobsite = this.localStorageService.getSelectedJobsiteObject();
      let project = this.localStorageService.getSelectedProjectObject();
      if (project && jobsite) {
        if (jobsite.id !== 'jid') {
          this.isSelectedJobsite = true;
          this.selectedJobsite = jobsite;
          this.jobsiteTitle = jobsite.title;
        } else {
          this.isSelectedJobsite = false;
          this.selectedJobsite = null;
          this.jobsiteTitle = null;
        }
      } else {
        this.isSelectedJobsite = false;
        this.selectedJobsite = null;
        this.jobsiteTitle = null;
      }
      this.setColumnOfTable();
      this.setDefaultCriteria();
      this._selectedColumns = this.columns.filter(x => x.selected == true);

    }));
    this.initializeForm();
    this.setColumnOfTable();
    this._selectedColumns = this.columns.filter(x => x.selected == true);
  }
  // tslint:disable-next-line: use-lifecycle-interface
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  setColumnOfTable(): void {
    if (this.isSelectedProject && !this.isSelectedJobsite) {
      this.columns = [
        { label: 'Client', value: 'CLIENT_NAME', sortable: true, isHidden: false, field: 'postedBy', selected: false },
        { label: 'Jobsite Title', value: 'JOBSITE_TITLE', sortable: true, isHidden: this.isSelectedJobsite ? true : false, field: 'jobsiteTitle', selected: true },
        { label: 'Milestone Name', value: 'MILESTONE_NAME', sortable: true, isHidden: false, field: 'milestoneName', selected: true },
        { label: 'Milestone Cost', value: 'MILESTONE_COST', sortable: true, isHidden: false, field: 'milestoneCost', selected: true },
        { label: 'Platform Margin Amount', value: 'PLATFORM_MARGIN_COST', sortable: true, isHidden: false, field: 'platFormMarginAmount', selected: false },
        { label: 'Invoice Date', value: 'INVOICE_DATE', sortable: true, isHidden: false, field: 'CREATED_DATE', selected: false },
        { label: 'Invoice No', value: 'INVOICE_NUMBER', sortable: true, isHidden: false, field: 'invoiceNo', selected: false },
        { label: 'Invoice Amount', value: 'INVOICE_AMOUNT', sortable: true, isHidden: false, field: 'amount', selected: false },
        { label: 'View Invoice', value: 'attachment', sortable: false, isHidden: false, field: 'attachment', selected: false },
        { label: 'Status', value: 'status', sortable: true, isHidden: false, field: 'status', selected: false },

      ];
    }
    else if (this.isSelectedJobsite && this.isSelectedProject) {
      this.columns = [
        { label: 'Client', value: 'CLIENT_NAME', sortable: true, isHidden: false, field: 'postedBy', selected: false },
        { label: 'Milestone Name', value: 'MILESTONE_NAME', sortable: true, isHidden: false, field: 'milestoneName', selected: true },
        { label: 'Milestone Cost', value: 'MILESTONE_COST', sortable: true, isHidden: false, field: 'milestoneCost', selected: true },
        { label: 'Platform Margin Amount', value: 'PLATFORM_MARGIN_COST', sortable: true, isHidden: false, field: 'platFormMarginAmount', selected: true },
        { label: 'Invoice Date', value: 'INVOICE_DATE', sortable: true, isHidden: false, field: 'CREATED_DATE', selected: false },
        { label: 'Invoice No', value: 'INVOICE_NUMBER', sortable: true, isHidden: false, field: 'invoiceNo', selected: false },
        { label: 'Invoice Amount', value: 'INVOICE_AMOUNT', sortable: true, isHidden: false, field: 'amount', selected: false },
        { label: 'View Invoice', value: 'attachment', sortable: false, isHidden: false, field: 'attachment', selected: false },
        { label: 'Status', value: 'status', sortable: true, isHidden: false, field: 'status', selected: false },

      ];
    }
    else if (this.isSelectedJobsite) {
      this.columns = [
        { label: 'Client', value: 'CLIENT_NAME', sortable: true, isHidden: false, field: 'postedBy', selected: false },
        { label: 'Project Title', value: 'PROJECT_TITLE', sortable: true, isHidden: this.isSelectedProject ? true : false, field: 'projectTitle', selected: true },
        { label: 'Milestone Name', value: 'MILESTONE_NAME', sortable: true, isHidden: false, field: 'milestoneName', selected: true },
        { label: 'Milestone Cost', value: 'MILESTONE_COST', sortable: true, isHidden: false, field: 'milestoneCost', selected: true },
        { label: 'Platform Margin Amount', value: 'PLATFORM_MARGIN_COST', sortable: true, isHidden: false, field: 'platFormMarginAmount', selected: false },
        { label: 'Invoice Date', value: 'INVOICE_DATE', sortable: true, isHidden: false, field: 'CREATED_DATE', selected: false },
        { label: 'Invoice No', value: 'INVOICE_NUMBER', sortable: true, isHidden: false, field: 'invoiceNo', selected: false },
        { label: 'Invoice Amount', value: 'INVOICE_AMOUNT', sortable: true, isHidden: false, field: 'amount', selected: false },
        { label: 'View Invoice', value: 'attachment', sortable: false, isHidden: false, field: 'attachment', selected: false },
        { label: 'Status', value: 'status', sortable: true, isHidden: false, field: 'status', selected: false },

      ];
    }
    else {
      this.columns = [
        { label: 'Client', value: 'CLIENT_NAME', sortable: true, isHidden: false, field: 'postedBy', selected: false },
        { label: 'Project Title', value: 'PROJECT_TITLE', sortable: true, isHidden: this.isSelectedProject ? true : false, field: 'projectTitle', selected: true },
        { label: 'Jobsite Title', value: 'JOBSITE_TITLE', sortable: true, isHidden: this.isSelectedJobsite ? true : false, field: 'jobsiteTitle', selected: true },
        { label: 'Milestone Name', value: 'MILESTONE_NAME', sortable: true, isHidden: false, field: 'milestoneName', selected: true },
        { label: 'Milestone Cost', value: 'MILESTONE_COST', sortable: true, isHidden: false, field: 'milestoneCost', selected: false },
        { label: 'Platform Margin Amount', value: 'PLATFORM_MARGIN_COST', sortable: true, isHidden: false, field: 'platFormMarginAmount', selected: false },
        { label: 'Invoice Date', value: 'INVOICE_DATE', sortable: true, isHidden: false, field: 'CREATED_DATE', selected: false },
        { label: 'Invoice No', value: 'INVOICE_NUMBER', sortable: true, isHidden: false, field: 'invoiceNo', selected: false },
        { label: 'Invoice Amount', value: 'INVOICE_AMOUNT', sortable: true, isHidden: false, field: 'amount', selected: false },
        { label: 'View Invoice', value: 'attachment', sortable: false, isHidden: false, field: 'attachment', selected: false },
        { label: 'Status', value: 'status', sortable: true, isHidden: false, field: 'status', selected: false },

      ];
    }
  }

  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.columns.filter(col => val.includes(col));
  }

  initializeForm(): void {
    this.myForm = this.formBuilder.group({
      client: [],
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
    filterMap.set('SUBCONTRACTOR_ID', this.loggedInUserId);
    filterMap.set('TYPE', 'PROJECT');
    filterMap.set('TO_TYPE', 'SUBCONTRACTOR_TO_PLATFORM');
    if (this.myForm.value.status.value !== 'All') {
      filterMap.set('STATUS', this.myForm.value.status.value);
    }
    if (this.myForm.value.client) {
      filterMap.set('CLIENT_ID', this.myForm.value.client.id);
    }
    if (this.selectedProject) {
      filterMap.set('PROJECT_DETAIL_ID', this.selectedProject.id);
    }
    if (this.selectedJobsite) {
      filterMap.set('JOBSITE_DETAIL_ID', this.selectedJobsite.id);
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
  onFilterClear(): void {
    this.myForm.reset();
    this.setDefaultCriteria();

  }
  setDefaultCriteria(): void {
    let filterMap = new Map();
    filterMap.set('SUBCONTRACTOR_ID', this.loggedInUserId);
    filterMap.set('TYPE', 'PROJECT');
    filterMap.set('TO_TYPE', 'SUBCONTRACTOR_TO_PLATFORM');
    if (this.selectedProject) {
      filterMap.set('PROJECT_DETAIL_ID', this.selectedProject.id);
    }
    if (this.selectedJobsite) {
      filterMap.set('JOBSITE_DETAIL_ID', this.selectedJobsite.id);
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
  getClientByName(name): void {
    this.clientNameParams = {
      name: name.query
    };
    this.queryParam = this.prepareQueryParam(this.clientNameParams);
    this.filterLeftPanelService.getClientByName(this.queryParam).subscribe(data => {
      this.clients = data.data;
      this.clients = this.clients.sort();
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
        console.log(error);
      }
    );
  }
  getFullName(data: User) {
    return data.firstName + ' ' + data.lastName;
  }
  onLazyLoad(event): void {
    this.sortOrder = event.sortOrder === -1 ? 0 : 1;
    this.offset = event.first / event.rows;
    this.sortField = event.sortField ? event.sortField.toUpperCase() : this.sortField;
    const filterMap = new Map();
    const selectedProjectObject = this.localStorageService.getSelectedProjectObject();
    const selectedJobsiteObject = this.localStorageService.getSelectedJobsiteObject();
    filterMap.set('SUBCONTRACTOR_ID', this.loggedInUserId);
    filterMap.set('TYPE', 'PROJECT');
    filterMap.set('TO_TYPE', 'SUBCONTRACTOR_TO_PLATFORM');
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
