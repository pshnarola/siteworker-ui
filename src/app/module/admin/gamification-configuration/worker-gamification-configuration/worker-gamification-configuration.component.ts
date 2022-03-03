import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { FileDownloadService } from 'src/app/service/admin-services/fileDownload/file-download.service';
import { GamificationConfigurationService } from 'src/app/service/admin-services/gamification-configuration/gamification-configuration.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { environment } from 'src/environments/environment';
import { GamificationConfigurationWorkerDTO } from '../../vos/GamificationConfigurationWorkerDTO';

@Component({
  selector: 'app-worker-gamification-configuration',
  templateUrl: './worker-gamification-configuration.component.html',
  styleUrls: ['./worker-gamification-configuration.component.css']
})
export class WorkerGamificationConfigurationComponent implements OnInit {

  message: string;
  showButtons = true;
  clientAccess: any;
  btnDisabled = false;
  gamificationWorkerForm: FormGroup;
  isGamificationEnabled = false;
  submitted = false;
  datatableParam: DataTableParam;
  queryParam;
  workerGamificationData: GamificationConfigurationWorkerDTO;
  sortField = 'CREATED_DATE';
  searchText: string = null;
  selectedPhoto: File;
  logoBody: any;
  logoData: string;
  image: any;
  singleImageView: any;
  files: File[] = [];
  showPreview = false;
  profileFile: File[];
  giveAwayImageUrl = 'assets/images/giveAway.jpg';

  constructor(
    private translator: TranslateService,
    private localStorageService: LocalStorageService,
    private captionChangeService: HeaderManagementService,
    private formBuilder: FormBuilder,
    private notificationService: UINotificationService,
    private fileService: FileDownloadService,
    private confirmDialogueService: ConfirmDialogueService,
    private gamificationConfigurationService: GamificationConfigurationService,
  ) {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
  }

  ngOnInit(): void {
    this.clientAccess = this.localStorageService.getItem('userAccess');
    this.initializeForm();
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.getWorkerGamificationConfiguration();
    if (this.clientAccess) {
      this.menuAccess();
    }
  }


  menuAccess(): void {
    const accessPermission = this.clientAccess.filter(e => e.menuName === 'Masters');
    if (accessPermission[0].canModify) {
      this.showButtons = true;
      this.btnDisabled = false;
    }
    else {
      this.showButtons = false;
      this.btnDisabled = true;
    }
  }

  initializeForm() {
    this.gamificationWorkerForm = this.formBuilder.group({
      id: [],
      addReferences: ['', [CustomValidator.required]],
      addCertifications: ['', [CustomValidator.required]],
      workExperience: ['', [CustomValidator.required]],
      qualityRatingFourToFive: ['', [CustomValidator.required]],
      qualityRatingThreeToFour: ['', [CustomValidator.required]],
      qualityRatingBelowThree: ['', [CustomValidator.required]],
      safetyRatingFourToFive: ['', [CustomValidator.required]],
      safetyRatingThreeToFour: ['', [CustomValidator.required]],
      safetyRatingBelowThree: ['', [CustomValidator.required]],
      fourtyToEightyJobHours: ['', [CustomValidator.required]],
      eightyToOneTwentyJobHours: ['', [CustomValidator.required]],
      aboveOneTwentyJobHours: ['', [CustomValidator.required]],
      powerUser: ['', [CustomValidator.required]],
      yellowHardHat: ['', [CustomValidator.required]],
      benefitsofaMonthforWorker: ['', [CustomValidator.required]],
      photo: []
    });


  }

