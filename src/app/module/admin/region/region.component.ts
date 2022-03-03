import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { FileDownloadService } from 'src/app/service/admin-services/fileDownload/file-download.service';
import { RegionService } from 'src/app/service/admin-services/region/region.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { Region } from 'src/app/shared/vo/region/region';
import { CustomValidator } from './../../../shared/CustomValidator';



@Component({
  selector: 'app-region',
  templateUrl: './region.component.html',
  styleUrls: ['./region.component.css']
})
export class RegionComponent implements OnInit, OnDestroy {

  columns = [
    { label: this.translator.instant('region.name'), value: 'name' },
  ];
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  tableRowSize = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  tablePaginateDropdown = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  popupHeader: String;
  region: Region;
  regionData: Region[];
  regionDataSubscription: Subscription;

  currentFile: File;
  selectedFiles: FileList;
  isAllRegiondSelected = true;
  selectedRegionArray: any[] = [];
  specificSelectedRegionDisable = true;

  fileName = 'Region_Sample.xlsx';
  status: string;

  regionNameFilterValue = '';
  url;
  loading = false;

  datatableParam: DataTableParam;
  offset: Number = 0;
  totalRecords: Number = 0;
  sortField: any = 'NAME';
  sortOrder: any = 1;

  globalFilter = null;
  filterMap = new Map();
  queryParam;

  loginUserId;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  myForm: FormGroup;
  submitted = false;
  regionDialog = false;

  message: string;
  showButtons = true;
  clientAccess: any;
  btnDisabled = false;

  constructor(
    private translator: TranslateService,
    private _localStorageService: LocalStorageService,
    private _regionService: RegionService,
    private captionChangeService: HeaderManagementService,
    private _formBuilder: FormBuilder,
    private _notificationService: UINotificationService,
    private _fileService: FileDownloadService,
    private confirmDialogueService: ConfirmDialogueService
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
    this.loginUserId = _localStorageService.getLoginUserId();
  }

