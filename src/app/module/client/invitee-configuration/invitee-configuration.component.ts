import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ClientProfileService } from 'src/app/service/client-services/client-profile/client-profile.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { CommonService } from 'src/app/shared/common-services/common.service';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { State } from 'src/app/shared/vo/state/state';
import { Clientvo } from '../client-profile/clientvo/clientvo';
import { JobInviteeConfiguration } from '../client-profile/clientvo/JobInviteeConfiguration';
import { ProjectInviteeConfiguration } from '../client-profile/clientvo/ProjectInviteeConfigurationDTO';

@Component({
  selector: 'app-invitee-configuration',
  templateUrl: './invitee-configuration.component.html',
  styleUrls: ['./invitee-configuration.component.css']
})
export class InviteeConfigurationComponent implements OnInit {
  projectInviteeConfigurationForm: FormGroup;
  jobInviteeConfigurationForm: FormGroup;
  submitted: boolean;
  projectInviteeConfigurationDTO = new ProjectInviteeConfiguration();
  jobInviteeConfigurationDTO = new JobInviteeConfiguration();

  filteredProjectPreferredState = [];
  filteredJobPreferredState = [];

  subscription = new Subscription();
  stateData: State[];
  client: Clientvo;
  id: any;


  constructor(
    public _clientProfileService: ClientProfileService,
    private _localStorageService: LocalStorageService,
    private _notificationService: UINotificationService,
    private _formBuilder: FormBuilder,
    private captionChangeService: HeaderManagementService,
    private translator: TranslateService,
    private commonService: CommonService,
  ) {
    this.id = this._localStorageService.getLoginUserId();
  }

