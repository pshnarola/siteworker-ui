import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Table } from 'primeng/table';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { IndustryTypeService } from 'src/app/service/admin-services/industry-type/industry-type.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { IndustryType } from 'src/app/shared/vo/IndustryType';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-industry-type',
  templateUrl: './industry-type.component.html',
  styleUrls: ['./industry-type.component.css']
})
export class IndustryTypeComponent implements OnInit, OnDestroy {
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  @ViewChild('dt') table: Table;
  columns = [
    { label: this.translator.instant('industry.name'), value: 'NAME' }
  ];

  loggedInUserId: string;
  industryTypeForm: FormGroup;
  indstryTypeFilterValue = '';
  industryTypeDialog = false;
  selectedIndustryType: IndustryType[] = [];
  submitted = false;
  files: File[] = [];
  logoToShow: File[] = [];
  selectedLogo: File;
  data: IndustryType[] = [];
  url;
  status = true;
  logoBody: any;
  logoData: string;
  image: any;
  loading = false;
  offset: Number = 0;
  datatableParam: DataTableParam;
  totalRecords: Number = 0;
  filterMap = new Map();
  sortField = 'NAME';
  queryParam;
  sortOrder = 1;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  globalFilter = null;
  industryType: IndustryType;
  singleImageView: any;
  dialogHeader: string;
  tableRowSize = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  tablePaginateDropdown = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  showButtons = true;
  clientAccess: any;
  btnDisabled = false;

  imageUrl = environment.baseURL + '/file/getById?fileId=';
  industryImageUrl = 'assets/images/industryDummy.png';

  constructor(
    private captionChangeService: HeaderManagementService,
    private _localStorageService: LocalStorageService,
    private _formBuilder: FormBuilder,
    private _industryTypeService: IndustryTypeService,
    private translator: TranslateService,
    private confirmDialogService: ConfirmDialogueService,
    private notificationService: UINotificationService) {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
  }
  ngOnDestroy(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(false);
  }

