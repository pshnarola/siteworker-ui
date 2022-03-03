import { HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver/dist/FileSaver';
import { Subscription } from 'rxjs';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { FileDownloadService } from 'src/app/service/admin-services/fileDownload/file-download.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { LicenseService } from 'src/app/service/subcontractor-services/active-license/license.service';
import { SubcontractorProfileService } from 'src/app/service/subcontractor-services/subcontractor-profile/subcontractor-profile.service';
import { ChatMessageAttachmentDTO } from 'src/app/shared/chat-message-attachment-dto';
import { CommonService } from 'src/app/shared/common-services/common.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { State } from 'src/app/shared/vo/state/state';
import { License } from '../vo/license';
import { SubcontractorProfileDto } from '../vo/subcontractor-profile-dto';


@Component({
  selector: 'app-active-licenses',
  templateUrl: './active-licenses.component.html',
  styleUrls: ['./active-licenses.component.css']
})
export class ActiveLicensesComponent implements OnInit {
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  dateTime = new Date();
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  license = false;
  submitted = false;
  licenseDialog = false;
  licenseForm: FormGroup;
  loginUserId;
  activeLicense: License;
  licenseList: License[];
  date: Date;
  utcDate;
  licenseDTO: License;
  fatchLicense: License;
  subcontractor: SubcontractorProfileDto;
  filteredState = [];

  stateNameList = [];
  stateData: State[];
  subscription = new Subscription();

  files: File[] = [];
  FileName = '';
  selectedLogo: File;
  showPreview = false;
  logoBody: any;
  logoData: string;
  image: any;
  singleImageView: any;

  attachment: ChatMessageAttachmentDTO;
  attachmentList: ChatMessageAttachmentDTO[] = [];

  loading = false;
  offset: Number = 0;
  datatableParam: DataTableParam;
  totalRecords: Number = 0;
  queryParam;
  sortField = 'CREATED_DARE';
  sortOrder = 1;
  globalFilter;

  @Output() goToCompliance = new EventEmitter<any>();
  @Output() goToCertificates = new EventEmitter<any>();

  columns = [
    { label: this.translator.instant('license.name'), value: 'name' },
    { label: this.translator.instant('license.number'), value: 'number' },
    { label: this.translator.instant('state'), value: 'state' },
    { label: this.translator.instant('expiration.date'), value: 'EXPIRED' },
  ];

  editMode = false;
  twoDocumentsPresent: boolean;
  tempDate: Date;
  loginUser: any;
  spinner = false;

  orderBy = [
    { name: 'All', value: 'NAME', field: 'STATUS' },
    { name: 'Expired', value: 'EXPIRED', field: 'STATUS' },
    { name: 'Due', value: 'DUE', field: 'STATUS' }
  ];

  selectedOrder = { name: 'All', value: 'ALL', field: 'STATUS' };

  constructor(
    private translator: TranslateService,
    private _formBuilder: FormBuilder,
    private _localStorageService: LocalStorageService,
    private _licenseService: LicenseService,
    private _notificationService: UINotificationService,
    public _subContractorProfileServices: SubcontractorProfileService,
    private commonService: CommonService,
    private _fileService: FileDownloadService,
    private confirmDialogueService: ConfirmDialogueService

  ) {
    this.loginUserId = _localStorageService.getLoginUserId();
    this.loginUser = _localStorageService.getLoginUserObject();
    this.activeLicense = new License();
    this.dateTime.setDate(this.dateTime.getDate());
  }

  ngOnInit(): void {
    this._subContractorProfileServices.subContractorProfileDetailSubject.subscribe(data => this.subcontractor = data);
    this.initializeForm();
    this.getLogedInClientDetail(this.loginUserId);
    this.subscription.add(this.commonService.stateList.subscribe(data => {
      this.stateData = data;
      this.stateData.forEach(state => {
        this.stateNameList.push(state.name);
      });
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.files = [];
    this.editMode = false;
  }

  getLogedInClientDetail(id) {
    this._subContractorProfileServices.getSubcontractorDetail(id).subscribe(
      (data) => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.subcontractor = data.data;
          this.license = this.subcontractor.subcontractorProfile.hasLicenses;
        } else {
        }
      },
      error => {
        this._notificationService.error(this.translator.instant('common.error'), '');
      }
    );
  }

  onClick(event) {
    this.initializeForm();
    this.submitted = false;
  }

  addLicense(): any {
    this.licenseDialog = true;
    this.initializeForm();
    this.editMode = false;
  }

  hideDialog(): any {
    this.licenseDialog = false;
    this.activeLicense = new License();
    this.submitted = false;
    this.editMode = false;
    this.date = null;
    this.files = [];
    this.initializeForm();
  }

  initializeForm() {
    this.licenseForm = this._formBuilder.group({
      id: [null],
      name: ['', [CustomValidator.required, Validators.maxLength(100)]],
      number: ['', [CustomValidator.required, Validators.maxLength(50)]],
      state: ['', [CustomValidator.required]],
      expirayDate: ['', [CustomValidator.required]],
      documentPath1: ['',],
      documentPath2: ['',],
      documentName1: ['',],
      documentName2: ['',],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      enable: 1,
    });
  }

  onSelect(event) {
    const validFiles: File[] = [];
    this.files.push(...event.addedFiles);
    if (event.rejectedFiles.length > 0) {
      if (event.rejectedFiles[0].reason === 'size') {
        this._notificationService.error(this.translator.instant('max.file.size.10.mb'), '');
      } else {
        this._notificationService.error(this.translator.instant('image.pdf.upload'), '');
      }
      event.rejectedFiles = [];
    }
  }

  onRemove(id) {
    const fileTemp: File[] = [];
    this.files.forEach((e, index) => {
      if (index !== id) {
        fileTemp.push(e);
      }
    });
    this.files.length = 0;
    this.files = fileTemp;
    this._notificationService.success(this.translator.instant('document.deleted'), '');
  }

  uploadFile(editMode?: boolean): void {

    if (!editMode) {
      if (this.files.length !== 0) {
        if (this.files.length < 3) {
          const uploadFileData = new FormData();
          this.files.forEach(element => {
            uploadFileData.append('file', element);
          });
          this._fileService.uploadMultipleFile(uploadFileData).subscribe(
            event => {
              if (event instanceof HttpResponse) {
                this.logoBody = event.body;
                this.logoData = this.logoBody.data;
                if (this.logoData.length === this.files.length) {
                  this.files.forEach((element, i) => {
                    this.attachment = new ChatMessageAttachmentDTO(this.files[i].name, this.logoData[i]);
                    this.attachmentList.push(this.attachment);
                  });
                  this.onSubmit(true);
                }
              }
            },
            (error) => {
              this._notificationService.error(this.translator.instant('common.error'), '');
            });
        } else {
          this._notificationService.error('You can upload maximum 2 documents', '');
        }
      }
      else {
        this.onSubmit();
      }
    }

    if (editMode) {
      if (this.files.length !== 0) {
        if (this.files.length < 2) {
          const uploadFileData = new FormData();
          this.files.forEach(element => {
            uploadFileData.append('file', element);
          });
          this._fileService.uploadMultipleFile(uploadFileData).subscribe(
            event => {
              if (event instanceof HttpResponse) {
                this.logoBody = event.body;
                this.logoData = this.logoBody.data;
                if (this.logoData.length === this.files.length) {
                  this.files.forEach((element, i) => {
                    this.attachment = new ChatMessageAttachmentDTO(this.files[i].name, this.logoData[i]);
                    this.attachmentList.push(this.attachment);
                  });
                  this.onSubmit(true);
                }
              }
            },
            (error) => {
              this._notificationService.error(this.translator.instant('common.error'), '');
            });
        } else {
          this._notificationService.error('You can upload maximum 2 documents', '');
        }
      }
      else {
        this.onSubmit();
      }
    }

  }

  onLazyLoad(event): void {
    this.sortOrder = event.sortOrder == -1 ? 0 : 1;
    this.globalFilter = `{"USER_ID":"${this.loginUserId}"}`;
    this.sortField = event.sortField ? event.sortField : 'CREATED_DATE';
    this.offset = event.first / event.rows;
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadLicenseList();
  }

  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  selectOrder(event) {

    if (this.selectedOrder.value === 'EXPIRED') {
      this.globalFilter = `{"USER_ID":"${this.loginUserId}" ,"EXPIRED":"${new Date()}" }`;
    } else if (this.selectedOrder.value === 'DUE') {
      this.globalFilter = `{"USER_ID":"${this.loginUserId}" ,"DUE":"${new Date()}" }`;
    } else {
      this.globalFilter = `{"USER_ID":"${this.loginUserId}"}`;
    }

    const filterDataTableParam = {
      offset: this.offset,
      size: this.size,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadLicenseList(filterDataTableParam);
  }

  loadLicenseList(filterDataTableParam?) {
    this.loading = true;

    if (filterDataTableParam) {
      this.queryParam = this.prepareQueryParam(filterDataTableParam);
    } else {
      this.queryParam = this.prepareQueryParam(this.datatableParam);
    }

    this._licenseService.getLIcenseList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.loading = false;
            this.licenseList = data.data.result;
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

  editLicense(entity: License): void {
    this.licenseDialog = true;

    this.editMode = true;
    this.activeLicense = { ...entity };
    this.fatchLicense = this.activeLicense;
    this.date = new Date(this.activeLicense.expiryDate);

    this.licenseForm.controls.id.patchValue(this.activeLicense.id);
    this.licenseForm.controls.name.patchValue(this.activeLicense.name);
    this.licenseForm.controls.number.patchValue(this.activeLicense.number);
    this.licenseForm.controls.state.patchValue(this.activeLicense.state);
    this.licenseForm.controls.documentName1.patchValue(this.activeLicense.documentName1);
    this.licenseForm.controls.documentPath1.patchValue(this.activeLicense.documentPath1);

    if (this.activeLicense.documentPath2) {

      this.licenseForm.controls.documentName2.patchValue(this.activeLicense.documentName2);
      this.licenseForm.controls.documentPath2.patchValue(this.activeLicense.documentPath2);

    }

    this.licenseDialog = true;
  }

  onSubmit(isImage?: boolean) {
    this.submitted = true;
    if (!this.licenseForm.valid) {
      CustomValidator.markFormGroupTouched(this.licenseForm);
      this.submitted = true;
      return false;
    }
    if (this.licenseForm.controls.id.value != null) {

      this.activeLicense.name = this.licenseForm.get('name').value;
      this.activeLicense.number = this.licenseForm.get('number').value;
      this.activeLicense.state = this.licenseForm.get('state').value;
      this.tempDate = this.licenseForm.get('expirayDate').value;
      this.activeLicense.expiryDate = this.tempDate.toISOString();

      if (isImage) {
        if (this.attachmentList[0]) {
          if (this.activeLicense.documentPath1 && this.activeLicense.documentPath2) {
            this.twoDocumentsPresent = true;
          } else if ((this.activeLicense.documentPath1 == null || this.activeLicense.documentPath1 == '') && (this.activeLicense.documentPath2 == null || this.activeLicense.documentPath2 == '')) {
            this.activeLicense.documentPath1 = this.attachmentList[0].path;
            this.activeLicense.documentName1 = this.attachmentList[0].fileName;
          }
          else if ((this.activeLicense.documentPath2 && !this.activeLicense.documentPath1) || this.activeLicense.documentPath2) {
            this.activeLicense.documentPath1 = this.attachmentList[0].path;
            this.activeLicense.documentName1 = this.attachmentList[0].fileName;
          } else if ((this.activeLicense.documentPath1 && !this.activeLicense.documentPath2) || this.activeLicense.documentPath1) {
            this.activeLicense.documentPath2 = this.attachmentList[0].path;
            this.activeLicense.documentName2 = this.attachmentList[0].fileName;
          }
        }
      }

      if (this.twoDocumentsPresent) {
        this._notificationService.error('You can upload only two documents', '');
        this.attachmentList = [];
        // this.files = [];
        this.twoDocumentsPresent = false;

      } else {
        this._licenseService.updateLicense(this.activeLicense).subscribe(
          data => {
            if (data.statusCode === '200' && data.message === 'OK') {
              this._notificationService.success(this.translator.instant('license.updated'), '');
              this.licenseDialog = false;
              this.submitted = false;
              this.files = [];
              this.date = null;
              this.fatchLicense = null;
              this.attachmentList = [];
              this.loadLicenseList();
            } else {
              this._notificationService.error(data.message, '');
              this.date = null;
              this.files = [];
              this.attachmentList = [];
              this.loadLicenseList();
            }
          },
          (error) => {
            this._notificationService.error(this.translator.instant('common.error'), '');
            this.licenseDialog = false;
            this.submitted = false;
            this.files = [];
            this.attachmentList = [];
            this.date = null;
            this.loadLicenseList();

          }
        );
      }
    } else {
      // this.activeLicense = new License();

      this.activeLicense.name = this.licenseForm.get('name').value;
      this.activeLicense.number = this.licenseForm.get('number').value;
      this.activeLicense.state = this.licenseForm.get('state').value;

      this.tempDate = this.licenseForm.get('expirayDate').value;
      this.activeLicense.expiryDate = this.tempDate.toISOString();

      this.activeLicense.user = this.loginUser;

      if (this.attachmentList[0]) {
        this.activeLicense.documentPath1 = this.attachmentList[0].path;
        this.activeLicense.documentName1 = this.attachmentList[0].fileName;
      }
      if (this.attachmentList[1]) {
        this.activeLicense.documentPath2 = this.attachmentList[1].path;
        this.activeLicense.documentName2 = this.attachmentList[1].fileName;
      }

      if (this.activeLicense.documentPath1) {
        this._licenseService.addLicense(this.activeLicense).subscribe(
          data => {
            if (data.statusCode === '200' && data.message === 'OK') {
              this._notificationService.success(this.translator.instant('license.added'), '');
              this.licenseDialog = false;
              this.submitted = false;
              this.files = [];
              this.attachmentList = [];
              this.date = null;
              this.loadLicenseList();
            } else {
              this._notificationService.error(data.message, '');
              this.files = [];
              this.attachmentList = [];
              this.date = null;
              this.loadLicenseList();
            }
          },
          (error) => {
            this._notificationService.error(this.translator.instant('common.error'), '');
            this.licenseDialog = false;
            this.submitted = false;
            this.files = [];
            this.attachmentList = [];
            this.date = null;
            this.loadLicenseList();
          }
        );
      } else {
        this._notificationService.error('Document is mandatory ', '');
      }
    }
  }

  deleteLicense(id) {
    this._licenseService.deleteLicense(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this._notificationService.success(this.translator.instant('license.deleted'), '');
          this.submitted = false;
          this.loadLicenseList();

        } else {
          this._notificationService.error(data.message, '');
        }
      },
      (error) => {
        this._notificationService.error(this.translator.instant('common.error'), '');
        this.licenseDialog = false;
        this.submitted = false;
      }
    );

  }

  patchDocuments(pathId) {
    if (pathId === this.licenseForm.value.documentPath1) {
      this.activeLicense.documentName1 = null;
      this.activeLicense.documentPath1 = null;
      this.licenseForm.controls.documentName1.setValue(null);
      this.licenseForm.controls.documentPath1.setValue(null);
    } else if (pathId === this.licenseForm.value.documentPath2) {
      this.activeLicense.documentName2 = null;
      this.activeLicense.documentPath2 = null;
      this.licenseForm.controls.documentName2.setValue(null);
      this.licenseForm.controls.documentPath2.setValue(null);
    }
  }

  deleteDocument(pathId, id) {
    this._licenseService.deleteDocument(pathId, id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this._notificationService.success(this.translator.instant('document.deleted'), '');
          this.submitted = false;
          this.patchDocuments(pathId);
          // this.licenseDialog = false;
          this.loadLicenseList();
        } else {
          this._notificationService.error(data.message, '');
        }
      },
      (error) => {
        this._notificationService.error(this.translator.instant('common.error'), '');
        this.licenseDialog = false;
        this.submitted = false;
      }
    );
  }

  downloadFile(id) {
    this._licenseService.downloadFile(id).subscribe(
      data => {
        const blob = new Blob([data], { type: 'application/zip' });
        const fileName = 'License';
        saveAs(blob, fileName);
        this.loadLicenseList();


      },
      (error) => {
        this._notificationService.error(this.translator.instant('common.error'), '');
        this.licenseDialog = false;
        this.submitted = false;
      }
    );
  }

  openDialog(id, name, path?): void {

    let options = null;
    const message = this.translator.instant('dialog.message.delete');

    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message} ?`),
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text'),
    };

    this.confirmDialogueService.open(options);
    this.confirmDialogueService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        if (path) {
          if (this.fatchLicense.documentName1 && this.fatchLicense.documentName2) {
            this.deleteDocument(path, id);
          } else {
            this._notificationService.error(this.translator.instant('document.mandatory'), '');
          }
        } else {
          this.deleteLicense(id);
        }
      }

    });
  }

  onSubmitSubcontractor(next?) {
    if (this._subContractorProfileServices.subcontractorEditForm.controls.id.value != null || !this._subContractorProfileServices.subcontractorEditForm.valid) {
      if (this.license && this.licenseList.length == 0) {
        this._notificationService.error('License is mandatory', '');
        return false;
      }

      this.subcontractor.subcontractorProfile.hasLicenses = this.license;
      this._subContractorProfileServices.updateSubcontractorProfile(this.subcontractor).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('subcontractor.profile.updated'), '');
            this.submitted = false;
            if (next == 'next') {
              this.next();
            }
          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.submitted = false;
        }
      );

    }
    else {
      this._notificationService.error(this.translator.instant('client.profile.not.found'), '');
    }
  }

  filterState(event) {
    const filtered: any[] = [];
    const query = event.query;
    for (let i = 0; i < this.stateNameList.length; i++) {
      const state = this.stateNameList[i];
      if (state.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(state);
      }
    }
    this.filteredState = filtered;
    this.filteredState = this.filteredState.sort();

  }

  next(string?) {
    this.goToCompliance.emit('');
  }

  previous(string?) {
    this.goToCertificates.emit('');
  }

  openDeleteDialogForTemp(index, title): void {
    let options = null;
    const message = this.translator.instant('dialog.message.delete');
    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message} ?`),
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogueService.open(options);
    this.confirmDialogueService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.onRemove(index);
      }
    });
  }

}
