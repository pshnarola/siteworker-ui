import { HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { SubcontractorProfileService } from 'src/app/service/subcontractor-services/subcontractor-profile/subcontractor-profile.service';
import { CommonService } from 'src/app/shared/common-services/common.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { State } from 'src/app/shared/vo/state/state';
import { environment } from 'src/environments/environment';
import { SubcontractorProfileDto } from '../vo/subcontractor-profile-dto';

@Component({
  selector: 'app-basic-information',
  templateUrl: './basic-information.component.html',
  styleUrls: ['./basic-information.component.css']
})
export class BasicInformationComponent implements OnInit {
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  selectedLogo: File;
  logoBody: any;
  logoData: string;
  image: any;
  singleImageView: any;
  files: File[] = [];
  showPreview: boolean = false;
  event: Event;
  displayAvatar: boolean = false;
  usernameLabel: string;
  @Output() goToCompanyDetail = new EventEmitter<any>();

  spinner: boolean = false;

  loginUserId: string;
  subcontractor: SubcontractorProfileDto;
  submitted: boolean = false;

  logInAsCompany = false;
  descriptionLabel = null;
  stateNameList = [];
  stateData: State[];
  filteredState: any[] = [];
  subscription = new Subscription();
  
  constructor(
    public _subContractorProfileServices: SubcontractorProfileService,
    private _localStorageService: LocalStorageService,
    private _notificationService: UINotificationService,
    private captionChangeService: HeaderManagementService,
    private translator: TranslateService,
    private commonService: CommonService,
  ) {
    this.loginUserId = _localStorageService.getLoginUserId();
    this.subcontractor = new SubcontractorProfileDto();
  }


  ngOnInit(): void {
    this._subContractorProfileServices.initializeForm();
    this.getLogedInClientDetail(this.loginUserId);
    this.subscription.add(this.commonService.stateList.subscribe(data => {
      this.stateData = data;
      this.stateData.forEach(state => {
        this.stateNameList.push(state.name);
      });
    }));
  }


  onSelect(event) {
    this.files.push(...event.addedFiles);
    if (this.files[1] != null) {
      this.onRemove(this.files[0]);
    }
    this.selectedLogo = this.files[0];
    this.showPreview = true;
    if (event.rejectedFiles.length > 0) {
      if (event.rejectedFiles[0].reason === 'size') {
        this._notificationService.error(this.translator.instant('max.file.size.5.mb'), '');
      } else {
        this._notificationService.error(this.translator.instant('image.upload'), '');
      }
      event.rejectedFiles = [];
      this.showPreview = false;
    }
  }

  onRemove(event) {
    this.files.splice(this.files.indexOf(event), 1);
    this.showPreview = false;
  }

  uploadLogo(next?: string) {
    this.spinner = true;
    if (this.selectedLogo) {
      const uploadImageData = new FormData();
      uploadImageData.append('file', this.selectedLogo);
      this._subContractorProfileServices.uploadLogo(uploadImageData).subscribe(
        event => {
          if (event instanceof HttpResponse) {
            this.logoBody = event.body;
            this.logoData = this.logoBody.data;
            this._subContractorProfileServices.subcontractorEditForm.controls.photo.patchValue(this.logoData);
            if (next == "next") {
              this.onSubmit("next");
            } else {
              this.onSubmit();
            }
          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          console.log(error);
          this.spinner = false;
        }
      );
    }
    else {
      if (next == "next") {
        this.onSubmit("next");
      } else {
        this.onSubmit();
      }
    }
  }

  getLogedInClientDetail(id) {
    this._subContractorProfileServices.getSubcontractorDetail(id).subscribe(
      (data) => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.subcontractor = data.data;
          this.fatchDetail();
        } else {
        }
      },
      error => {
        this._notificationService.error(this.translator.instant('common.error'), '');
        console.log(error);
      }
    );
  }


  fatchDetail() {

    this.logInAsCompany = this.subcontractor.subcontractorProfile.isLoginAsCompany;
    this.descriptionLabel = this.subcontractor.subcontractorProfile.description;

    if (this.subcontractor.subcontractorProfile.isLoginAsCompany) {
      this._subContractorProfileServices.subcontractorEditForm.removeControl('dbaPersonal');
      this._subContractorProfileServices.subcontractorEditForm.addControl('dba', new FormControl('', [CustomValidator.required, Validators.maxLength(50)]));
      if (this.subcontractor.subcontractorProfile.dba) {
        this._subContractorProfileServices.subcontractorEditForm.patchValue({
          dba: this.subcontractor.subcontractorProfile.dba,
        });
      }
    } else {
      this._subContractorProfileServices.subcontractorEditForm.removeControl('dba');
      if (this.subcontractor.subcontractorProfile.dba) {

        this._subContractorProfileServices.subcontractorEditForm.patchValue({
          dbaPersonal: this.subcontractor.subcontractorProfile.dba,
        });
      }
    }

    this._subContractorProfileServices.subcontractorEditForm.patchValue({
      id: this.subcontractor.subcontractorProfile.id,
      companyName: this.subcontractor.subcontractorProfile.companyName,
      workPhone: this.subcontractor.subcontractorProfile.workPhone,
      mobilePhone: this.subcontractor.subcontractorProfile.mobilePhone,
      userId: this.subcontractor.subcontractorProfile.user.id,
      email: this.subcontractor.subcontractorProfile.user.email,
      firstName: this.subcontractor.subcontractorProfile.user.firstName,
      lastName: this.subcontractor.subcontractorProfile.user.lastName,
      yearFounded: this.subcontractor.subcontractorProfile.yearFounded,
      description: this.subcontractor.subcontractorProfile.description,
      city: this.subcontractor.subcontractorProfile.city,
      state: this.subcontractor.subcontractorProfile.state,
      zipCode: this.subcontractor.subcontractorProfile.zipCode,

      photo: this.subcontractor.subcontractorProfile.photo,
      lastSavedStep: this.subcontractor.subcontractorProfile.lastSavedStep,
      loginAsCompany: this.subcontractor.subcontractorProfile.isLoginAsCompany,

      latitude: 1,
      longitude: 1,

    });
    this.usernameLabel = this.subcontractor.subcontractorProfile.user.firstName.substring(0, 1) + this.subcontractor.subcontractorProfile.user.lastName.substring(0, 1)

    if (this.subcontractor.subcontractorProfile.photo) {
      this.displayAvatar = false;
      this.singleImageView = environment.baseURL + "/file/getById?fileId=" + this.subcontractor.subcontractorProfile.photo;
    } else {
      this.displayAvatar = true;
    }



  }

  get form() { return this._subContractorProfileServices.subcontractorEditForm; }

  onSubmit(next?) {

    this.submitted = true;
    if (!this._subContractorProfileServices.subcontractorEditForm.valid) {
      CustomValidator.markFormGroupTouched(this._subContractorProfileServices.subcontractorEditForm);
      this.submitted = true;
      this.spinner = false;
      return false;
    }

    if (this._subContractorProfileServices.subcontractorEditForm.controls.id.value != null || !this._subContractorProfileServices.subcontractorEditForm.valid) {

      if (this.subcontractor.subcontractorProfile.isLoginAsCompany) {
        this.subcontractor.subcontractorProfile.dba = this._subContractorProfileServices.subcontractorEditForm.get('dba').value;
      } else {
        this.subcontractor.subcontractorProfile.dba = this._subContractorProfileServices.subcontractorEditForm.get('dbaPersonal').value;
      }

      this.subcontractor.subcontractorProfile.id = this._subContractorProfileServices.subcontractorEditForm.get('id').value;
      this.subcontractor.subcontractorProfile.user.id = this._subContractorProfileServices.subcontractorEditForm.get('userId').value;
      this.subcontractor.subcontractorProfile.user.firstName = this._subContractorProfileServices.subcontractorEditForm.get('firstName').value;
      this.subcontractor.subcontractorProfile.user.lastName = this._subContractorProfileServices.subcontractorEditForm.get('lastName').value;
      this.subcontractor.subcontractorProfile.companyName = this._subContractorProfileServices.subcontractorEditForm.get('companyName').value;
      this.subcontractor.subcontractorProfile.user.email = this._subContractorProfileServices.subcontractorEditForm.get('email').value;
      this.subcontractor.subcontractorProfile.mobilePhone = this._subContractorProfileServices.subcontractorEditForm.get('mobilePhone').value;
      this.subcontractor.subcontractorProfile.workPhone = this._subContractorProfileServices.subcontractorEditForm.get('workPhone').value;
      this.subcontractor.subcontractorProfile.description = this._subContractorProfileServices.subcontractorEditForm.get('description').value;
      this.subcontractor.subcontractorProfile.photo = this._subContractorProfileServices.subcontractorEditForm.get('photo').value;

      this._subContractorProfileServices.updateSubcontractorProfile(this.subcontractor).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('subcontractor.profile.updated'), '');
            this.submitted = false;
            this.files = [];
            this.showPreview = false;
            this.selectedLogo = null;
            this.spinner = false;
            this.captionChangeService.profileDataSubject.next(data.data.subcontractorProfile.user.id);
            if (data.data.subcontractorProfile.photo) {
              this.singleImageView = environment.baseURL + "/file/getById?fileId=" + data.data.subcontractorProfile.photo;
              this.displayAvatar = false;
            }
            if (next == "next") {
              this.next("next");
            }
          } else {
            this._notificationService.error(data.message, '');
            this.spinner = false;
          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          console.log(error);
          this.submitted = false;
          this.files = [];
          this.showPreview = false;
          this.spinner = false;
        }
      );

    }
    else {
    }
  }

  next(string) {
    this.goToCompanyDetail.emit('');
    this._subContractorProfileServices.subContractorProfileDetailSubject.next(this.subcontractor);
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


}
