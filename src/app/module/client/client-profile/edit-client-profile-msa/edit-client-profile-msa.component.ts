import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver/dist/FileSaver';
import { ClientProfileService } from 'src/app/service/client-services/client-profile/client-profile.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';


@Component({
  selector: 'app-edit-client-profile-msa',
  templateUrl: './edit-client-profile-msa.component.html',
  styleUrls: ['./edit-client-profile-msa.component.css']
})
export class EditClientProfileMsaComponent implements OnInit, OnDestroy {
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  patchedDeail: FormGroup;
  checkedProject = false;
  checkedJob = false;
  clientProjectMSADetail: any;
  clientJobMSADetail: any;
  latestProjectAcceptedClientMSA: any;
  latestJobAcceptedClientMSA: any;
  content: any;
  contentJob: any;
  user: FormGroup;
  isProjectAccess: boolean;
  isJobAccess: boolean;
  loginUserId;
  submitted = false;
  submittedProjectMSA = false;
  submittedJobMSA = false;
  files: File[] = [];
  file;
  client: any;
  savedStep: number;


  constructor(
    public _clientProfileService: ClientProfileService,
    private router: Router,
    private _localStorageService: LocalStorageService,
    private _notificationService: UINotificationService,
    private _formBuilder: FormBuilder,
    private captionChangeService: HeaderManagementService,
    private translator: TranslateService
  ) {
    this.loginUserId = this._localStorageService.getLoginUserId();
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.CLIENT_PROFILE_2);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
  }

  ngOnInit(): void {
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.CLIENT_PROFILE_2);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this._clientProfileService.initializeForm();
    this.getLogedInClientDetail(this.loginUserId);
  }

  ngOnDestroy(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(false);
  }

  onClickProjectMSACheck() {
    this.checkedProject = !this.checkedProject;
  }

  onClickJobMSACheck() {
    this.checkedJob = !this.checkedJob;
  }

  getLogedInClientDetail(id) {
    this._clientProfileService.getClientDetail(id).subscribe(
      (data) => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.client = data.data;
          this.isProjectAccess = this.client.isProjectAccess;
          this.isJobAccess = this.client.isJobAccess;
          this.fatchDetail();
        } else {
        }
      },
      error => {
        this._notificationService.error(this.translator.instant('common.error'), '');
      }
    );
  }

  fatchDetail() {
    if (this.client.lastSavedStep == 1 || this.client.lastSavedStep == 2) {
      this.savedStep = 2;
      if (this.savedStep == 2 || this.client.lastSavedStep == 2) {
        this._clientProfileService.clientEditForm = this._formBuilder.group({
          id: this.client.id,
          companyName: this.client.companyName,
          companyPhone: this.client.companyPhone,
          contactPhone: this.client.contactPhone,
          contactName: this.client.contactName,
          contactEmail: this.client.contactEmail,
          user: {
            id: this.client.user.id,
          },
          yearFounded: this.client.yearFounded,
          numberOfEmployee: { id: this.client.numberOfEmployee.id },
          dunNumber: this.client.dunNumber,
          companyDescription: this.client.companyDescription,
          city: this.client.city,
          photo: this.client.photo,
          state: this.client.state,
          zipCode: this.client.zipCode,
          latitude: this.client.latitude,
          longitude: this.client.longitude,
          location: this.client.location,
          lastSavedStep: 2,

          isProjectAccess: this.client.isProjectAccess,
          isJobAccess: this.client.isJobAccess,
          isProjectApproved: this.client.isProjectApproved,
          isJobApproved: this.client.isJobApproved,
          isProjectMSAccepted: this.client.isProjectMSAccepted,
          isJobMSAccepted: this.client.isJobMSAccepted,

          legalCompanyName: ['', [CustomValidator.required, Validators.maxLength(50)]],
          designation: ['', [CustomValidator.required, Validators.maxLength(30)]],
        });
      }
    }

    this._clientProfileService.clientEditForm.patchValue({
      id: this.client.id,
      companyName: this.client.companyName,
      companyPhone: this.client.companyPhone,
      contactPhone: this.client.contactPhone,
      contactName: this.client.contactName,
      contactEmail: this.client.contactEmail,
      user: {
        id: this.client.user.id,
        email: this.client.user.email,
        active: this.client.user.active,
        approvedByAdmin: this.client.user.approvedByAdmin,
        createdBy: this.client.user.createdBy,
        updatedBy: this.client.user.updatedBy,
        firstName: this.client.user.firstName,
        lastName: this.client.user.lastName,
        deleted: this.client.user.deleted,
        verified: this.client.user.verified,
      },
      yearFounded: this.client.yearFounded,
      numberOfEmployee: { id: this.client.numberOfEmployee.id },
      dunNumber: this.client.dunNumber,
      companyDescription: this.client.companyDescription,
      city: this.client.city,
      state: this.client.state,
      zipCode: this.client.zipCode,
      photo: this.client.photo,
      legalCompanyName: this.client.legalCompanyName,
      designation: this.client.designation,
      lastSavedStep: 2,

      isProjectAccess: this.client.isProjectAccess,
      isJobAccess: this.client.isJobAccess,
      isProjectApproved: this.client.isProjectApproved,
      isJobApproved: this.client.isJobApproved,
      isProjectMSAccepted: this.client.isProjectMSAccepted,
      isJobMSAccepted: this.client.isJobMSAccepted,

      latitude: this.client.latitude,
      longitude: this.client.longitude,
      location: this.client.location,
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      createdDate: this.client.createdDate,
      updatedDate: this.client.updatedDate
    });
    this.getClientMSA();
    this.getLatestClientMSA();
  }

  getClientMSA() {
    if (this.isProjectAccess && this.isJobAccess) {
      this._clientProfileService.getActiveMsaByClient(this.loginUserId, 'PROJECT').subscribe(
        data => {
          this.clientProjectMSADetail = data.data;
          this.content = this.clientProjectMSADetail.content;
        });
      this._clientProfileService.getActiveMsaByClient(this.loginUserId, 'JOBS').subscribe(
        data => {
          this.clientJobMSADetail = data.data;
          this.contentJob = this.clientJobMSADetail.content;
        });
    } else if (this.isJobAccess) {
      this._clientProfileService.getActiveMsaByClient(this.loginUserId, 'JOBS').subscribe(
        data => {
          this.clientJobMSADetail = data.data;
          this.contentJob = this.clientJobMSADetail.content;
        });
    } else if (this.isProjectAccess) {
      this._clientProfileService.getActiveMsaByClient(this.loginUserId, 'PROJECT').subscribe(
        data => {
          this.clientProjectMSADetail = data.data;
          this.content = this.clientProjectMSADetail.content;
        });
    }
    else {
    }
  }

  onSubmitProject() {
    if (this.isProjectAccess && this.checkedProject) {

      this.submittedProjectMSA = true;
      this._clientProfileService.acceptClientMSA(this.clientProjectMSADetail.id, this.loginUserId).subscribe(data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this._notificationService.success(this.translator.instant('client.projectMsa.accepted'), '');
          this.submittedProjectMSA = false;
          setTimeout(() => {
            this.getLatestClientMSA();
          }, 3000);
        } else {
          this._notificationService.error(data.message, '');
        }
      },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.submittedProjectMSA = false;
        }
      );
    }
    else {
      return this._notificationService.error(this.translator.instant('client.profile.error'), '');
    }
  }

  onSubmitJob() {
    if (this.isJobAccess && this.checkedJob) {
      this.submittedJobMSA = true;
      this._clientProfileService.acceptClientMSA(this.clientJobMSADetail.id, this.loginUserId).subscribe(data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this._notificationService.success(this.translator.instant('client.jobMsa.accepted'), '');
          this.submittedJobMSA = false;
          setTimeout(() => {
            this.getLatestClientMSA();
          }, 3000);
        } else {
          this._notificationService.error(data.message, '');
        }
      },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.submittedJobMSA = false;
        }
      );
    } else {
      return this._notificationService.error(this.translator.instant('client.profile.error'), '');
    }
  }

  getLatestClientMSA() {
    if (this.isProjectAccess && this.isJobAccess) {
      this._clientProfileService.getLatestAcceptedClientMSA(this.loginUserId, 'PROJECT').subscribe(
        data => {
          this.latestProjectAcceptedClientMSA = data.data;
          if (data.statusCode === '200' && data.message === 'OK') {
            this.submitted = false;
          } else {
            if (data.message !== 'No data found.') {
              this._notificationService.error(data.message, '');
            }
          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.submitted = false;

        });
      this._clientProfileService.getLatestAcceptedClientMSA(this.loginUserId, 'JOBS').subscribe(
        data => {
          this.latestJobAcceptedClientMSA = data.data;
          if (data.statusCode === '200' && data.message === 'OK') {
            this.submitted = false;
          } else {
            if (data.message !== 'No data found.') {
              this._notificationService.error(data.message, '');
            }
          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.submitted = false;
        });
    }
    else if (this.isJobAccess) {
      this._clientProfileService.getLatestAcceptedClientMSA(this.loginUserId, 'JOBS').subscribe(
        data => {
          this.latestJobAcceptedClientMSA = data.data;
          if (data.statusCode === '200' && data.message === 'OK') {
            this.submitted = false;
          } else {
            if (data.message !== 'No data found.') {
              this._notificationService.error(data.message, '');
            }
          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.submitted = false;
        });
    } else if (this.isProjectAccess) {
      this._clientProfileService.getLatestAcceptedClientMSA(this.loginUserId, 'PROJECT').subscribe(
        data => {
          this.latestProjectAcceptedClientMSA = data.data;
          if (data.statusCode === '200' && data.message === 'OK') {
            this.submitted = false;
          } else {
            if (data.message !== 'No data found.') {
              this._notificationService.error(data.message, '');
            }
          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.submitted = false;

        });
    }
    else {
      return console.log('nothing to show');
    }
  }

  onSubmit() {
    this.submitted = true;

    if (!this._clientProfileService.clientEditForm.valid) {
      let controlName: string;
      // tslint:disable-next-line: forin
      for (controlName in this._clientProfileService.clientEditForm.controls) {
        this._clientProfileService.clientEditForm.controls[controlName].markAsDirty();
        this._clientProfileService.clientEditForm.controls[controlName].updateValueAndValidity();
      }
      this.submitted = true;
      return false;
    }

    if (this._clientProfileService.clientEditForm.controls.id.value != null && this._clientProfileService.clientEditForm.valid) {

      this._clientProfileService.updateClientProfile(JSON.stringify(this._clientProfileService.clientEditForm.value)).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('client.updated'), '');
          } else {
            this._notificationService.error(data.message, '');
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

  downloadJobMSA() {
    this._clientProfileService.downloadFile(this.latestJobAcceptedClientMSA.documentPath, this.latestJobAcceptedClientMSA.documentName).subscribe(
      data => {
        const blob = new Blob([data], { type: 'application/pdf' });
        const fileName = this.latestJobAcceptedClientMSA.documentName;
        saveAs(blob, fileName);
      },
      error => {
        this._notificationService.error(this.translator.instant('common.error'), '');
      }
    );
  }

  downloadProjectMSA() {
    this._clientProfileService.downloadFile(this.latestProjectAcceptedClientMSA.documentPath, this.latestProjectAcceptedClientMSA.documentName).subscribe(
      data => {
        const blob = new Blob([data], { type: 'application/pdf' });
        const fileName = this.latestProjectAcceptedClientMSA.documentName;
        saveAs(blob, fileName);
      },
      error => {
        this._notificationService.error(this.translator.instant('common.error'), '');
      }
    );
  }

  previous() {
    this.router.navigate(['client/edit-client']);
  }

}