  ngOnInit(): void {
    this.clientAccess = this._localStorageService.getItem('userAccess');
    this.initializeForm();
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.REGION);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    if (this.clientAccess) {
      this.menuAccess();
    }
  }

  setFilterToGetByClient() {
    this.filterMap.clear();
    this.filterMap.set('IS_ENABLE', true);
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    const globalFilter = JSON.stringify(jsonObject);
    return globalFilter;
  }

  onLazyLoad(event): void {
    this.sortOrder = event.sortOrder == -1 ? 0 : 1;
    this.globalFilter = event.globalFilter ? event.globalFilter : this.globalFilter;
    this.sortField = event.sortField ? event.sortField : this.sortField;
    this.offset = event.first / event.rows;
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadRegionList();
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

  loadRegionList() {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this._regionService.getRegionList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.loading = false;
            this.regionData = data.data.result;
            this._regionService.regionSubject.next(data.data.result);
            this.regionData.map(e => {
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

  filter(): void {
    this.filterMap.clear();
    if (this.regionNameFilterValue) {
      this.filterMap.set('NAME', this.regionNameFilterValue);
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
    this.loadRegionList();
  }

  clear() {
    this.regionNameFilterValue = '';
    this.filter();
  }

  initializeForm() {
    this.myForm = this._formBuilder.group({
      id: [],
      name: ['', [CustomValidator.required]],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      isEnable: 1,
    });
  }

  addRegion(): any {
    this.regionDialog = true;
    this.popupHeader = 'Add Region';
    this.initializeForm();
  }

  onSubmit() {
    this.submitted = true;
    if (!this.myForm.valid) {
      let controlName: string;
      for (controlName in this.myForm.controls) {
        this.myForm.controls[controlName].markAsDirty();
        this.myForm.controls[controlName].updateValueAndValidity(); // Validate form field and show the message
      }
      this.submitted = true;
      return false;
    }
    if (this.myForm.controls.id.value != null) {
      this._regionService.updateRegion(JSON.stringify(this.myForm.value)).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('region.updated'), '');
            this.loadRegionList();
            this.regionDialog = false;
            this.submitted = false;
          } else {
            this._notificationService.error(data.message, '');
          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.regionDialog = false;
          this.submitted = false;
        }
      );
    } else {
      this._regionService.addRegion(JSON.stringify(this.myForm.value)).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('region.added'), '');
            this.loadRegionList();
            this.regionDialog = false;
            this.submitted = false;
          } else {
            this._notificationService.error(data.message, '');

          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.regionDialog = false;
          this.submitted = false;
        }
      );
    }
  }

  editRegion(region: Region): void {
    this.region = { ...region };
    this.popupHeader = 'Edit Region';
    this.myForm.controls.id.patchValue(this.region.id);
    this.myForm.controls.name.patchValue(this.region.name);

    this.regionDialog = true;
  }

  hideDialog(): any {
    this.regionDialog = false;
    this.submitted = false;
    this.initializeForm();
  }

  disableSelectedRegion() {
    this.specificSelectedRegionDisable = false;
    this.selectedRegionArray.forEach(regionData => this.disableRegion(regionData.id, true));
    if (this.selectedRegionArray?.length) {
      this._notificationService.success(this.translator.instant('region.disabled'), '');
    }
    this.loadRegionList();
    this.selectedRegionArray.splice(0, this.selectedRegionArray.length);
  }

  enableSelectedRegion() {
    this.specificSelectedRegionDisable = false;
    this.selectedRegionArray.forEach(regionData => this.enableRegion(regionData.id));
    this.loadRegionList();
    this.selectedRegionArray.splice(0, this.selectedRegionArray.length);
  }

  // enable region
  enableRegion(id): void {
    this.submitted = true;
    this._regionService.enableRegion(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this._notificationService.success(this.translator.instant('region.enabled'), '');
          this.loadRegionList();
          this.submitted = false;
        } else {
          this._notificationService.error(data.message, '');
        }
      },
      (error) => {
        this._notificationService.error(this.translator.instant('common.error'), '');
        this.submitted = false;
      }
    );
    this.initializeForm();
  }

  // disable region
  disableRegion(id, selectedRegion?): void {
    this.submitted = true;
    this._regionService.disableRegion(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          if (!selectedRegion) {
            this._notificationService.success(this.translator.instant('region.disabled'), '');
          }
          this.loadRegionList();
          this.submitted = false;
        } else {
          this._notificationService.error(data.message, '');
        }
      },
      (error) => {
        this._notificationService.error(this.translator.instant('common.error'), '');
        this.submitted = false;
      }
    );
    this.initializeForm();
  }

  // select file
  selectFile(event) {
    this.selectedFiles = event.addedFiles;
    if (event.rejectedFiles.length > 0) {
      if (event.rejectedFiles[0].reason === 'size') {
        this._notificationService.error(this.translator.instant('max.file.size.5.mb'), '');
      } else {
        this._notificationService.error(this.translator.instant('image.only.excel.upload'), '');
      }
      event.rejectedFiles = [];
    }
  }

  // upload file
  uploadBulk() {

    this.currentFile = this.selectedFiles[0];
    this._regionService.bulkUpload(this.currentFile, this.loginUserId).subscribe(
      event => {
        if (event.type === HttpEventType.UploadProgress) {
        } else if (event instanceof HttpResponse) {
          this.message = event.body.message;
          this.currentFile = null;
          this.selectedFiles = undefined;
          if (event.body.statusCode === '200' && event.body.message === 'OK') {
            this.loadRegionList();
            this._notificationService.success(this.translator.instant('region.added'), '');
          } else {
            this.loadRegionList();
            this._notificationService.error(event.body.message, '');
          }
        }
      },
      err => {
        this.message = 'Could not upload the file!';
        this.currentFile = null;
        this.selectedFiles = undefined;
        this.loadRegionList();
        this._notificationService.error(this.message, '');
      });
    this.selectedFiles = undefined;
  }

  download(fileName): void {
    this._fileService
      .downloadFile(fileName)
      .subscribe(blob => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = this.fileName;
        a.click();
        URL.revokeObjectURL(objectUrl);
      });
  }


  openDialog(id, name, status): void {
    let options = null;
    const message = this.translator.instant('dialog.message.region');
    if (status) {
      this.status = 'disable';
    } else {
      this.status = 'enable';
    }
    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message} ${this.status} ${name} ?`),
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text'),
    };
    this.confirmDialogueService.open(options);
    this.confirmDialogueService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        if (status) {
          this.disableRegion(id);
        }
        else {
          this.enableRegion(id);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(false);
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
