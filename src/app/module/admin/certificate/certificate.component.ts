import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Table } from 'primeng/table';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { CertificateService } from 'src/app/service/admin-services/certificate/certificate.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { Certificate } from './certificate';

@Component({
  selector: 'app-certificate',
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.css']
})
export class CertificateComponent implements OnInit, OnDestroy {

  /*
    @author Vinita Jagwani
  */
  @ViewChild('dt') table: Table;
  columns = [
    { label: this.translator.instant('certificate'), value: 'name' },
  ];
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  nameFilterValue = '';
  data: Certificate[] = [];
  selectedCertificateArray: any[] = [];
  url;
  loading = false;
  offset = 0;
  datatableParam: DataTableParam;
  totalRecords = 0;
  loginUserId;
  showConfirmDialog = false;
  sortField = 'NAME';
  sortOrder = 1;
  isAllCertificatedSelected = false;
  specificSelectedCertificateDisable = false;
  rowIndex = 0;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  globalFilter = null;
  filterMap = new Map();
  queryParam;
  displayDialog = false;
  myForm: FormGroup;
  selectedUserId: string;
  certificate: Certificate;
  submitted = false;
  userDialog = false;
  popupHeader: string;
  status;
  showButtons: boolean = true;
  clientAccess: any;
  btnDisabled: boolean = false;

  constructor(
    @Inject(DOCUMENT) private document: any,
    private certificateService: CertificateService,
    private router: Router,
    private confirmDialogService: ConfirmDialogueService,
    private localStorageService: LocalStorageService,
    private notificationService: UINotificationService,
    private formBuilder: FormBuilder,
    private captionChangeService: HeaderManagementService,
    private translator: TranslateService,
    private spinner: NgxSpinnerService
  ) {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.datatableParam = new DataTableParam();
    this.datatableParam = {
      offset: 0,
      size: 10,
      sortField: 'NAME',
      sortOrder: 1,
      searchText: null
    };

    this.loginUserId = localStorageService.getLoginUserId();
  }




  ngOnInit(): void {
    this.clientAccess = this.localStorageService.getItem("userAccess");
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.CERTIFICATE);
    this.spinner.hide();
    this.initializeForm();
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
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadCertificateList();
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

  loadCertificateList(): void {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.certificateService.getCertificateList(this.queryParam).subscribe(
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
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };

    this.loadCertificateList();
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
      isEnable: true
    });
  }
  addCertificate(): void {
    this.userDialog = true;
    this.popupHeader = "Add Certificate";
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
      this.certificateService.updateCertificate(JSON.stringify(this.myForm.value)).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.notificationService.success(this.translator.instant('update.certificate.successMessage'), '');
            this.loadCertificateList();
            this.userDialog = false;
            this.submitted = false;
          }
          else {
            this.notificationService.error(data.message, '');
            this.userDialog = false;
            this.submitted = false;
          }
        },
        error => {
          this.notificationService.error(this.translator.instant('common.error'), '');
          this.userDialog = false;
          this.submitted = false;
        }
      );
    } else {
      this.certificateService.addCertificate(JSON.stringify(this.myForm.value)).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.notificationService.success(this.translator.instant('create.certificate.successMessage'), '');
            this.loadCertificateList();
            this.userDialog = false;
            this.submitted = false;
          }
          else {
            this.notificationService.error(data.message, '');
            this.userDialog = false;
            this.submitted = false;
          }
        },
        error => {
          this.notificationService.error(this.translator.instant('common.error'), '');
          this.userDialog = false;
          this.submitted = false;
        }
      );
    }
  }

  editCertificate(certificate: Certificate): void {
    this.userDialog = true;
    this.popupHeader = "Edit Certificate";
    this.certificate = { ...certificate };
    this.myForm.controls.id.patchValue(this.certificate.id);
    this.myForm.controls.name.patchValue(this.certificate.name);
  }

  hideDialog(): void {
    this.userDialog = false;
    this.submitted = false;
    this.initializeForm();
  }
  enableCertificate(id): void {
    this.certificateService.enableCertificate(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success(this.translator.instant('certificate.enabled.successfully'), '');
          this.loadCertificateList();
        }
      },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
        this.userDialog = false;
        this.submitted = false;
      }
    );
  }
  disableCertificate(id, selectedCertificate?): void {
    this.certificateService.disableCertificate(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          if (!selectedCertificate) {
            this.notificationService.success(this.translator.instant('certificate.disabled.successfully'), '');
          }
          this.loadCertificateList();
        }
        else {
          this.notificationService.error(data.message, '');
        }
      },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
        this.userDialog = false;
        this.submitted = false;
      }
    );
  }
  disableSelectedCertificate(): void {
    this.specificSelectedCertificateDisable = false;
    this.selectedCertificateArray.forEach(certificateData => this.disableCertificate(certificateData.id, true));
    if (this.selectedCertificateArray?.length) {
      this.notificationService.success(this.translator.instant('certificate.disabled.successfully'), '');
    }
    this.selectedCertificateArray.splice(0, this.selectedCertificateArray.length);
    this.loadCertificateList();
  }
  openDialog(id, name, status): void {
    let options = null;
    const message = this.translator.instant('certificate.dialog.message');
    if (status) {
      this.status = 'disable';
    }
    else {
      this.status = 'enable';
    }
    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message} ${this.status} ${name}` + " ?"),
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')

    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        if (status) {
          this.disableCertificate(id);
        }
        else {
          this.enableCertificate(id);
        }
      }
    });
  }
  ngOnDestroy(): void {
    this.spinner.show();
    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(false);
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
