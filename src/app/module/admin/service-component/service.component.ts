import { DOCUMENT } from '@angular/common';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Table } from 'primeng/table';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { FileDownloadService } from 'src/app/service/admin-services/fileDownload/file-download.service';
import { ServiceComponentService } from 'src/app/service/admin-services/service-component/service-component.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { Service } from './service';


@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.css']
})
export class ServiceComponent implements OnInit, OnDestroy {

  /*
    @author Vinita Jagwani
  */
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  @ViewChild('dt') table: Table;
  columns = [
    { label: this.translator.instant('services'), value: 'SERVICENAME' }
  ];


  nameFilterValue = '';
  data: Service[] = [];
  selectedServiceArray: any[] = [];
  url;
  loading = false;
  offset = 0;
  datatableParam: DataTableParam;
  totalRecords = 0;
  loginUserId;
  showConfirmDialog = false;
  sortField = 'SERVICENAME';
  sortOrder = 1;
  isAllServiceSelected = false;
  specificSelectedServiceDisable = false;
  rowIndex = 0;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  status;
  currentFile: File;
  selectedFiles: FileList;
  globalFilter = null;
  filterMap = new Map();
  queryParam;
  message: string;
  displayDialog = false;
  myForm: FormGroup;
  selectedUserId: string;
  submitted = false;
  service: Service;
  serviceDialog = false;
  fileName = 'Service_Sample.xlsx';
  popupHeader: string;
  showButtons: boolean = true;
  clientAccess: any;
  btnDisabled: boolean = false;

  constructor(@Inject(DOCUMENT) private document: any,
    private _service: ServiceComponentService,
    private translator: TranslateService,
    private localStorageService: LocalStorageService,
    private notificationService: UINotificationService,
    private formBuilder: FormBuilder,
    private captionChangeService: HeaderManagementService,
    private fileService: FileDownloadService,
    private confirmDialogService: ConfirmDialogueService
  ) {

    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);

    this.datatableParam = new DataTableParam();
    this.datatableParam = {
      offset: 0,
      size: 10,
      sortField: 'SERVICENAME',
      sortOrder: 1,
      searchText: null
    };

    this.loginUserId = localStorageService.getLoginUserId();
  }
  ngOnDestroy(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(false);
  }




  ngOnInit(): void {
    this.clientAccess = this.localStorageService.getItem("userAccess");

    this.initializeForm();
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.SERVICE);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    if (this.clientAccess) {
      this.menuAccess();
    }
  }

  onLazyLoad(event): void {

    this.sortOrder = event.sortOrder === -1 ? 0 : 1;
    this.globalFilter = event.globalFilter ? event.globalFilter : this.globalFilter;
    this.sortField = event.sortField ? event.sortField : this.sortField;
    this.offset = event.first / event.rows;
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadServiceList();
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

  loadServiceList(): void {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this._service.getServiceList(this.queryParam).subscribe(
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

  filter(): void {

    this.filterMap.clear();
    if (this.nameFilterValue !== '') {
      this.filterMap.set('SERVICENAME', this.nameFilterValue);
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
    this.loadServiceList();
  }

  clear() {
    this.nameFilterValue = '';
    this.filter();
  }




  initializeForm(): void {
    this.myForm = this.formBuilder.group({
      id: [],
      serviceName: ['', [CustomValidator.required]],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      isEnable: 1
    });
  }
  addService(): void {
    this.serviceDialog = true;
    this.initializeForm();
    this.popupHeader = "Add Service"
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
      this._service.updateService(JSON.stringify(this.myForm.value)).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.notificationService.success(this.translator.instant('update.service.successMessage'), '');
            this.loadServiceList();
            this.serviceDialog = false;
            this.submitted = false;
          }
          else {
            this.notificationService.error(data.message, '');
          }
        },
        error => {
          this.notificationService.error(this.translator.instant('common.error'), '');
          this.serviceDialog = false;
          this.submitted = false;
        }
      );
    } else {
      this._service.addService(JSON.stringify(this.myForm.value)).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.notificationService.success(this.translator.instant('create.service.successMessage'), '');
            this.loadServiceList();
            this.serviceDialog = false;
            this.submitted = false;
          }
          else {
            this.notificationService.error(data.message, '');
          }
        },
        error => {
          this.notificationService.error(this.translator.instant('common.error'), '');
          this.serviceDialog = false;
          this.submitted = false;
        }
      );
    }
  }
  editService(service: Service): void {
    this.serviceDialog = true;
    this.popupHeader = "Edit Service";
    this.service = { ...service };

    this.myForm.controls.id.patchValue(this.service.id);
    this.myForm.controls.serviceName.patchValue(this.service.serviceName);
  }

  hideDialog(): void {
    this.serviceDialog = false;
    this.submitted = false;
    this.initializeForm();
  }
  enableService(id): void {
    this._service.enableService(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success(this.translator.instant('service.enable.success'), '');
          this.loadServiceList();
        }
      },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
        this.serviceDialog = false;
        this.submitted = false;
      }
    );
  }
  disableService(id, selectedService?): void {
    this._service.disableService(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          if (!selectedService) {
            this.notificationService.success(this.translator.instant('service.disable.success'), '');
          }
          this.loadServiceList();
        }
      },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
        this.serviceDialog = false;
        this.submitted = false;
      }
    );
  }

  disableSelectedService(): void {
    this.specificSelectedServiceDisable = false;
    this.selectedServiceArray.forEach(serviceData => this.disableService(serviceData.id, true));
    if (this.selectedServiceArray?.length) {
      this.notificationService.success(this.translator.instant('service.disable.success'), '');
    }
    this.loadServiceList();
    this.selectedServiceArray.splice(0, this.selectedServiceArray.length);
  }

  selectFile(event): void {
    this.selectedFiles = event.addedFiles;
    if (event.rejectedFiles.length > 0) {
      if (event.rejectedFiles[0].reason === 'size') {
        this.notificationService.error(this.translator.instant('max.file.size.5.mb'), '');
      } else {
        this.notificationService.error(this.translator.instant('image.only.excel.upload'), '');
      }
      event.rejectedFiles = [];
    }
  }

  uploadBulk(): void {
    this.currentFile = this.selectedFiles[0];
    this._service.bulkUpload(this.currentFile, this.loginUserId).subscribe(
      event => {
        if (event.type === HttpEventType.UploadProgress) {

        } else if (event instanceof HttpResponse) {
          this.message = event.body.message;
          this.currentFile = null;
          this.selectedFiles = undefined;
          if (event.body.statusCode === '200' && event.body.message === 'OK') {
            this.loadServiceList();
            this.notificationService.success(this.translator.instant('create.service.successMessage'), '');
          } else {
            this.loadServiceList();
            this.notificationService.error(event.body.message, '');
          }
        }
      },
      err => {
        this.message = 'Could not upload the file!';
        this.currentFile = null;
        this.selectedFiles = undefined;
        this.loadServiceList();
        this.notificationService.error(this.message, '');
      });
  }

  download(fileName): void {
    this.fileService
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
    const message = this.translator.instant('service.dialog.message');
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
          this.disableService(id);
        }
        else {
          this.enableService(id);
        }
      }
    });
  }
  menuAccess(): void {
    let accessPermission = this.clientAccess.filter(e => e.menuName == 'Masters');
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
