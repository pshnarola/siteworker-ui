import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Table } from 'primeng/table';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { CompanyService } from 'src/app/service/admin-services/company/company.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { UserService } from 'src/app/service/User.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { Company } from './company';
import { CompanyMerge } from './company-merge';

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.css']
})
export class CompanyComponent implements OnInit, OnDestroy {
  /*
    @author Vinita Jagwani
  */
  @ViewChild('dt') table: Table;
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  columns = [
    { label: this.translator.instant('company.name'), value: 'NAME', sortable: true },
    { label: this.translator.instant('createdDate'), value: 'company.createdDate', sortable: false },
    { label: this.translator.instant('createdBy'), value: 'company.user.firstName', sortable: false },
    // { label: this.translator.instant('company.merge'), value: 'mergeWithName', sortable: false }
  ];
  columnsMerge = [
    { label: this.translator.instant('old.company.name'), value: 'NAME', sortable: true },
    { label: this.translator.instant('replaced.company.name'), value: 'mergeWithName', sortable: false },
    { label: this.translator.instant('old.company.created.on'), value: 'company.createdDate', sortable: false },
    { label: this.translator.instant('old.company.created.by'), value: 'company.user.firstName', sortable: false },

  ];
  mergeColumns = [
    { label: 'Company Name', value: 'NAME' }
  ];
  listOfMergedCompanies: string[] = [];
  mergeDialog = false;
  nameFilterValue = '';
  data: Company[] = [];
  mergeData: Company[] = [];
  selectedCompanyArray: any[] = [];
  url;
  loading = false;
  offset = 0;
  datatableParam: DataTableParam;
  mergedatatableParam: DataTableParam;
  totalRecords = 0;
  loginUserId;
  showConfirmDialog = false;
  sortField = 'NAME';
  sortOrder;
  isAllCompanySelected = false;
  specificSelectedCompanyDisable = false;
  rowIndex = 0;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  currentFile: File;
  selectedFiles: FileList;
  globalFilter;
  sourceId: string;
  filterMap = new Map();
  queryParam;
  status;
  message: string;
  displayDialog = false;
  myForm: FormGroup;
  myMergeForm: FormGroup;
  selectedUserId: string;
  submitted = false;
  company: Company;
  mergeCompanyClass: CompanyMerge;
  companyDialog = false;
  showButtons = true;
  masterAccess: any;
  btnDisabled = false;

  companyHeader: string;
  datatableParamForMergedCompany = new DataTableParam();
  mergedData: any;
  offsetMerged = 0;
  totalRecordsMerged: any;
  companyForDialog = [];
  datatableParamForDialog = new DataTableParam();
  offsetDialog = 0;
  totalRecordsForDialog: any = 0;

  constructor(
    @Inject(DOCUMENT) private document: any,
    private companyService: CompanyService,
    private router: Router,
    private translator: TranslateService,
    private localStorageService: LocalStorageService,
    private notificationService: UINotificationService,
    private formBuilder: FormBuilder,
    private captionChangeService: HeaderManagementService,
    private confirmDialogService: ConfirmDialogueService,
    private userService: UserService
  ) {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);

    this.datatableParam = new DataTableParam();
    this.datatableParam = {
      offset: 0,
      size: 2,
      sortField: 'NAME',
      sortOrder: 1,
      searchText: null
    };
    this.mergedatatableParam = new DataTableParam();
    this.mergedatatableParam = {
      offset: 0,
      size: 10,
      sortField: 'NAME',
      sortOrder: 1,
      searchText: ''

    };