  ngOnInit(): void {
    this.clientAccess = this._localStorageService.getItem('userAccess');
    if (this.clientAccess) {
      this.menuAccess();
    }
    this.dialogHeader = this.translator.instant('add.industry.type');
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.INDUSTRY_TYPE);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.loggedInUserId = this._localStorageService.getLoginUserId();
    this.initializeForm();
    if (!this.industryTypeDialog) {
      this.singleImageView = null;
    }
  }

  addIndustryType(): void {
    this.dialogHeader = this.translator.instant('add.industry.type');
    this.logoToShow.length = 0;
    this.industryTypeDialog = true;
    this.singleImageView = null;
    this.selectedLogo = null;
    this.submitted = false;
    if (this.files) {
      this.files.splice(0, this.files.length);
    }
    this.initializeForm();
  }

  hideDialog(): void {
    this.industryTypeDialog = false;
    this.logoBody = null;
    this.logoData = null;
    this.singleImageView = null;
    this.selectedLogo = null;
    this.logoToShow = [];
    this.files = [];
    this.submitted = false;
  }

  onRemoveLogo(event) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  openWarnigDialogToDelete(file) {
    let options = null;
    options = {
      title: 'Warning',
      message: 'Are you sure you want to delete?',
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.selectedLogo = null;
        this.logoToShow.length = 0;
      }
    });
  }

  onAddIndustryType() {
    this.submitted = true;
    if (!this.industryTypeForm.valid) {
      CustomValidator.markFormGroupTouched(this.industryTypeForm);
      this.submitted = true;
      return false;
    }
    if (this.industryTypeForm.valid && this.submitted) {
      this.uploadLogo();
    }
  }

  uploadLogo() {
    if (this.selectedLogo) {
      const uploadImageData = new FormData();
      uploadImageData.append('file', this.selectedLogo);
      this._industryTypeService.uploadLogo(uploadImageData).subscribe(
        event => {
          if (event instanceof HttpResponse) {
            this.logoBody = event.body;
            this.logoData = this.logoBody.data;
            this.industryTypeForm.controls.logo.patchValue(this.logoData);
            this.uploadIndustryTypeFormData();
          }
        },
        error => {
          console.log(error);
        }
      );
    }
    else {
      this.uploadIndustryTypeFormData();
    }
  }

  editIndustryType(industryType: IndustryType): void {
    this.dialogHeader = this.translator.instant('edit.industry.type');
    this.industryType = { ...industryType };
    this.industryTypeForm.controls.id.patchValue(this.industryType.id);
    this.industryTypeForm.controls.name.patchValue(this.industryType.name);
    this.industryTypeForm.controls.updatedBy.patchValue(this.loggedInUserId);
    if (industryType.logo) {
      this.industryTypeForm.controls.logo.patchValue(industryType.logo);
      this.singleImageView = this.imageUrl + industryType.logo;
    }
    else {
      this.industryTypeForm.controls.logo.patchValue(null);
      this.singleImageView = null;
    }

    this.industryTypeDialog = true;
  }

  filter() {
    this.filterMap.clear();
    if (this.indstryTypeFilterValue !== '') {
      this.filterMap.set('NAME', this.indstryTypeFilterValue);
    }
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
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
    this.loadIndustryList();
  }

  clear() {
    this.indstryTypeFilterValue = '';
    this.filter();
  }

  uploadIndustryTypeFormData() {

    if (this.industryTypeForm.controls.id.value != null) {
      if (this.industryTypeForm.valid) {
        this._industryTypeService.updateIndustryType(JSON.stringify(this.industryTypeForm.value)).subscribe(
          data => {
            if (data.statusCode === '200' && data.message === 'OK') {
              this.notificationService.success(this.translator.instant('industry.type.updated.successfully'), '');
              this.loadIndustryList();
              this.industryTypeDialog = false;
              this.singleImageView = null;
              this.submitted = false;
              this.selectedLogo = null;
              this.logoToShow = [];
              this.files = [];
              this.logoBody = null;
              this.logoData = null;
            }
            else {
              this.notificationService.error(data.message, '');
              this.industryTypeDialog = false;
              this.singleImageView = null;
              this.submitted = false;
              this.selectedLogo = null;
              this.logoToShow = [];
              this.files = [];
              this.logoBody = null;
              this.logoData = null;
            }
          },
          error => {
            this.notificationService.error(this.translator.instant('common.error'), '');
            this.industryTypeDialog = false;
            this.singleImageView = null;
            this.submitted = false;
            this.selectedLogo = null;
            this.logoToShow = [];
            this.files = [];
            this.logoBody = null;
            this.logoData = null;
          }
        );
      }
    }
    else if (this.industryTypeForm.valid) {
      this._industryTypeService.addIndustryType(JSON.stringify(this.industryTypeForm.value)).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.notificationService.success(this.translator.instant('industry.type.added.successfully'), '');
            this.loadIndustryList();
            this.industryTypeDialog = false;
            this.singleImageView = null;
            this.submitted = false;
            this.selectedLogo = null;
            this.logoToShow = [];
            this.files = [];
            this.logoBody = null;
            this.logoData = null;
          }
          else {
            this.notificationService.error(data.message, '');
            this.industryTypeDialog = false;
            this.singleImageView = null;
            this.submitted = false;
            this.selectedLogo = null;
            this.logoToShow = [];
            this.files = [];
            this.logoBody = null;
            this.logoData = null;
          }
        },
        error => {
          this.notificationService.error(this.translator.instant('common.error'), '');
          this.industryTypeDialog = false;
          this.singleImageView = null;
          this.submitted = false;
          this.selectedLogo = null;
          this.logoToShow = [];
          this.files = [];
          this.logoBody = null;
          this.logoData = null;
        }
      );
    }
  }

  onLogoSelect(event) {
    if (event.rejectedFiles.length > 0) {
      if (event.rejectedFiles[0].reason === 'size') {
        this.notificationService.error(this.translator.instant('max.file.size.10.mb'), '');
      } else {
        this.notificationService.error(this.translator.instant('image.upload'), '');
      }
      this.logoToShow = [];
      event.rejectedFiles = [];
    }
    this.files.push(...event.addedFiles);
    if (this.files[1] != null) {
      this.onRemoveLogo(this.files[0]);
    }
    this.logoToShow = [];
    this.selectedLogo = this.files[0];
    if (this.selectedLogo) {
      this.logoToShow.push(this.selectedLogo);
    }
    this.files = [];
  }

  onLazyLoad(event) {
    this.sortOrder = event.sortOrder === -1 ? 0 : 1;
    this.globalFilter = event.globalFilter ? event.globalFilter : this.globalFilter;
    this.sortField = event.sortField ? event.sortField : 'NAME';
    this.offset = event.first / event.rows;
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadIndustryList();
  }

  private prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  loadIndustryList() {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this._industryTypeService.getIndustryTypeList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.loading = false;
            this.data = data.data.result;
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

  private disableIndustryType(id: string, selectedIndustry?) {
    this._industryTypeService.disableIndustryType(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          if (!selectedIndustry) {
            this.notificationService.success(this.translator.instant('industry.type.disabled.successfully'), '');
          }
          this.loadIndustryList();
        }
        else {
          this.notificationService.error(data.message, '');
        }
      },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      }
    );
  }

  disableSelectedIndustryType() {
    this.selectedIndustryType.forEach(industryType => this.disableIndustryType(industryType.id, true));
    this.notificationService.success(this.translator.instant('industry.type.disabled.successfully'), '');
    this.selectedIndustryType.splice(0, this.selectedIndustryType.length);
  }

  private enableIndustryType(id: string) {
    this._industryTypeService.enableIndustryType(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success(this.translator.instant('industry.type.enabled.successfully'), '');
          this.loadIndustryList();
        }
        else {
          this.notificationService.error(data.message, '');
        }
      },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      }
    );
  }

  private initializeForm() {
    this.industryTypeForm = this._formBuilder.group({
      id: [],
      name: ['', [CustomValidator.required]],
      logo: [''],
      createdBy: this.loggedInUserId,
      updatedBy: this.loggedInUserId,
      isEnable: true
    });
  }

  openDialog(id, name, status) {
    let options = null;
    const message = this.translator.instant('dialog.message');
    if (status) {
      this.status = this.translator.instant('disable');
    }
    else {
      this.status = this.translator.instant('enable');
    }
    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message} ${this.status} ${name}` + ' ?'),
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        if (status) {
          this.disableIndustryType(id);
        }
        else {
          this.enableIndustryType(id);
        }
      }
    });
  }
  menuAccess(): void {
    const accessPermission = this.clientAccess.filter(e => e.menuName == 'Masters');
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
