import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ManageReferencesService } from 'src/app/service/admin-services/manage-references.service';
import { DateHelperService } from 'src/app/service/date-helper.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { ReferencesService } from 'src/app/service/subcontractor-services/references/references.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';

@Component({
  selector: 'app-all-references',
  templateUrl: './all-references.component.html',
  styleUrls: ['./all-references.component.css']
})
export class AllReferencesComponent implements OnInit {
  columns;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  totalRecords;
  myForm: FormGroup;
  userType = [
    { label: 'Subcontractor', value: 'SUBCONTRACTOR' },
    { label: 'Worker', value: 'WORKER' },
  ]
  _selectedColumns: any[];
  _selectedColumnsWorker: any[];
  isFilterOpened = false;
  isWorkerFilterOpenend = false;
  filteredUserType: any[];
  startDate;
  queryParam;
  datatableParam = new DataTableParam();
  referenceList = [];
  subcontractorReferenceList: any;
  myWorkerForm: FormGroup;
  subcontractorNameParams: { name: any; };
  subcontractorReferences: any;
  workerNameParams: { name: any; };
  workerReferences: any;
  dateErrorFlag = false;
  globalFilter: string;
  datatableParamForWorker = new DataTableParam();
  workerReferenceList: any;
  constructor(private captionChangeService: HeaderManagementService,
    private formBuilder: FormBuilder,
    private referencesService: ReferencesService,
    private manageReferencesService: ManageReferencesService,
    private filterlLeftPanelService: FilterLeftPanelDataService,
    private dateHelperService: DateHelperService,
    private notificationService: UINotificationService,
    private translator: TranslateService) {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.ALL_REFERENCES);
    this.datatableParam = {
      offset: 0,
      size: 10000,
      sortField: 'CREATED_DATE',
      sortOrder: 1,
      searchText: null
    };
    this.datatableParamForWorker = {
      offset: 0,
      size: 10000,
      sortField: 'CREATED_DATE',
      sortOrder: 1,
      searchText: null
    };

  }

  ngOnInit(): void {
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.ALL_REFERENCES);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.setColumnOfTable();
    this.initializeSubcontractorForm();
    this.initializeWorkerForm();
    this.loadSubcontractorReferenceList();
    this._selectedColumns = this.columns.filter(a => a.selected == true);
    this._selectedColumnsWorker = this.columns.filter(a => a.selected == true);
  }
  onFilterOpen(): void {
    this.isFilterOpened = !this.isFilterOpened;
  }
  ngOnDestroy(): void {
    this.captionChangeService.hideSidebarSubject.next(false);
  }
  setColumnOfTable(): void {
    this.columns = [
      { label: 'Reference Name', value: 'fullName', sortable: true, isHidden: false, field: 'name', selected: true },
      { label: 'Reference Job Title', value: 'jobTitle', sortable: true, isHidden: false, field: 'title', selected: true },
      { label: 'Reference Company Name', value: 'companyName', sortable: true, isHidden: false, field: 'companyName', selected: true },
      { label: 'Reference Email Id', value: 'email', sortable: true, isHidden: false, field: 'email', selected: true },
      { label: 'Reference Work Number', value: 'workPhone', sortable: true, isHidden: false, field: 'workPhone', selected: false },
      { label: 'Reference Mobile Number', value: 'mobilePhone', sortable: true, isHidden: false, field: 'mobilePhone', selected: false },
      { label: 'Reference Added By', value: 'user.firstName', sortable: true, isHidden: false, field: 'addedBy', selected: false },
      { label: 'Reference Added On', value: 'createdDate', sortable: true, isHidden: false, field: 'addedOn', selected: false },
    ]
  }
  initializeSubcontractorForm(): void {
    this.myForm = this.formBuilder.group({
      referenceGivenBySubcontractor: [],
      startDateSubcontractor: [],
      endDateSubcontractor: []
    });
  }
  initializeWorkerForm(): void {
    this.myWorkerForm = this.formBuilder.group({
      referenceGivenByWorker: [],
      startDateWorker: [],
      endDateWorker: []
    });
  }
  filterSubcontractorReference(): void {
    this.dateErrorFlag = false;
    let filterMap = new Map();
    const datePipe = new DatePipe('en-US');
    if (((this.myForm.value.startDateSubcontractor && !this.myForm.value.endDateSubcontractor) ||
      (!this.myForm.value.startDateSubcontractor && this.myForm.value.endDateSubcontractor))) {
      this.dateErrorFlag = true;
    }

    if (!this.myForm.value.startDateSubcontractor && !this.myForm.value.endDateSubcontractor) {
      this.dateErrorFlag = false;
    }

    if (this.myForm.value.startDateSubcontractor > this.myForm.value.endDateSubcontractor) {
      this.dateErrorFlag = true;
    }

    if (this.myForm.value.referenceGivenBySubcontractor) {
      filterMap.set('NAME', this.myForm.value.referenceGivenBySubcontractor.toString());
    }
    if (this.myForm.value.startDateSubcontractor) {
      this.dateHelperService.setStartDate(this.myForm.value.startDateSubcontractor);
      const value = datePipe.transform(this.myForm.value.startDateSubcontractor, 'yyyy-MM-dd HH:mm:ss');
      filterMap.set('START_DATE', value);
    }
    if (this.myForm.value.endDateSubcontractor) {
      this.dateHelperService.setEndDate(this.myForm.value.endDateSubcontractor);
      const valueEnd = datePipe.transform(this.myForm.value.endDateSubcontractor, 'yyyy-MM-dd HH:mm:ss');
      filterMap.set('END_DATE', valueEnd);
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
      this.loadSubcontractorReferenceList();
    }
    else {
      this.notificationService.error(this.translator.instant('please.enter.appropriate.date.range'), '');

    }

  }
  filterWorkerReference(): void {
    this.dateErrorFlag = false;
    let filterMap = new Map();
    const datePipe = new DatePipe('en-US');

    if (this.myWorkerForm.value.referenceGivenByWorker) {
      filterMap.set('NAME', this.myWorkerForm.value.referenceGivenByWorker.toString());
    }
    if (this.myWorkerForm.value.startDateWorker) {
      this.dateHelperService.setStartDate(this.myWorkerForm.value.startDateWorker);
      const value = datePipe.transform(this.myWorkerForm.value.startDateWorker, 'yyyy-MM-dd HH:mm:ss');
      filterMap.set('START_DATE', value);
    }
    if (this.myWorkerForm.value.endDateWorker) {
      this.dateHelperService.setEndDate(this.myWorkerForm.value.endDateWorker);
      const valueEnd = datePipe.transform(this.myWorkerForm.value.endDateWorker, 'yyyy-MM-dd HH:mm:ss');
      filterMap.set('END_DATE', valueEnd);
    }
    if (((this.myWorkerForm.value.startDateWorker && !this.myWorkerForm.value.endDateWorker) ||
      (!this.myWorkerForm.value.startDateWorker && this.myWorkerForm.value.endDateWorker))) {
      this.dateErrorFlag = true;
    }

    if (!this.myWorkerForm.value.startDateWorker && !this.myWorkerForm.value.endDateWorker) {
      this.dateErrorFlag = false;
    }

    if (this.myWorkerForm.value.startDateWorker > this.myWorkerForm.value.endDateWorker) {
      this.dateErrorFlag = true;
    }

    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });

    if (!this.dateErrorFlag) {
      this.globalFilter = JSON.stringify(jsonObject);
      this.datatableParamForWorker = {
        offset: 0,
        size: 10000,
        sortField: '',
        sortOrder: 1,
        searchText: this.globalFilter
      };
      this.getWorkerManageReferences();
    }
    else {
      this.notificationService.error(this.translator.instant('please.enter.appropriate.date.range'), '');
    }

  }
  clearSubcontractorReference(): void {
    let emptyArray = [];
    this.myForm.reset();
    // this.myForm.get('referenceGivenBy').setValue(emptyArray);
    this.datatableParam = {
      offset: 0,
      size: 10000,
      sortField: 'CREATED_DATE',
      sortOrder: 1,
      searchText: null
    };
    this.loadSubcontractorReferenceList();
  }

  clearWorkerReference(): void {
    let emptyArray = [];
    this.myWorkerForm.reset();
    // this.myWorkerForm.get('referenceGivenBy').setValue(emptyArray);
    this.datatableParamForWorker = {
      offset: 0,
      size: 10000,
      sortField: 'CREATED_DATE',
      sortOrder: 1,
      searchText: null
    };
    this.getWorkerManageReferences();
  }

  loadSubcontractorReferenceList(): void {
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.referencesService.getReferenceList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.referenceList = data.data.result;

            this.totalRecords = data.data.totalRecords;
          }
        } else {
        }
      },
      error => {

      }
    );
  }
  handleChange(event): void {

    if (event.index === 0) {
      this.loadSubcontractorReferenceList();
    }
    else if (event.index === 1) {
      this.initializeWorkerForm();
      this.getWorkerManageReferences();
    }
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
  getWorkerManageReferences(): void {
    this.queryParam = this.prepareQueryParam(this.datatableParamForWorker);
    this.manageReferencesService.getWorkerReferences(this.queryParam).subscribe(data => {
      this.workerReferenceList = data.data.result;

    });
  }
  getSubcontractorByName(name): void {

    this.subcontractorNameParams = {
      name: name.query
    };

    this.queryParam = this.prepareQueryParam(this.subcontractorNameParams);
    this.filterlLeftPanelService.getAllSubContractorReferenceName(this.queryParam).subscribe(data => {

      this.subcontractorReferences = data.data;
      this.subcontractorReferences = this.subcontractorReferences.sort();
    });
  }
  getWorkerByName(name): void {
    this.workerNameParams = {
      name: name.query
    };

    this.queryParam = this.prepareQueryParam(this.workerNameParams);
    this.filterlLeftPanelService.getAllWorkerReferenceName(this.queryParam).subscribe(data => {

      this.workerReferences = data.data;
      this.workerReferences = this.workerReferences.sort();
    });
  }
  onFilterOpenWorker(): void {
    this.isWorkerFilterOpenend = !this.isWorkerFilterOpenend;
  }
  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.columns.filter(col => val.includes(col));
  }
  @Input() get selectedColumnsWorker(): any[] {
    return this._selectedColumnsWorker;
  }

  set selectedColumnsWorker(val: any[]) {
    this._selectedColumnsWorker = this.columns.filter(col => val.includes(col));
  }
  exportExcelSubcontractorRefrences() {
    const datePipe = new DatePipe('en-US');
    let excelData = [];
    this.referenceList.forEach(element => {
      const createdDate = datePipe.transform(element.createdDate, 'MM-dd-yyyy');
      let JSON = {
        'Reference Name': element.fullName,
        'Reference Job Title': element.jobTitle,
        'Reference Company Name': element.companyName,
        'Reference Email Id': element.email,
        'Reference Work Number': element.workPhone,
        'Reference Mobile Number': element.mobilePhone ? element.mobilePhone : 'N/A',
        'Reference Added By': element.user.firstName + ' ' + element.user.lastName,
        'Reference Added On': createdDate,
      }
      excelData.push(JSON);
    });

    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(excelData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "subcontractor-references");
    });
  }
  exportExcelWorkerRefrences() {

    let excelData = [];
    this.workerReferenceList.forEach(element => {
      let JSON = {
        'Reference Name': element.fullName,
        'Reference Job Title': element.jobTitle,
        'Reference Company Name': element.companyName,
        'Reference Email Id': element.email,
        'Reference Work Number': element.workPhone,
        'Reference Mobile Number': element.mobilePhone ? element.mobilePhone : 'N/A',
        'Reference Added By': element.user.firstName + ' ' + element.user.lastName,
        'Reference Added On': element.createdDate,
      }
      excelData.push(JSON);
    });

    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(excelData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "worker-references");
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
}
