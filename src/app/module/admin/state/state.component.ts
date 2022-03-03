import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { FileDownloadService } from 'src/app/service/admin-services/fileDownload/file-download.service';
import { StateService } from 'src/app/service/admin-services/state/state.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { CommonService } from 'src/app/shared/common-services/common.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { State } from 'src/app/shared/vo/state/state';

@Component({
  selector: 'app-state',
  templateUrl: './state.component.html',
  styleUrls: ['./state.component.css']
})
export class StateComponent implements OnInit, OnDestroy {

  stateNameFilterValue;
  stateData: State[];
  state;
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  queryParam: URLSearchParams;
  datatableParam: DataTableParam;
  loading: boolean;
  totalRecords: any;
  filterMap = new Map(); message: any;
  globalFilter: string = null;

  offset: Number = 0;
  sortField: any = 'NAME';
  sortOrder: any = 1;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  loginUserId: any;
  stateDialog = false;
  submitted = false;
  myForm: FormGroup;

  currentFile: File;
  selectedFiles: FileList;
  fileName = 'State_Sample.xlsx';

  isAllStateSelected = false;
  selectedStateArray: any[] = [];
  specificSelectedStateDisable = true;
  status: string;
  subscription: Subscription;
  showButtons = true;
  clientAccess: any;
  btnDisabled = false;

  columns = [
    { label: this.translator.instant('state.name'), value: 'name' },
  ];
  popupHeader: string;

  constructor(
    private translator: TranslateService,
    private _stateService: StateService,
    private _formBuilder: FormBuilder,
    private _localStorageService: LocalStorageService,
    private confirmDialogueService: ConfirmDialogueService,
    private _notificationService: UINotificationService,
    private _fileService: FileDownloadService,
    private captionChangeService: HeaderManagementService,
    private commonServices: CommonService,
  ) {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);

    this.datatableParam = new DataTableParam();
    this.loginUserId = _localStorageService.getLoginUserId();

  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(false);
  }

  ngOnInit(): void {
    this.clientAccess = this._localStorageService.getItem('userAccess');
    this.initializeForm();
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.STATE);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.subscription = this.commonServices.stateList.subscribe(data => console.log(data));
    if (this.clientAccess) {
      this.menuAccess();
    }
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
    this.loadStateList();
  }

  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }


  filter(): void {

    this.filterMap.clear();
    if (this.stateNameFilterValue != '') {
      this.filterMap.set('NAME', this.stateNameFilterValue);
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
    this.loadStateList();
  }

  clear() {
    this.stateNameFilterValue = '';
    this.filter();
  }

  loadStateList() {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this._stateService.getStateList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.loading = false;
            this.stateData = data.data.result;
            this.offset = data.data.first;
            this.totalRecords = data.data.totalRecords;
          }
        } else {
          this.loading = false;
        }
      },
      error => {
        this.loading = false;
        console.log(error);
      }
    );
  }

  addState() {
    this.stateDialog = true;
    this.popupHeader = 'Add State';
    this.initializeForm();
  }
  hideDialog(): any {
    this.stateDialog = false;
    this.submitted = false;
    this.initializeForm();
  }
  initializeForm() {
    this.myForm = this._formBuilder.group({
      id: [],
      name: ['', [CustomValidator.required]],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      isEnable: 1
    });
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

      this._stateService.updateState(JSON.stringify(this.myForm.value)).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('state.updated'), '');
            this.loadStateList();
            this.stateDialog = false;
            this.submitted = false;
          } else {
            this._notificationService.error(data.message, '');
          }

        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          console.log(error);

        });
    } else {
      this._stateService.addState(JSON.stringify(this.myForm.value)).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('state.added'), '');
            this.loadStateList();
            this.stateDialog = false;
            this.submitted = false;
          } else {
            this._notificationService.error(data.message, '');

          }

        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          console.log(error);
          this.stateDialog = false;
          this.submitted = false;
        }
      );
    }
  }

  editState(state: State): void {
    this.stateDialog = true;
    this.popupHeader = 'Edit State';
    this.state = { ...state };

    this.myForm.controls.id.patchValue(this.state.id);
    this.myForm.controls.name.patchValue(this.state.name);

  }

  disableSelectedState() {
    this.specificSelectedStateDisable = false;
    this.selectedStateArray.forEach(stateData => this.disableState(stateData.id, true));
    if (this.selectedStateArray?.length) {
      this._notificationService.success(this.translator.instant('state.disabled'), '');
    }
    this.loadStateList();
    this.selectedStateArray.splice(0, this.selectedStateArray.length);
  }

  enableSelectedState() {
    this.specificSelectedStateDisable = false;
    this.selectedStateArray.forEach(stateData => this.enableState(stateData.id));
    this.loadStateList();
    this.selectedStateArray.splice(0, this.selectedStateArray.length);
  }

  // enable state
  enableState(id): void {
    this.submitted = true;
    this._stateService.enableState(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this._notificationService.success(this.translator.instant('state.enabled'), '');
          this.loadStateList();
          this.submitted = false;
        } else {
          this._notificationService.error(data.message, '');
        }
      },
      (error) => {
        this._notificationService.error(this.translator.instant('common.error'), '');
        console.log(error);
        this.submitted = false;
      }
    );
    this.initializeForm();
  }

  // disable state
  disableState(id, selectedState?): void {
    this.submitted = true;
    this._stateService.disableState(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          if (!selectedState) {
            this._notificationService.success(this.translator.instant('state.disabled'), '');
          }
          this.loadStateList();
          this.submitted = false;
        } else {
          this._notificationService.error(data.message, '');
        }
      },
      (error) => {
        this._notificationService.error(this.translator.instant('common.error'), '');
        console.log(error);
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
    this._stateService.bulkUpload(this.currentFile, this.loginUserId).subscribe(
      event => {
        if (event.type === HttpEventType.UploadProgress) {
        } else if (event instanceof HttpResponse) {
          this.message = event.body.message;
          this.selectedFiles = undefined;
          this.currentFile = undefined;
          if (event.body.statusCode === '200' && event.body.message === 'OK') {
            this.loadStateList();
            this._notificationService.success(this.translator.instant('state.added'), '');
          } else {
            this.loadStateList();
            this._notificationService.error(event.body.message, '');
          }
        }
      },
      err => {
        this.message = 'Could not upload the file!';
        this.selectedFiles = undefined;
        this.currentFile = undefined;
        this.loadStateList();
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
          this.disableState(id);
        }
        else {
          this.enableState(id);
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
