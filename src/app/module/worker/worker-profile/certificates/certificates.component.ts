import { HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver/dist/FileSaver';
import { Subscription } from 'rxjs';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { Certificate } from 'src/app/module/admin/certificate/certificate';
import { FileDownloadService } from 'src/app/service/admin-services/fileDownload/file-download.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { WorkerCertificateService } from 'src/app/service/worker-services/workerCertificate/worker-certificate.service';
import { CommonService } from 'src/app/shared/common-services/common.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { workerCertificate } from '../../vo/WorkerCertificate';


@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.css']
})
export class CertificatesComponent implements OnInit {
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;

  submitted = false;
  loginUserId: any;
  loginUser;
  spinner = false;

  workerCertificateDialog = false;
  workerCertificateForm: FormGroup;
  expiredDate: Date;
  certificateDate: Date;

  files: File[] = [];
  FileName = '';
  selectedLogo: File;
  showPreview = false;
  logoBody: any;
  logoData: string;
  image: any;
  singleImageView: any;

  certificateList: Certificate[] = [];
  filteredCertificate = [];
  subscription = new Subscription();
  workerCertificate = new workerCertificate();
  fatchworkerCertificate = new workerCertificate();
  workerCertificateList: workerCertificate[];


  @Output() goBackToWorkExpAndEducation = new EventEmitter<any>();
  @Output() goToReference = new EventEmitter<any>();

  columns = [
    { label: this.translator.instant('certificate'), value: 'name' , sortable: true },
    { label: this.translator.instant('date.of.certificate'), value: 'certificationDate' , sortable: true },
    { label: this.translator.instant('expiration.date'), value: 'expiryDate' , sortable: true },
    { label: this.translator.instant('status'), value: 'status' , sortable: true },
    { label: this.translator.instant('proof.of.certification'), value: 'document' , sortable: false },
  ];

  data = [{
    certificate: 'asdasd',
    dateofcertificate: 'asdasd',
    expirationdate: 'asdasd',
    status: 'asdasd',
    proofofcertification: 'asdasd',
  }];
  tempExipryDate: any;
  tempCertificationDate: any;
  twoDocumentsPresent: boolean;
  loading = false;
  offset: Number = 0;
  datatableParam: DataTableParam;
  totalRecords: Number = 0;
  queryParam;
  sortField = 'CREATED_DATE';
  sortOrder;
  globalFilter;
  editMode = false;

  constructor(
    private translator: TranslateService,
    private _formBuilder: FormBuilder,
    private _localStorageService: LocalStorageService,
    private _notificationService: UINotificationService,
    private commonService: CommonService,
    private _fileService: FileDownloadService,
    private confirmDialogueService: ConfirmDialogueService,
    private _workerCertificateService: WorkerCertificateService,

  ) {
    this.loginUserId = this._localStorageService.getLoginUserId();
    this.loginUser = this._localStorageService.getLoginUserObject();
  }
  ngOnInit(): void {
    this.initializeCertificateForm();
    this.subscription.add(this.commonService.getAllCertificateList().subscribe(data => { this.certificateList = data; }));
  }

