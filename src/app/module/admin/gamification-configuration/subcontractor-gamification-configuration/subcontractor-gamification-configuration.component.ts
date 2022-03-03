import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { FileDownloadService } from 'src/app/service/admin-services/fileDownload/file-download.service';
import { GamificationConfigurationService } from 'src/app/service/admin-services/gamification-configuration/gamification-configuration.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { environment } from 'src/environments/environment';
import { SubcontractorGamificationDTO } from '../gamificationDTO/subcontractor-gamification-configuration-DTO/subcontractor-gamification-dto';

@Component({
  selector: 'app-subcontractor-gamification-configuration',
  templateUrl: './subcontractor-gamification-configuration.component.html',
  styleUrls: ['./subcontractor-gamification-configuration.component.css']
})
export class SubcontractorGamificationConfigurationComponent implements OnInit {

  message: string;
  showButtons = true;
  clientAccess: any;
  btnDisabled = false;
  gamificationSubcontractorForm: FormGroup;
  submitted = false;

  subcontractorGamification = new SubcontractorGamificationDTO();

  loggedInUserId: any;
  queryParam: URLSearchParams;
  datatableParam: any;

  selectedPhoto: any;
  logoBody: any;
  logoData: any;
  files: File[] = [];
  showPreview: boolean;
  profileFile: any;
  singleImageView: string;
  displayDummyImage: boolean;
  giveAwayImageUrl = 'assets/images/giveAway.jpg';
  constructor(
    private translator: TranslateService,
    private localStorageService: LocalStorageService,
    private formBuilder: FormBuilder,
    private notificationService: UINotificationService,
    private fileService: FileDownloadService,
    private gamificationConfigurationService: GamificationConfigurationService
  ) {
  }

  ngOnInit(): void {
    this.clientAccess = this.localStorageService.getItem('userAccess');
    this.loggedInUserId = this.localStorageService.getLoginUserId;
    this.initializeForm();
    this.loadSubcontractorData();
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
    this.gamificationSubcontractorForm = this.formBuilder.group({
      id: [],
      createdDate: [],
      updatedDate: [],
      createdBy: [],
      updatedBy: [],

      addReferences: ['', [CustomValidator.required]],
      qualityRatingFourToFive: ['', [CustomValidator.required]],
      qualityRatingThreeToFour: ['', [CustomValidator.required]],
      qualityRatingBelowThree: ['', [CustomValidator.required]],
      safetyRatingFourToFive: ['', [CustomValidator.required]],
      safetyRatingThreeToFour: ['', [CustomValidator.required]],
      safetyRatingBelowThree: ['', [CustomValidator.required]],
      jobsiteCost: ['', [CustomValidator.required]],
      pointsforJobsitecompletedinaMonthGreaterThanEqualToJobsiteCost: ['', [CustomValidator.required]],
      pointsforJobsitecompletedinaMonthLessThanJobsiteCost: ['', [CustomValidator.required]],
      powerUser: ['', [CustomValidator.required]],
      yellowHardHat: ['', [CustomValidator.required]],
      benefitsofaMonthforSubcontractor: ['', [CustomValidator.required]],
      photo: [''],

    });
  }