    this.loginUserId = localStorageService.getLoginUserId();
  }
  ngOnDestroy(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(false);
  }

  ngOnInit(): void {
    this.masterAccess = this.localStorageService.getItem('userAccess');

    this.initializeForm();
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.COMPANY);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    // this.getUserById('01');
    if (this.masterAccess) {
      this.menuAccess();
    }
  }
  getUserById(id) {
    this.userService.findUserById(id).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {
        return data.data.firstName;
      }
    });
  }

  onLazyLoad(event): void {

    this.sortOrder = event.sortOrder === -1 ? 0 : 1;
    // "WITHOUT_MERGED":""
    this.globalFilter = event.globalFilter ? event.globalFilter : '{}';
    this.sortField = event.sortField ? event.sortField : 'NAME';
    this.offset = event.first / event.rows;
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadCompanyList();
  }
  onLazyLoadMergedCompany(event): void {

    this.sortOrder = event.sortOrder === -1 ? 0 : 1;
    this.globalFilter = event.globalFilter ? event.globalFilter : '{"WITH_MERGED":""}';
    this.sortField = event.sortField ? event.sortField : 'NAME';
    this.offsetMerged = event.first / event.rows;
    this.datatableParamForMergedCompany = {
      offset: this.offsetMerged,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadMergedCompanyList();
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

  loadCompanyList(): void {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.companyService.getCustomCompanyList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.loading = false;
            this.data = data.data.result;
            this.data.map(e => {

            });

            this.offset = data.data.first;
            this.totalRecords = data.data.totalRecords;

          }
        } else {
          this.loading = false;
        }
      },
      error => {
        this.loading = false;
      }
    );
  }
  loadCompanyListForDialog(id): void {
    this.companyForDialog = [];
    this.loading = true;
    this.datatableParamForDialog = {
      offset: this.offsetDialog,
      size: 100000,
      sortField: 'NAME',
      sortOrder: 1,
      searchText: '{}'
    };
    // searchText: '{"WITHOUT_MERGED":""}'
    this.queryParam = this.prepareQueryParam(this.datatableParamForDialog);
    this.companyService.getCustomCompanyList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.loading = false;
            data.data.result.forEach(element => {
              if (element.company.id !== id) {
                this.companyForDialog.push(element);
              }
            });
            this.data.map(e => {

            });

            this.offsetDialog = data.data.first;
            this.totalRecordsForDialog = this.companyForDialog.length;

          }
        } else {
          this.loading = false;
        }
      },
      error => {
        this.loading = false;
      }
    );
  }
  loadMergedCompanyList(): void {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParamForMergedCompany);
    this.companyService.getCustomCompanyList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.loading = false;
            this.mergedData = data.data.result;
            this.data.map(e => {

            });

            this.offsetMerged = data.data.first;
            this.totalRecordsMerged = data.data.totalRecords;

          }
        } else {
          this.loading = false;
        }
      },
      error => {
        this.loading = false;
      }
    );
  }

  filter(): void {

    this.filterMap.clear();
    // this.filterMap.set('WITHOUT_MERGED', '');
    if (this.nameFilterValue !== '') {
      this.filterMap.set('NAME', this.nameFilterValue);
    }
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParam = {
      offset: this.offset,
      size: this.size,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadCompanyList();
  }

  clear() {
    this.nameFilterValue = '';
    this.filter();
  }

  initializeForm(): void {
    this.myForm = this.formBuilder.group({
      id: [],
      name: ['', [CustomValidator.required]],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      mergeWithId: [''],
      mergeWithName: [''],
      isEnable: 1
    });
    this.myMergeForm = this.formBuilder.group({
      sourceCompanyId: ['', CustomValidator.required],
      mergeCompanyIdList: ['']
    });
  }
  addCompany(): void {
    this.companyDialog = true;
    this.companyHeader = 'Add Company';
    this.initializeForm();
  }

  onSubmit(): boolean {
    this.submitted = true;
    if (!this.myForm.valid) {
      let controlName: string;
      // tslint:disable-next-line: forin
      for (controlName in this.myForm.controls) {
        this.myForm.controls[controlName].markAsDirty();
        this.myForm.controls[controlName].updateValueAndValidity(); // Validate form field and show the message
      }
      this.submitted = true;
      return false;
    }

    if (this.myForm.controls.id.value != null) {
      this.companyService.updateCompany(JSON.stringify(this.myForm.value)).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.notificationService.success(this.translator.instant('update.company.successMessage'), '');
            this.loadCompanyList();
            this.loadMergedCompanyList();
            this.companyDialog = false;
            this.submitted = false;
          } else {
            this.notificationService.error(data.message, '');
          }
        },
        error => {
          this.notificationService.error(this.translator.instant('common.error'), '');
          this.companyDialog = false;
          this.submitted = false;
        }
      );
    } else {
      this.companyService.addCompany(JSON.stringify(this.myForm.value)).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.notificationService.success(this.translator.instant('create.company.successMessage'), '');
            this.loadCompanyList();
            this.loadMergedCompanyList();
            this.companyDialog = false;
            this.submitted = false;
          } else {
            this.notificationService.error(data.message, '');
          }
        },
        error => {
          this.notificationService.error(this.translator.instant('common.error'), '');
          this.companyDialog = false;
          this.submitted = false;
        }
      );
    }
  }
  editCompany(company: Company): void {
    this.companyDialog = true;
    this.company = { ...company };
    this.companyHeader = 'Edit Company';
    this.myForm.controls.id.patchValue(this.company.id);
    this.myForm.controls.name.patchValue(this.company.name);
  }

  hideDialog(): void {
    this.mergeDialog = false;
    this.companyDialog = false;
    this.submitted = false;
    this.initializeForm();
  }
  enableCompany(id): void {
    this.companyService.enableCompany(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success(this.translator.instant('company.enable.success'), '');
          this.loadCompanyList();
          this.loadMergedCompanyList();
        }
      },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
        this.companyDialog = false;
        this.submitted = false;
      }
    );
  }
  disableCompany(id, selectedCompany?): void {
    this.companyService.disableCompany(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          if (!selectedCompany) {
            this.notificationService.success(this.translator.instant('company.disable.success'), '');
          }
          this.loadCompanyList();
          this.loadMergedCompanyList();
        }
      },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
        this.companyDialog = false;
        this.submitted = false;
      }
    );
  }
  selectAllCompany(selectedCompanies): void {
    const length = selectedCompanies.dt._value.length;
    if (selectedCompanies.checked) {
      this.isAllCompanySelected = true;
      for (let i = 0; i < length; i++) {
        this.selectedCompanyArray.push(selectedCompanies.dt._value[i]);
      }
    }
    else {
      this.isAllCompanySelected = false;
      this.selectedCompanyArray.splice(0, length);
    }
  }
  selectCompany(selectCompany): void {
    if (selectCompany.checked && !this.isAllCompanySelected) {
      this.selectedCompanyArray.push(selectCompany.value);
    }
    else {
      const index = this.selectedCompanyArray.findIndex(data => data.id === selectCompany.value.id);
      this.selectedCompanyArray.splice(index, 1);
    }
  }
  disableSelectedCompany(): void {
    this.specificSelectedCompanyDisable = false;
    this.selectedCompanyArray.forEach(companyData => this.disableCompany(companyData.company.id, true));
    if (this.selectedCompanyArray?.length) {
      this.notificationService.success(this.translator.instant('company.disable.success'), '');
    }
    this.loadCompanyList();
    this.selectedCompanyArray.splice(0, this.selectedCompanyArray.length);
  }
  mergeCompany(id): void {
    this.mergeDialog = true;
    this.sourceId = id;
    this.loadCompanyListForDialog(id);
  }
  selectMergeCompany(selectCompany): void {
    if (selectCompany.checked && !this.isAllCompanySelected) {
      this.selectedCompanyArray.push(selectCompany.value.id);
    }
    else {
      const index = this.selectedCompanyArray.findIndex(data => data.id === selectCompany.value.id);
      this.selectedCompanyArray.splice(index, 1);
    }
  }
  mergeCompanyData(listOfCompanies): void {
    this.mergeDialog = true;
    this.myMergeForm.controls.sourceCompanyId.patchValue(this.sourceId);
    this.myMergeForm.controls.mergeCompanyIdList.patchValue(listOfCompanies);
    this.companyService.mergeCompany(JSON.stringify(this.myMergeForm.value)).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success(this.translator.instant('merge.company.successMessage'), '');
          this.loadCompanyList();
          this.loadMergedCompanyList();
          this.mergeDialog = false;
          this.submitted = false;
          this.selectedCompanyArray = [];
        } else {
          this.notificationService.error(data.message, '');
        }
      },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
        this.mergeDialog = false;
        this.submitted = false;
      }
    );
  }
  selectedMergeCompany(): void {
    if (this.selectedCompanyArray.length) {
      this.listOfMergedCompanies = this.selectedCompanyArray;
      this.mergeCompanyData(this.listOfMergedCompanies);
    } else {
      this.notificationService.error('Select at least one comapny', '');
    }
  }
  openDialog(id, name, status): void {
    let options = null;
    const message = this.translator.instant('company.dialog.message');
    if (status) {
      this.status = 'disable';
    }
    else {
      this.status = 'enable';
    }
    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message} ${this.status} ${name} ?`),
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')

    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        if (status) {
          this.disableCompany(id);
        }
        else {
          this.enableCompany(id);
        }
      }
    });
  }
  menuAccess(): void {
    const accessPermission = this.masterAccess.filter(e => e.menuName == 'Masters');
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