  ngOnInit(): void {

    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.INVITEE_CONFIGURATION);
    this.initializeJobForm();
    this.initializeProjectForm();
    this.getLogedInClientDetail(this.id);
    this.subscription.add(this.commonService.getAllStateList().subscribe(data => {
      this.stateData = data;
    }));
  }

  ngOnDestroy(): void {
    this.captionChangeService.hideSidebarSubject.next(false);
    this.subscription.unsubscribe();
  }
  initializeProjectForm(): void {
    this.projectInviteeConfigurationForm = this._formBuilder.group({
      id: null,
      states: [],
      industryMatch: [false],
      rangeValuesProjectAverageRating: [[0, 0]],
      rangeValuesProjectSuccessRatio: [[0, 0]],
      createdBy: this.id,
      updatedBy: this.id,
    });
  }

  initializeJobForm(): void {
    this.jobInviteeConfigurationForm = this._formBuilder.group({
      id: null,
      states: [],
      jobTitleMatch: [false],
      certificateMatch: [false],
      rangeValuesJobAverageRating: [[0, 0]],
      rangeValuesJobSuccessRatio: [[0, 0]],
      createdBy: this.id,
      updatedBy: this.id,
    });
  }

  getLogedInClientDetail(id) {
    this._clientProfileService.getClientDetail(id).subscribe(
      (data) => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.client = data.data;
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

    if (this.client.projectInviteeConfiguration) {
      this.projectInviteeConfigurationForm.patchValue({
        id: this.client.projectInviteeConfiguration?.id,
        states: this.client.lstProjectInviteePreferredState,
        industryMatch: this.client.projectInviteeConfiguration?.isIndustryTypeChecked,
        rangeValuesProjectAverageRating: [this.client.projectInviteeConfiguration?.avgRatingMin, this.client.projectInviteeConfiguration?.avgRatingMax],
        rangeValuesProjectSuccessRatio: [this.client.projectInviteeConfiguration?.successRatioMin, this.client.projectInviteeConfiguration?.successRatioMax],
        updatedBy: this.client.projectInviteeConfiguration?.updatedBy,
      });
    }

    if (this.client.jobInviteeConfiguration) {
      this.jobInviteeConfigurationForm.patchValue({
        id: this.client.jobInviteeConfiguration?.id,
        states: this.client.lstJobInviteePreferredState,
        jobTitleMatch: this.client.jobInviteeConfiguration?.isJobTitleMatch,
        certificateMatch: this.client.jobInviteeConfiguration?.isCertificateMatch,
        rangeValuesJobAverageRating: [this.client.jobInviteeConfiguration?.avgRatingMin, this.client.jobInviteeConfiguration?.avgRatingMax],
        rangeValuesJobSuccessRatio: [this.client.jobInviteeConfiguration?.successRatioMin, this.client.jobInviteeConfiguration?.successRatioMax],
        updatedBy: this.client.jobInviteeConfiguration?.updatedBy,
      });
    }
  }


  async onSubmit(next?: string) {
    this.submitted = true;

    if (!this.projectInviteeConfigurationForm.valid) {
      let controlName: string;
      // tslint:disable-next-line: forin
      for (controlName in this.projectInviteeConfigurationForm.controls) {
        this.projectInviteeConfigurationForm.controls[controlName].markAsDirty();
        this.projectInviteeConfigurationForm.controls[controlName].updateValueAndValidity();
      }
      this.submitted = true;
      return false;
    }
    if (!this.jobInviteeConfigurationForm.valid) {
      let controlName: string;
      // tslint:disable-next-line: forin
      for (controlName in this.jobInviteeConfigurationForm.controls) {
        this.jobInviteeConfigurationForm.controls[controlName].markAsDirty();
        this.jobInviteeConfigurationForm.controls[controlName].updateValueAndValidity();
      }
      this.submitted = true;
      return false;
    }

    this.projectInviteeConfigurationDTO = await this.setProjectInviteeConfiguration();
    this.jobInviteeConfigurationDTO = await this.setJobInviteeConfiguration();

    this.client.projectInviteeConfiguration = this.projectInviteeConfigurationDTO;
    this.client.jobInviteeConfiguration = this.jobInviteeConfigurationDTO;

    this._clientProfileService.updateInviteeConfiguration(this.client).subscribe(
      (data) => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.getLogedInClientDetail(this.id);
          this._notificationService.success('Invitee configuration saved', '');
          this.submitted = false;
        } else {
          this._notificationService.error(data.statusCode, '');
        }
      },
      (error) => {
        this._notificationService.error(this.translator.instant('common.error'), '');
        this.submitted = false;
      }
    );

  }

  setProjectInviteeConfiguration(): ProjectInviteeConfiguration {
    let projectInviteeConfiguration = new ProjectInviteeConfiguration();
    let projectPreferredStates = [];

    projectInviteeConfiguration.id = this.projectInviteeConfigurationForm.value.id;
    projectInviteeConfiguration.avgRatingMax = this.projectInviteeConfigurationForm.value.rangeValuesProjectAverageRating[1];
    projectInviteeConfiguration.avgRatingMin = this.projectInviteeConfigurationForm.value.rangeValuesProjectAverageRating[0];
    projectInviteeConfiguration.successRatioMax = this.projectInviteeConfigurationForm.value.rangeValuesProjectSuccessRatio[1];
    projectInviteeConfiguration.successRatioMin = this.projectInviteeConfigurationForm.value.rangeValuesProjectSuccessRatio[0];
    projectInviteeConfiguration.isIndustryTypeChecked = this.projectInviteeConfigurationForm.value.industryMatch;
    projectInviteeConfiguration.createdBy = this.projectInviteeConfigurationForm.value.createdBy;
    this.projectInviteeConfigurationForm.value.states?.forEach(element => {
      projectPreferredStates.push(element.name);
    });
    projectPreferredStates = projectPreferredStates.filter((el, i, a) => i === a.indexOf(el));
    projectInviteeConfiguration.states = projectPreferredStates.toString();

    return projectInviteeConfiguration;
  }

  setJobInviteeConfiguration(): JobInviteeConfiguration {
    let jobInviteeConfiguration = new JobInviteeConfiguration();
    let jobPreferredStates = [];

    jobInviteeConfiguration.id = this.jobInviteeConfigurationForm.value.id;
    jobInviteeConfiguration.avgRatingMax = this.jobInviteeConfigurationForm.value.rangeValuesJobAverageRating[1];
    jobInviteeConfiguration.avgRatingMin = this.jobInviteeConfigurationForm.value.rangeValuesJobAverageRating[0];
    jobInviteeConfiguration.successRatioMax = this.jobInviteeConfigurationForm.value.rangeValuesJobSuccessRatio[1];
    jobInviteeConfiguration.successRatioMin = this.jobInviteeConfigurationForm.value.rangeValuesJobSuccessRatio[0];
    jobInviteeConfiguration.isCertificateMatch = this.jobInviteeConfigurationForm.value.certificateMatch;
    jobInviteeConfiguration.isJobTitleMatch = this.jobInviteeConfigurationForm.value.jobTitleMatch;
    jobInviteeConfiguration.createdBy = this.jobInviteeConfigurationForm.value.createdBy;

    this.jobInviteeConfigurationForm.value.states?.forEach(element => {
      jobPreferredStates.push(element.name);
    });
    jobPreferredStates = jobPreferredStates.filter((el, i, a) => i === a.indexOf(el));
    jobInviteeConfiguration.states = jobPreferredStates.toString();

    return jobInviteeConfiguration;
  }

  filterProjectPreferredState(event) {
    const filtered: any[] = [];
    const query = event.query;
    for (let i = 0; i < this.stateData.length; i++) {
      const state = this.stateData[i];
      if (state.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(state);
      }
    }
    this.filteredProjectPreferredState = filtered;
    this.filteredProjectPreferredState = this.filteredProjectPreferredState.sort();
  }

  filterJobPreferredState(event) {
    const filtered: any[] = [];
    const query = event.query;
    for (let i = 0; i < this.stateData.length; i++) {
      const state = this.stateData[i];
      if (state.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(state);
      }
    }
    this.filteredJobPreferredState = filtered;
    this.filteredJobPreferredState = this.filteredJobPreferredState.sort();
  }

}