  onSelect(event) {
    this.files.push(...event.addedFiles);
    if (this.files[1] != null) {
      this.onRemove(this.files[0]);
    }
    this.selectedPhoto = this.files[0];
    this.showPreview = true;
    this.profileFile = this.files;
    this.files = [];
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

  uploadLogo() {
    if (this.selectedPhoto) {
      const uploadImageData = new FormData();
      uploadImageData.append('file', this.selectedPhoto);
      this.fileService.uploadFile(uploadImageData).subscribe(
        event => {
          if (event instanceof HttpResponse) {
            this.logoBody = event.body;
            this.logoData = this.logoBody.data;
            this.gamificationSubcontractorForm.controls.photo.patchValue(this.logoData);
            this.onSubmit();
          }
        },
        (error) => {
          this.notificationService.error(this.translator.instant('common.error'), '');
        }
      );
    }
    else {
      this.onSubmit();
    }
  }

  onSubmit() {
    this.submitted = true;
    if (!this.gamificationSubcontractorForm.valid) {
      CustomValidator.markFormGroupTouched(this.gamificationSubcontractorForm);
      this.submitted = true;
      return false;
    }

    this.subcontractorGamification = this.toDTO(this.gamificationSubcontractorForm);

    if (this.subcontractorGamification.id) {
      this.gamificationConfigurationService.updateSubcontractorGamificationConfiguration(this.subcontractorGamification).subscribe(
        (data) => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.loadSubcontractorData();
            this.files = [];
            this.showPreview = false;
            if (data.data.photo) {
              this.singleImageView = environment.baseURL + '/file/getById?fileId=' + data.data.photo;
              this.displayDummyImage = false;
            }
            this.notificationService.success('Subcontractor Configuration updated', '');
          } else {
            this.notificationService.error(data.message, '');
          }
        },
        (error) => {
          this.notificationService.error(this.translator.instant('common.error'), '');
        }
      );
      this.submitted = false;
    } else {
      this.gamificationConfigurationService.addSubcontractorGamificationConfiguration(this.subcontractorGamification).subscribe(
        (data) => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.loadSubcontractorData();
            this.files = [];
            this.showPreview = false;
            if (data.data.photo) {
              this.singleImageView = environment.baseURL + '/file/getById?fileId=' + data.data.photo;
              this.displayDummyImage = false;
            }
            this.notificationService.success('Subcontractor Configuration added', '');
          } else {
            this.notificationService.error(data.message, '');
          }
        },
        (error) => {
          this.notificationService.error(this.translator.instant('common.error'), '');
        }
      );
      this.submitted = false;
    }

  }

  prepareQueryParam(paramObject) {
    // tslint:disable-next-line: new-parens
    const params = new URLSearchParams;
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  loadSubcontractorData() {
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.gamificationConfigurationService.getSubcontractorGamificationConfigurationList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          if (data.data.result?.length) {
            this.subcontractorGamification = data.data.result[0];
            this.toForm(this.subcontractorGamification);
          } else {
            this.subcontractorGamification = null;
          }
        }
      },
      error => {

      }
    );
  }

  toForm(subcontractorGamificationDTO: SubcontractorGamificationDTO) {
    if (subcontractorGamificationDTO) {
      this.gamificationSubcontractorForm.patchValue({
        id: subcontractorGamificationDTO?.id,
        createdDate: subcontractorGamificationDTO?.createdDate,
        updatedDate: subcontractorGamificationDTO?.updatedDate,
        createdBy: subcontractorGamificationDTO?.createdBy,
        updatedBy: subcontractorGamificationDTO?.updatedBy,
        powerUser: subcontractorGamificationDTO?.powerUserPoint,
        addReferences: subcontractorGamificationDTO?.referencePoint,
        qualityRatingFourToFive: subcontractorGamificationDTO?.qualityRatingFourToFivePoint,
        qualityRatingThreeToFour: subcontractorGamificationDTO?.qualityRatingThreeToFourPoint,
        qualityRatingBelowThree: subcontractorGamificationDTO?.qualityRatingBelowThreePoint,
        safetyRatingFourToFive: subcontractorGamificationDTO?.safetyRatingFourToFivePoint,
        safetyRatingThreeToFour: subcontractorGamificationDTO?.safetyRatingThreeToFourPoint,
        safetyRatingBelowThree: subcontractorGamificationDTO?.safetyRatingBelowThreePoint,
        jobsiteCost: subcontractorGamificationDTO?.jobsiteCost,
        yellowHardHat: subcontractorGamificationDTO?.yellowRedHatUserPoint,
        pointsforJobsitecompletedinaMonthGreaterThanEqualToJobsiteCost: subcontractorGamificationDTO?.jobsitePointsGreaterThanEqualToJobsiteCost,
        pointsforJobsitecompletedinaMonthLessThanJobsiteCost: subcontractorGamificationDTO?.jobsitePointsLessThanJobsiteCost,
        benefitsofaMonthforSubcontractor: subcontractorGamificationDTO?.comments,
        photo: subcontractorGamificationDTO?.photo
      });
    }

    if (subcontractorGamificationDTO.photo) {
      this.singleImageView = environment.baseURL + '/file/getById?fileId=' + subcontractorGamificationDTO.photo;
      this.displayDummyImage = false;
    } else {
      this.singleImageView = null;
      this.displayDummyImage = true;
    }

  }

  toDTO(formGroup: FormGroup): SubcontractorGamificationDTO {
    let subcontractorGamificationDTO = new SubcontractorGamificationDTO();

    if (formGroup.value.id) {
      subcontractorGamificationDTO.id = formGroup.value.id;
    }

    subcontractorGamificationDTO.createdDate = formGroup.value.createdDate;
    subcontractorGamificationDTO.updatedDate = formGroup.value.updatedDate;
    subcontractorGamificationDTO.createdBy = this.loggedInUserId;
    subcontractorGamificationDTO.updatedBy = this.loggedInUserId;
    subcontractorGamificationDTO.powerUserPoint = formGroup.value.powerUser;
    subcontractorGamificationDTO.referencePoint = formGroup.value.addReferences;
    subcontractorGamificationDTO.qualityRatingFourToFivePoint = formGroup.value.qualityRatingFourToFive;
    subcontractorGamificationDTO.qualityRatingThreeToFourPoint = formGroup.value.qualityRatingThreeToFour;
    subcontractorGamificationDTO.qualityRatingBelowThreePoint = formGroup.value.qualityRatingBelowThree;
    subcontractorGamificationDTO.safetyRatingFourToFivePoint = formGroup.value.safetyRatingFourToFive;
    subcontractorGamificationDTO.safetyRatingFourToFivePoint = formGroup.value.safetyRatingFourToFive;
    subcontractorGamificationDTO.safetyRatingThreeToFourPoint = formGroup.value.safetyRatingThreeToFour;
    subcontractorGamificationDTO.safetyRatingBelowThreePoint = formGroup.value.safetyRatingBelowThree;
    subcontractorGamificationDTO.jobsiteCost = formGroup.value.jobsiteCost;
    subcontractorGamificationDTO.yellowRedHatUserPoint = formGroup.value.yellowHardHat;
    subcontractorGamificationDTO.jobsitePointsGreaterThanEqualToJobsiteCost =
      formGroup.value.pointsforJobsitecompletedinaMonthGreaterThanEqualToJobsiteCost;
    subcontractorGamificationDTO.jobsitePointsLessThanJobsiteCost = formGroup.value.pointsforJobsitecompletedinaMonthLessThanJobsiteCost;
    subcontractorGamificationDTO.comments = formGroup.value.benefitsofaMonthforSubcontractor;
    subcontractorGamificationDTO.photo = formGroup.value.photo;

    return subcontractorGamificationDTO;
  }

  validateComments(comments) {
    if (comments) {
      var plainText = comments.replace(/<[^>]*>/g, '');
      return plainText.length;
    }
    else {
      return 0;
    }
  }
}