  onLazyLoad(event): void {
    this.sortOrder = event.sortOrder == -1 ? 0 : 1;
    this.globalFilter = event.globalFilter ? event.globalFilter : `{"USER_ID":"${this.loginUserId}"}`;
    this.sortField = event.sortField ? event.sortField : 'CREATED_DATE';
    this.offset = event.first / event.rows;
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ?  event.rows : 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadWorkerCertificateList();
  }


  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  loadWorkerCertificateList() {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this._workerCertificateService.getCertificateList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.loading = false;
            this.workerCertificateList = data.data.result;
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

  addCertificate() {
    this.submitted = false;
    this.editMode = false;
    this.workerCertificateDialog = true;
    this.initializeCertificateForm();
  }

  hideDialog() {
    this.editMode = false;
    this.workerCertificateDialog = false;
    this.files = [];
    this.expiredDate = null;
    this.certificateDate = null;
    this.submitted = false;
    this.initializeCertificateForm();
  }

  initializeCertificateForm() {
    this.workerCertificateForm = this._formBuilder.group({
      id: [null],
      certificate: ['', [CustomValidator.required, Validators.maxLength(50)]],
      status: ['PENDING'],
      documentPath1: ['', ],
      documentPath2: ['', ],
      documentName1: ['', ],
      documentName2: ['', ],
      certificationDate: ['', [CustomValidator.required]],
      expiryDate: ['', [CustomValidator.required]],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
    });
  }

  onSelect(event) {
    this.files.push(...event.addedFiles);
    if (event.rejectedFiles.length > 0) {
      if (event.rejectedFiles[0].reason === 'size') {
        this._notificationService.error(this.translator.instant('max.file.size.10.mb'), '');
      }else{
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

  uploadFile(id?: string) {
    if (this.files[1]) {
      this._notificationService.error(this.translator.instant('single.document.required'), '');
    } else {
      this.selectedLogo = this.files[0];
      if (this.selectedLogo) {
        const uploadImageData = new FormData();
        uploadImageData.append('file', this.selectedLogo);
        this._fileService.uploadFile(uploadImageData).subscribe(
          event => {
            if (event instanceof HttpResponse) {
              this.logoBody = event.body;
              this.logoData = this.logoBody.data;
              if (id && this.workerCertificate.documentPath1) {
                this.workerCertificateForm.controls.documentPath2.patchValue(this.logoData);
                this.workerCertificateForm.controls.documentName2.patchValue(this.selectedLogo.name);
              } else {
                this.workerCertificateForm.controls.documentName1.patchValue(this.selectedLogo.name);
                this.workerCertificateForm.controls.documentPath1.patchValue(this.logoData);
              }
              this.selectedLogo = null;
              this.onSubmitWorkerCertificate(true);
            }
          },
          (error) => {
            this._notificationService.error(this.translator.instant('common.error'), '');
          }
        );
      }
      else {
        this.onSubmitWorkerCertificate();
      }
    }
  }

  editWorkerCertificate(entity: workerCertificate) {
    this.workerCertificateDialog = true;

    this.editMode = true;
    this.workerCertificate = { ...entity };

    this.fatchworkerCertificate = this.workerCertificate;

    this.expiredDate = this.workerCertificate.expiryDate;
    this.expiredDate = new Date(this.expiredDate);

    this.certificateDate = this.workerCertificate.certificationDate;
    this.certificateDate = new Date(this.certificateDate);

    this.workerCertificateForm.controls.id.patchValue(this.workerCertificate.id);
    this.workerCertificateForm.controls.certificate.patchValue(this.workerCertificate.certificate);
    this.workerCertificateForm.controls.status.patchValue(this.workerCertificate.status);
    this.workerCertificateForm.controls.documentName1.patchValue(this.workerCertificate.documentName1);
    this.workerCertificateForm.controls.documentPath1.patchValue(this.workerCertificate.documentPath1);

    if (this.workerCertificate?.documentPath2) {
      this.workerCertificateForm.controls.documentName2.patchValue(this.workerCertificate.documentName2);
      this.workerCertificateForm.controls.documentPath2.patchValue(this.workerCertificate.documentPath2);
    }

    this.workerCertificateDialog = true;
  }

  onSubmitWorkerCertificate(isImage?: true) {
    this.submitted = true;

    if (!this.workerCertificateForm.valid) {
      CustomValidator.markFormGroupTouched(this.workerCertificateForm);
      this.submitted = true;

      return false;
    }
    if (this.workerCertificateForm.controls.id.value != null) {

      this.workerCertificate.certificate = this.workerCertificateForm.get('certificate').value;
      this.workerCertificate.status = this.workerCertificateForm.get('status').value;

      this.tempExipryDate = null;
      this.tempExipryDate = this.workerCertificateForm.get('expiryDate').value;
      this.workerCertificate.expiryDate = this.tempExipryDate.toISOString();

      this.tempCertificationDate = null;
      this.tempCertificationDate = this.workerCertificateForm.get('certificationDate').value;
      this.workerCertificate.certificationDate = this.tempCertificationDate.toISOString();

      if (isImage) {
        if (this.workerCertificate.documentPath1 && this.workerCertificate.documentPath2) {
          this.twoDocumentsPresent = true;
        } else if (this.workerCertificate.documentPath1 == '' && this.workerCertificate.documentPath2 == ''
          && this.workerCertificate.documentName1 == '' && this.workerCertificate.documentName2 == '') {
          this.workerCertificate.documentPath1 = this.workerCertificateForm.get('documentPath1').value;
          this.workerCertificate.documentName1 = this.workerCertificateForm.get('documentName1').value;
          this.workerCertificate.documentPath2 = '';
          this.workerCertificate.documentName2 = '';
        }
        else if (this.workerCertificate.documentPath2 && this.workerCertificate.documentName2 && this.workerCertificateForm.value.documentPath1 !== '') {
          this.workerCertificate.documentPath1 = this.workerCertificateForm.get('documentPath1').value;
          this.workerCertificate.documentName1 = this.workerCertificateForm.get('documentName1').value;
        } else if (this.workerCertificate.documentPath1 && this.workerCertificate.documentName1 && this.workerCertificateForm.value.documentPath2 !== '') {
          this.workerCertificate.documentPath2 = this.workerCertificateForm.get('documentPath2').value;
          this.workerCertificate.documentName2 = this.workerCertificateForm.get('documentName2').value;
        } else if (this.workerCertificate.documentPath1 == '') {
          this.workerCertificate.documentPath1 = this.workerCertificateForm.get('documentPath1').value;
          this.workerCertificate.documentName1 = this.workerCertificateForm.get('documentName1').value;
        }
      }

      if (this.twoDocumentsPresent) {
        this._notificationService.error('You can upload only two documents', '');
        this.files = [];
        this.twoDocumentsPresent = false;

      } else {
        this._workerCertificateService.updateCertificate(this.workerCertificate).subscribe(
          data => {
            if (data.statusCode === '200' && data.message === 'OK') {
              this._notificationService.success(this.translator.instant('certificate.updated'), '');
              this.files = [];
              this.expiredDate = null;
              this.certificateDate = null;
              this.workerCertificate = new workerCertificate();;
              this.submitted = false;
              this.workerCertificateDialog = false;

              this.loadWorkerCertificateList();

            } else {
              this._notificationService.error(data.message, '');
              this.files = [];
              this.expiredDate = null;
              this.certificateDate = null;
              this.workerCertificate = new workerCertificate();;
              this.submitted = false;
              this.workerCertificateDialog = false;

              this.loadWorkerCertificateList();
            }
          },
          (error) => {
            this._notificationService.error(this.translator.instant('common.error'), '');
            this.submitted = false;
            this.files = [];
            this.workerCertificate = new workerCertificate();;
            this.expiredDate = null;
            this.certificateDate = null;
            this.workerCertificateDialog = false;

            this.loadWorkerCertificateList();
          }
        );
      }
    } else {
      this.workerCertificate.certificate = this.workerCertificateForm.get('certificate').value;
      this.workerCertificate.status = this.workerCertificateForm.get('status').value;

      this.tempExipryDate = this.workerCertificateForm.get('expiryDate').value;
      this.workerCertificate.expiryDate = this.tempExipryDate.toISOString();

      this.tempCertificationDate = this.workerCertificateForm.get('certificationDate').value;
      this.workerCertificate.certificationDate = this.tempCertificationDate.toISOString();

      this.workerCertificate.user = this.loginUser;

      this.workerCertificate.documentPath1 = this.workerCertificateForm.get('documentPath1').value;
      this.workerCertificate.documentName1 = this.workerCertificateForm.get('documentName1').value;
      this.workerCertificate.documentPath2 = '';
      this.workerCertificate.documentName2 = '';


      this._workerCertificateService.addCertificate(this.workerCertificate).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('certificate.added'), '');
            this.submitted = false;
            this.files = [];
            this.expiredDate = null;
            this.certificateDate = null;
            this.workerCertificateDialog = false;
            this.workerCertificate = new workerCertificate();;

            this.loadWorkerCertificateList();
          } else {
            this._notificationService.error(data.message, '');
            this.files = [];
            this.expiredDate = null;
            this.certificateDate = null;
            this.submitted = false;
            this.workerCertificateDialog = false;
            this.workerCertificate = new workerCertificate();;

            this.loadWorkerCertificateList();
          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.files = [];
          this.expiredDate = null;
          this.certificateDate = null;
          this.workerCertificateDialog = false;
          this.submitted = false;
          this.workerCertificate = new workerCertificate();;

          this.loadWorkerCertificateList();

        }
      );
    }
  }

  filterCertificate(event) {
    const filtered: any[] = [];
    const query = event.query;
    for (let i = 0; i < this.certificateList.length; i++) {
      const certificate = this.certificateList[i];
      if (certificate.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(certificate);
      }
    }
    this.filteredCertificate = filtered;
    this.filteredCertificate = this.filteredCertificate.sort();
  }

  deleteLicense(id) {
    this._workerCertificateService.deleteCertificate(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this._notificationService.success(this.translator.instant('certificate.deleted'), '');
          this.hideDialog();
          this.loadWorkerCertificateList();

        } else {
          this._notificationService.error(data.message, '');
        }
      },
      (error) => {
        this._notificationService.error(this.translator.instant('common.error'), '');
        this.workerCertificateDialog = false;
        this.submitted = false;
      }
    );

  }

  deleteDocument(pathId, id) {
    this._workerCertificateService.deleteDocument(pathId, id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this._notificationService.success(this.translator.instant('document.deleted'), '');
          this.submitted = false;
          this.workerCertificateDialog = false;
          this.loadWorkerCertificateList();

        } else {
          this._notificationService.error(data.message, '');
        }
      },
      (error) => {
        this._notificationService.error(this.translator.instant('common.error'), '');
        this.workerCertificateDialog = false;
        this.submitted = false;
      }
    );
  }

  downloadFile(id) {
    this._workerCertificateService.downloadFile(id).subscribe(
      data => {
        const blob = new Blob([data], { type: 'application/zip' });
        const fileName = 'License';
        saveAs(blob, fileName);
        this.loadWorkerCertificateList();
        this._notificationService.success(this.translator.instant('document.downloaded'), '');
      },
      (error) => {
        this._notificationService.error(this.translator.instant('common.error'), '');
        this.workerCertificateDialog = false;
        this.submitted = false;
      }
    );
  }

  openDialog(id, name, path?): void {

    let options = null;
    const message = this.translator.instant('dialog.message.delete');

    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message}?`),
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text'),
    };

    this.confirmDialogueService.open(options);
    this.confirmDialogueService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        if (path) {
          if ((this.fatchworkerCertificate.documentName1 !== '') && (this.fatchworkerCertificate.documentName2 !== '')) {
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

  previous() {
    this.goBackToWorkExpAndEducation.emit('');
  }

  next() {
    this._notificationService.success(this.translator.instant('worker.profile.updated'), '');
    this.goToReference.emit('');
  }

  openDeleteDialogForTemp(index, title): void {
    let options = null;
    const message = this.translator.instant('dialog.message.delete');
    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message}?`),
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