  onSubmit(): any {
    this.submitted = true;
    if (!this.gamificationWorkerForm.valid) {
      CustomValidator.markFormGroupTouched(this.gamificationWorkerForm);
      this.submitted = true;
      return false;
    }
    const gamificationConfigurationWorkerDTO = new GamificationConfigurationWorkerDTO();
    gamificationConfigurationWorkerDTO.referencePoint = this.gamificationWorkerForm.value.addReferences;
    gamificationConfigurationWorkerDTO.certificationPoint = this.gamificationWorkerForm.value.addCertifications;
    gamificationConfigurationWorkerDTO.workerExperiencePoint = this.gamificationWorkerForm.value.workExperience;
    gamificationConfigurationWorkerDTO.qualityRatingFourToFivePoint = this.gamificationWorkerForm.value.qualityRatingFourToFive;
    gamificationConfigurationWorkerDTO.qualityRatingThreeToFourPoint = this.gamificationWorkerForm.value.qualityRatingThreeToFour;
    gamificationConfigurationWorkerDTO.qualityRatingBelowThreePoint = this.gamificationWorkerForm.value.qualityRatingBelowThree;
    gamificationConfigurationWorkerDTO.safetyRatingFourToFivePoint = this.gamificationWorkerForm.value.safetyRatingFourToFive;
    gamificationConfigurationWorkerDTO.safetyRatingThreeToFourPoint = this.gamificationWorkerForm.value.safetyRatingThreeToFour;
    gamificationConfigurationWorkerDTO.safetyRatingBelowThreePoint = this.gamificationWorkerForm.value.safetyRatingBelowThree;
    gamificationConfigurationWorkerDTO.jobPointForMinHrs = this.gamificationWorkerForm.value.fourtyToEightyJobHours;
    gamificationConfigurationWorkerDTO.jobPointForMidHrs = this.gamificationWorkerForm.value.eightyToOneTwentyJobHours;
    gamificationConfigurationWorkerDTO.jobPointForMaxHrs = this.gamificationWorkerForm.value.aboveOneTwentyJobHours;
    gamificationConfigurationWorkerDTO.powerUserPoint = this.gamificationWorkerForm.value.powerUser;
    gamificationConfigurationWorkerDTO.yellowRedHatUserPoint = this.gamificationWorkerForm.value.yellowHardHat;
    gamificationConfigurationWorkerDTO.comments = this.gamificationWorkerForm.value.benefitsofaMonthforWorker;
    gamificationConfigurationWorkerDTO.photo = this.gamificationWorkerForm.value.photo;
    gamificationConfigurationWorkerDTO.createdBy = this.localStorageService.getLoginUserId();
    gamificationConfigurationWorkerDTO.updatedBy = this.localStorageService.getLoginUserId();
    if (this.checkLengthForComments(this.gamificationWorkerForm.value.benefitsofaMonthforWorker)) {
      if (this.workerGamificationData) {
        gamificationConfigurationWorkerDTO.id = this.gamificationWorkerForm.value.id;
        this.gamificationConfigurationService.updateWorkerGamificationConfiguration(gamificationConfigurationWorkerDTO).subscribe(data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.notificationService.success(this.translator.instant('worker.configuration.updated'), '');
            this.singleImageView = null;
            this.files = [];
            this.showPreview = false;
            this.getWorkerGamificationConfiguration();
          }
        });
      }
      else {
        this.gamificationConfigurationService.addWorkerGamificationConfiguration(gamificationConfigurationWorkerDTO).subscribe(data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.notificationService.success(this.translator.instant('worker.configuration.created'), '');
            this.singleImageView = null;
            this.files = [];
            this.showPreview = false;
            this.getWorkerGamificationConfiguration();
          }
        });
      }
    } else {
      this.notificationService.error('Length of benefit comments should be less than 1000', '');
    }
  }
  getWorkerGamificationConfiguration() {
    this.datatableParam = {
      offset: 0,
      size: 10,
      sortField: this.sortField,
      sortOrder: 1,
      searchText: this.searchText
    };
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.gamificationConfigurationService.getWorkerGamificationConfigurationList(this.queryParam).subscribe(data => {
      if (data.statusCode === '200') {
        if (data.message === 'OK') {
          if (data.data.result.length) {
            this.workerGamificationData = data.data.result[0];
            this.patchDetail();
          }
          else {
            this.workerGamificationData = null;
          }
        }
      }
    });
  }
  patchDetail() {
    this.gamificationWorkerForm.patchValue({
      id: this.workerGamificationData.id,
      addReferences: this.workerGamificationData.referencePoint,
      addCertifications: this.workerGamificationData.certificationPoint,
      workExperience: this.workerGamificationData.workerExperiencePoint,
      qualityRatingFourToFive: this.workerGamificationData.qualityRatingFourToFivePoint,
      qualityRatingThreeToFour: this.workerGamificationData.qualityRatingThreeToFourPoint,
      qualityRatingBelowThree: this.workerGamificationData.qualityRatingBelowThreePoint,
      safetyRatingFourToFive: this.workerGamificationData.safetyRatingFourToFivePoint,
      safetyRatingThreeToFour: this.workerGamificationData.safetyRatingThreeToFourPoint,
      safetyRatingBelowThree: this.workerGamificationData.safetyRatingBelowThreePoint,
      fourtyToEightyJobHours: this.workerGamificationData.jobPointForMinHrs,
      eightyToOneTwentyJobHours: this.workerGamificationData.jobPointForMidHrs,
      aboveOneTwentyJobHours: this.workerGamificationData.jobPointForMaxHrs,
      powerUser: this.workerGamificationData.powerUserPoint,
      yellowHardHat: this.workerGamificationData.yellowRedHatUserPoint,
      benefitsofaMonthforWorker: this.workerGamificationData.comments,
      photo: this.workerGamificationData.photo
    });
    if (this.workerGamificationData.photo) {
      this.singleImageView = environment.baseURL + '/file/getById?fileId=' + this.workerGamificationData.photo;
    } else {
      this.singleImageView = null;
    }
  }
  prepareQueryParam(paramObject): Params {
    // tslint:disable-next-line: new-parens
    const params = new URLSearchParams;
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }
  onSelect(event) {
    this.files.push(...event.addedFiles);

    if (this.files[1] != null) {
      this.onRemove(this.files[0]);
    }
    this.selectedPhoto = this.files[0];
    this.showPreview = true;
    this.profileFile = this.files;
    if (event.rejectedFiles.length > 0) {
      if (event.rejectedFiles[0].reason === 'size') {
        this.notificationService.error(this.translator.instant('max.file.size.5.mb'), '');
      } else {
        this.notificationService.error(this.translator.instant('image.upload'), '');
      }
      this.showPreview = false;
      event.rejectedFiles = [];
    }
  }

  onRemove(event) {
    this.files.splice(this.files.indexOf(event), 1);
    this.showPreview = false;
  }
  uploadPhoto() {
    if (this.selectedPhoto) {
      const uploadImageData = new FormData();
      uploadImageData.append('file', this.selectedPhoto);
      this.fileService.uploadFile(uploadImageData).subscribe(
        event => {
          if (event instanceof HttpResponse) {
            this.logoBody = event.body;
            this.logoData = this.logoBody.data;
            this.gamificationWorkerForm.controls.photo.patchValue(this.logoData);
            this.onSubmit();
          }
        },
        (error) => {
          this.notificationService.error(this.translator.instant('common.error'), '');
          console.log(error);
        }
      );
    }
    else {
      this.onSubmit();
    }
  }
  validateLengthForComments(comments) {
    if (comments) {
      let plainText = comments.replace(/<[^>]*>/g, '');
      return plainText.length;
    }
    else {
      return 0;
    }
  }
  checkLengthForComments(comments) {
    if (this.validateLengthForComments(comments) > 1000) {
      return false;
    }
    return true;
  }
}
