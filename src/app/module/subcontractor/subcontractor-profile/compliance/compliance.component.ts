import { HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { FileDownloadService } from 'src/app/service/admin-services/fileDownload/file-download.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { ComplianceService } from 'src/app/service/subcontractor-services/compliance/compliance.service';
import { SubcontractorProfileService } from 'src/app/service/subcontractor-services/subcontractor-profile/subcontractor-profile.service';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { Compliance } from '../vo/compliance';
import { SubcontractorProfileDto } from '../vo/subcontractor-profile-dto';

@Component({
  selector: 'app-compliance',
  templateUrl: './compliance.component.html',
  styleUrls: ['./compliance.component.css']
})
export class ComplianceComponent implements OnInit {

  complianceDetail: Compliance;
  date = null;
  selectedValue = false;
  dateTime = new Date();
  checkedSafetyManual = false;
  checkedBackGroundCheck = false;
  complianceForm: FormGroup;
  loginUserId: any;
  compliance: Compliance;
  files: File[] = [];
  FileName = '';
  selectedLogo: File;
  showPreview = false;
  logoBody: any;
  logoData: string;
  image: any;
  singleImageView: any;
  tempDate: any;
  submitted: boolean;
  spinner = false;

  @Output() goToReference = new EventEmitter<any>();
  @Output() goToLicense = new EventEmitter<any>();

  subcontractor: SubcontractorProfileDto;
  temp: Date;
  loginUser: any;

  constructor(
    private translator: TranslateService,
    private _formBuilder: FormBuilder,
    private _localStorageService: LocalStorageService,
    private _fileService: FileDownloadService,
    private _complianceService: ComplianceService,
    private _notificationService: UINotificationService,
    public _subContractorProfileServices: SubcontractorProfileService,
    private confirmDialogueService: ConfirmDialogueService,
  ) {
    this.loginUserId = _localStorageService.getLoginUserId();
    this.loginUser = _localStorageService.getLoginUserObject();
  }

  ngOnInit(): void {
    this._subContractorProfileServices.subContractorProfileDetailSubject.subscribe(data => this.subcontractor = data);
    this.initializeForm();
    this.fatchDetail(this.loginUserId);
    this.getLogedInClientDetail(this.loginUserId);
  }

  onClickSafetyManual() {
    this.checkedSafetyManual = !this.checkedSafetyManual;
  }

  onClickBackGroundCheck() {
    this.checkedBackGroundCheck = !this.checkedBackGroundCheck;
  }

  getLogedInClientDetail(id) {
    this._subContractorProfileServices.getSubcontractorDetail(id).subscribe(
      (data) => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.subcontractor = data.data;
        } else {
        }
      },
      error => {
        this._notificationService.error(this.translator.instant('common.error'), '');
      }
    );
  }


  onSelect(event) {
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
  }

  initializeForm() {
    this.complianceForm = this._formBuilder.group({
      id: [null],
      isSafetyManualFollowed: [false],
      hasAutoInsurance: [true],
      autoInsuranceExpiryDate: ['', CustomValidator.required],
      documentPath: [''],
      documentName: [''],
      isBackgroundCheckAndDrugScreening: [false],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
    });
    this.complianceForm.get('hasAutoInsurance').valueChanges.subscribe(response => {
      if (!response) {
        this.selectedValue = false;
        this.complianceForm.removeControl('autoInsuranceExpiryDate');
      }
      if (response) {
        this.selectedValue = true;
        this.complianceForm.addControl('autoInsuranceExpiryDate', new FormControl('', Validators.required));
      }
    });
  }

  fatchDetail(id) {
    this.initializeForm();
    this._complianceService.getComplianceById(id).subscribe(
      data => {
        if (data.statusCode == '200') {
          this.complianceDetail = data.data;
          this.appendData(this.complianceDetail);
        }
      });
  }

  appendData(complianceTemp) {
    if (complianceTemp.autoInsuranceExpiryDate) {
      this.temp = new Date(complianceTemp.autoInsuranceExpiryDate);
      this.date = this.temp;
    }
    else {
      this.temp = null;
      this.date = this.temp;
    }
    this.selectedValue = complianceTemp.hasAutoInsurance;

    this.complianceForm.patchValue({
      id: complianceTemp.id,
      isSafetyManualFollowed: complianceTemp.isSafetyManualFollowed,
      hasAutoInsurance: complianceTemp.hasAutoInsurance,
      autoInsuranceExpiryDate: this.temp,
      documentPath: complianceTemp.documentPath,
      documentName: complianceTemp.documentName,
      isBackgroundCheckAndDrugScreening: complianceTemp.isBackgroundCheckAndDrugScreening,
    });

  }

  uploadFile(next?: string) {

    if (!this.complianceForm.valid) {
      CustomValidator.markFormGroupTouched(this.complianceForm);
      this.submitted = true;
      return false;
    }

    if (this.files[1]) {
      this._notificationService.error(this.translator.instant('single.document.required'), '');
    } else {
      this.selectedLogo = this.files[0];

      if (this.complianceForm.value.id && this.complianceForm.value.hasAutoInsurance) {
        if (this.selectedLogo) {
          const uploadImageData = new FormData();
          uploadImageData.append('file', this.selectedLogo);
          this._fileService.uploadFile(uploadImageData).subscribe(
            event => {
              this.FileName = this.selectedLogo.name;
              if (event instanceof HttpResponse) {
                this.logoBody = event.body;
                this.logoData = this.logoBody.data;
                this.complianceForm.controls.documentPath.patchValue(this.logoData);
                this.complianceForm.controls.documentName.patchValue(this.selectedLogo.name);
                this.selectedLogo = null;
                if (next == 'next') {
                  this.onSubmit('next');
                } else {
                  this.onSubmit();
                }
              }
            },
            (error) => {
              this._notificationService.error(this.translator.instant('common.error'), '');
            }
          );
        }
        else {
          if (this.complianceForm.value.documentPath && this.complianceForm.value.documentName) {
            if (next === 'next') {
              this.onSubmit('next');
            } else {
              this.onSubmit();
            }
          } else {
            this._notificationService.error('Document is mandatory', '');
          }
        }
      } else if (this.complianceForm.value.id) {
        if (next === 'next') {
          this.onSubmit('next');
        } else {
          this.onSubmit();
        }
      }

      if (!this.complianceForm.value.id && this.complianceForm.value.hasAutoInsurance) {
        if (this.selectedLogo) {
          const uploadImageData = new FormData();
          uploadImageData.append('file', this.selectedLogo);
          this._fileService.uploadFile(uploadImageData).subscribe(
            event => {
              this.FileName = this.selectedLogo.name;
              if (event instanceof HttpResponse) {
                this.logoBody = event.body;
                this.logoData = this.logoBody.data;
                this.complianceForm.controls.documentPath.patchValue(this.logoData);
                this.complianceForm.controls.documentName.patchValue(this.selectedLogo.name);
                this.selectedLogo = null;
                if (next == 'next') {
                  this.onSubmit('next');
                } else {
                  this.onSubmit();
                }
              }
            },
            (error) => {
              this._notificationService.error(this.translator.instant('common.error'), '');
            }
          );
        }
        else {
          this._notificationService.error('Document is mandatory', '');
        }
      } else if (!this.complianceForm.value.id) {
        if (next == 'next') {
          this.onSubmit('next');
        } else {
          this.onSubmit();
        }
      }


    }
  }

  onSubmit(next?) {
    this.submitted = true;

    if (!this.complianceForm.valid) {
      CustomValidator.markFormGroupTouched(this.complianceForm);
      this.submitted = true;

      return false;
    }
    if (this.complianceForm.controls.id.value != null) {

      this.compliance = this.complianceForm.value;
      this.compliance.user = this.loginUser;

      if (this.complianceForm.value.autoInsuranceExpiryDate) {
        this.tempDate = this.complianceForm.get('autoInsuranceExpiryDate').value;
        this.compliance.autoInsuranceExpiryDate = this.tempDate.toISOString();
      }
      this._complianceService.updateCompliance(this.compliance).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('subcontractor.profile.updated'), '');
            this.submitted = false;
            this.files = [];

            this.fatchDetail(this.loginUserId);
            if (next == 'next') {
              this.next();
            }
          } else {
            this._notificationService.error(data.message, '');
            this.files = [];

            this.fatchDetail(this.loginUserId);
          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.submitted = false;
          this.files = [];
          this.fatchDetail(this.loginUserId);
        }
      );

    } else {
      this.compliance = this.complianceForm.value;
      // if (this.complianceForm.get('autoInsuranceExpiryDate').value) {
      if (this.complianceForm.value.autoInsuranceExpiryDate) {
        this.tempDate = this.complianceForm.get('autoInsuranceExpiryDate').value;
        this.compliance.autoInsuranceExpiryDate = this.tempDate.toISOString();
      }
      // selectedValue
      this.compliance.user = this.loginUser;

      this._complianceService.addCompliance(this.compliance).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('subcontractor.profile.updated'), '');
            this.submitted = false;
            this.files = [];

            this.fatchDetail(this.loginUserId);
            if (next == 'next') {
              this.next();
            }
          } else {
            this._notificationService.error(data.message, '');
            this.files = [];

            this.fatchDetail(this.loginUserId);
          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.submitted = false;
          this.files = [];

          this.fatchDetail(this.loginUserId);
        }
      );
    }
  }


  next(string?) {
    this.goToReference.emit('');
  }

  previous(string?) {
    this.goToLicense.emit('');
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
