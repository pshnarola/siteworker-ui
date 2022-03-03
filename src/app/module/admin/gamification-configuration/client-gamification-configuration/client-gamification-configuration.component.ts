import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { GamificationConfigurationService } from 'src/app/service/admin-services/gamification-configuration/gamification-configuration.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { ClientGamificationDTO } from '../gamificationDTO/client-gamification-configuration-DTO/client-gamification-dto';

@Component({
  selector: 'app-client-gamification-configuration',
  templateUrl: './client-gamification-configuration.component.html',
  styleUrls: ['./client-gamification-configuration.component.css']
})
export class ClientGamificationConfigurationComponent implements OnInit {

  message: string;
  showButtons = true;
  clientAccess: any;
  btnDisabled = false;
  gamificationClientForm: FormGroup;
  submitted = false;
  loggedInUserId: any;

  queryParam: URLSearchParams;
  datatableParam: any = null;

  clientGamification = new ClientGamificationDTO();

  constructor(
    private translator: TranslateService,
    private localStorageService: LocalStorageService,
    private formBuilder: FormBuilder,
    private notificationService: UINotificationService,
    private gamificationConfigurationService: GamificationConfigurationService
  ) {
    this.loggedInUserId = localStorageService.getLoginUserId();
  }

  ngOnInit(): void {
    this.clientAccess = this.localStorageService.getItem('userAccess');
    this.initializeForm();
    this.loadClientData();
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
    this.gamificationClientForm = this.formBuilder.group({
      id: [],
      closeOutPackageResponseTime: ['', [CustomValidator.required]],
      pointsForGivingResponseInTimeForCloseoutPackage: ['', [CustomValidator.required]],
      weeklyTimesheetResponseTime: ['', [CustomValidator.required]],
      pointsForGivingResponseInTimeForApprovingOrRejectingTimesheet: ['', [CustomValidator.required]],
      jobsitesConversionRate: ['', [CustomValidator.required]],
      pointsforConversionRateGreaterThanEqualTojobsitesConversionRate: ['', [CustomValidator.required]],
      leadDaysforActualStartDate: ['', [CustomValidator.required]],
      pointsForStartingJobIntime: ['', [CustomValidator.required]],
      ratingFourToFive: ['', [CustomValidator.required]],
      ratingThreeToFour: ['', [CustomValidator.required]],
      ratingBelowThree: ['', [CustomValidator.required]],
    });
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

  loadClientData() {
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.gamificationConfigurationService.getClientGamificationConfigurationList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          if (data.data.result?.length) {
            this.clientGamification = data.data.result[0];
            this.toForm(this.clientGamification);
          }
          else {
            this.clientGamification = null;
          }
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  toForm(clientGamificationDTO) {
    if (clientGamificationDTO) {
      this.gamificationClientForm.patchValue({
        id: clientGamificationDTO?.id,
        createdDate: clientGamificationDTO?.createdDate,
        updatedDate: clientGamificationDTO?.updatedDate,
        createdBy: clientGamificationDTO?.createdBy,
        updatedBy: clientGamificationDTO?.updatedBy,
        closeOutPackageResponseTime: clientGamificationDTO?.closeOutPackageResponseDays,
        pointsForGivingResponseInTimeForCloseoutPackage: clientGamificationDTO?.closeOutPackageResponseTimePoint,
        ratingFourToFive: clientGamificationDTO?.qualityRatingFourToFivePoint,
        ratingThreeToFour: clientGamificationDTO?.qualityRatingThreeToFourPoint,
        ratingBelowThree: clientGamificationDTO?.qualityRatingBelowThreePoint,
        weeklyTimesheetResponseTime: clientGamificationDTO?.weeklyTimesheetResponseDays,
        pointsForGivingResponseInTimeForApprovingOrRejectingTimesheet: clientGamificationDTO?.weeklyTimesheetResponseTimePoint,
        jobsitesConversionRate: clientGamificationDTO?.jobsiteConversionRate,
        pointsforConversionRateGreaterThanEqualTojobsitesConversionRate: clientGamificationDTO?.jobsiteConversionRatePoints,
        leadDaysforActualStartDate: clientGamificationDTO?.leadDaysForActualStartDate,
        pointsForStartingJobIntime: clientGamificationDTO?.pointForStartingJobAtTime,
      });
    }
  }

  async onSubmit() {
    this.submitted = true;
    if (!this.gamificationClientForm.valid) {
      CustomValidator.markFormGroupTouched(this.gamificationClientForm);
      this.submitted = true;
      return false;
    }

    this.clientGamification = await this.setFormToDTO(this.gamificationClientForm);

    if (this.clientGamification?.id) {
      this.gamificationConfigurationService.updateClientGamificationConfiguration(this.clientGamification).subscribe(
        (data) => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.loadClientData();
            this.notificationService.success('Client Configuration updated', '');
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
      this.gamificationConfigurationService.addClientGamificationConfiguration(this.clientGamification).subscribe(
        (data) => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.loadClientData();
            this.notificationService.success('Client Configuration added', '');
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


  setFormToDTO(formGroup: FormGroup): ClientGamificationDTO {
    let clientGamificationDTO = new ClientGamificationDTO();

    if (formGroup.value.id) {
      clientGamificationDTO.id = formGroup.value.id;
    }
    clientGamificationDTO.createdDate = formGroup.value.createdDate;
    clientGamificationDTO.updatedDate = formGroup.value.updatedDate;
    clientGamificationDTO.createdBy = this.loggedInUserId;
    clientGamificationDTO.updatedBy = this.loggedInUserId;
    clientGamificationDTO.closeOutPackageResponseTimePoint = formGroup.value.pointsForGivingResponseInTimeForCloseoutPackage;
    clientGamificationDTO.closeOutPackageResponseDays = formGroup.value.closeOutPackageResponseTime;
    clientGamificationDTO.qualityRatingFourToFivePoint = formGroup.value.ratingFourToFive;
    clientGamificationDTO.qualityRatingThreeToFourPoint = formGroup.value.ratingThreeToFour;
    clientGamificationDTO.qualityRatingBelowThreePoint = formGroup.value.ratingBelowThree;
    clientGamificationDTO.weeklyTimesheetResponseTimePoint = formGroup.value.pointsForGivingResponseInTimeForApprovingOrRejectingTimesheet;
    clientGamificationDTO.weeklyTimesheetResponseDays = formGroup.value.weeklyTimesheetResponseTime;
    clientGamificationDTO.jobsiteConversionRate = formGroup.value.jobsitesConversionRate;
    clientGamificationDTO.jobsiteConversionRatePoints = formGroup.value.pointsforConversionRateGreaterThanEqualTojobsitesConversionRate;
    clientGamificationDTO.leadDaysForActualStartDate = formGroup.value.leadDaysforActualStartDate;
    clientGamificationDTO.pointForStartingJobAtTime = formGroup.value.pointsForStartingJobIntime;

    return clientGamificationDTO;
  }

}
