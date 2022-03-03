import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MarginService } from 'src/app/service/admin-services/margin/margin.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { ProjectDetail } from '../../client/Vos/projectDetailmodel';

@Component({
  selector: 'app-project-set-margin',
  templateUrl: './project-set-margin.component.html',
  styleUrls: ['./project-set-margin.component.css']
})
export class ProjectSetMarginComponent implements OnInit {

  subscription: Subscription;
  selectedProject: ProjectDetail = null;
  isSelectedProject = false;
  subcontractorDetailForm: FormGroup;
  submitted: boolean;
  showButtons: boolean = true;
  ProjectAccess: any;
  btnDisabled: boolean = false;
  columns = [
    { label: 'Subcontractor', value: 'subcontractor', sortable: true, isHidden: false, field: 'subcontractor' },
    { label: 'Total Cost', value: 'cost', sortable: true, isHidden: false, field: 'cost' },
    { label: 'Current Margin %', value: 'margin', sortable: true, isHidden: false, field: 'margin' },
    { label: 'Platform Fee', value: 'platformFee', sortable: true, isHidden: false, field: 'platformFee' },
    { label: 'Subcontractor Payout', value: 'payout', sortable: true, isHidden: false, field: 'payout' },
    { label: 'New Margin %', value: 'newMargin', sortable: true, isHidden: false, field: 'newMargin' },
    { label: 'New Platform Fee', value: 'newPlatformFee', sortable: true, isHidden: false, field: 'newPlatformFee' },
    { label: 'New Subcontractor Payout', value: 'newPayout', sortable: true, isHidden: false, field: 'newPayout' },
  ];
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  totalRecords = 0;
  dataForTable = [];
  loggedInUserId;


  constructor(
    private captionChangeService: HeaderManagementService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private _localStorageService: LocalStorageService,
    private _formBuilder: FormBuilder,
    private notificationService: UINotificationService,
    private marginService: MarginService
  ) {
    this.captionChangeService.hideHeaderSubject.next(true);
  }

  ngOnInit(): void {
    this.ProjectAccess = this._localStorageService.getItem("userAccess");

    this.loggedInUserId = this._localStorageService.getLoginUserId();
    this.projectJobSelectionService.adminMarginSidebar.next(true);
    this.setProject();
    this.captionChangeService.hideHeaderSubject.next(true);
    this.initializeMarginForm(this.dataForTable);
    if (this.ProjectAccess) {
      this.menuAccess();
    }
  }

  ngOnDestroy(): void {
    this.projectJobSelectionService.adminMarginSidebar.next(false);
    this.subscription.unsubscribe();
  }

  private setProject() {
    this.subscription = this.projectJobSelectionService.selectedProjectSubject.subscribe(data => {
      let project = this._localStorageService.getSelectedProjectObject();
      if (project.id === 'pid') {
        this.isSelectedProject = false;
        this.selectedProject = null;
      }
      else {
        this.selectedProject = project;
        if (this.selectedProject !== null) {
          this.isSelectedProject = true;
        }
        this.onProjectChange();
      }
    });
  }

  onProjectChange() {
    this.marginService.getMarginDataForProjectOrJobsite(this.selectedProject.id).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {
        this.dataForTable = data.data;
        this.initializeMarginForm(this.dataForTable);
      }
      else {
        this.dataForTable = [];
        this.initializeMarginForm(this.dataForTable);
      }
    });
  }

  private initializeMarginForm(data) {
    let lstProjectJobsiteMarginDTOList = new FormArray([]);
    for (let i = 0; i < data.length; i++) {
      lstProjectJobsiteMarginDTOList.push(this._formBuilder.group({
        'projectBidId': data[i].projectBidId,
        'currentMargin': data[i].currentMargin,
        'newMarginPercentage': [null, Validators.maxLength(5)],
        'newPlatformFee': [null],
        'newSubcontractorPayout': null,
        'platformFee': data[i].platformFee,
        'subContractorProfile': data[i].subContractorProfile,
        'subcontractorPayout': data[i].subcontractorPayout,
        'totalCost': data[i].totalCost
      }));
    }

    this.subcontractorDetailForm = this._formBuilder.group({
      lstProjectJobsiteMarginDTO: lstProjectJobsiteMarginDTOList
    });
  }

  onEnterNewMargin(event, rowIndex) {
    if (event.value !== null) {
      if (event.value <= 99.99) {
        let newMargin: number = 0.00;
        let projectTotalCost: number = 0.00;
        let newPlatformFee: number = 0.00;
        let newSubcontractorPayout: number = 0.00;
        newMargin = (+parseFloat(event.value).toFixed(2));
        let totalCost = (<FormArray>this.subcontractorDetailForm.get('lstProjectJobsiteMarginDTO')).controls[rowIndex].get('totalCost').value;
        projectTotalCost = (+parseFloat(totalCost).toFixed(2));
        newPlatformFee = ((projectTotalCost * newMargin) / 100);
        newSubcontractorPayout = (projectTotalCost - newPlatformFee);
        (<FormArray>this.subcontractorDetailForm.get('lstProjectJobsiteMarginDTO')).controls[rowIndex].get('newSubcontractorPayout').setValue(newSubcontractorPayout);
        (<FormArray>this.subcontractorDetailForm.get('lstProjectJobsiteMarginDTO')).controls[rowIndex].get('newPlatformFee').setValue(newPlatformFee);
      }
    }
    else {
      (<FormArray>this.subcontractorDetailForm.get('lstProjectJobsiteMarginDTO')).controls[rowIndex].get('newSubcontractorPayout').setValue(null);
      (<FormArray>this.subcontractorDetailForm.get('lstProjectJobsiteMarginDTO')).controls[rowIndex].get('newPlatformFee').setValue(null);
      (<FormArray>this.subcontractorDetailForm.get('lstProjectJobsiteMarginDTO')).controls[rowIndex].get('newMarginPercentage').setValue(null);
    }

  }

  onEnterNewPlateformFee(event, rowIndex) {
    if (event.value !== null) {
      let newMargin: number = 0.00;
      let projectTotalCost: number = 0.00;
      let newPlatformFee: number = 0.00;
      let newSubcontractorPayout: number = 0.00;

      newPlatformFee = (+parseFloat(event.value).toFixed(2));
      let totalCost = (<FormArray>this.subcontractorDetailForm.get('lstProjectJobsiteMarginDTO')).controls[rowIndex].get('totalCost').value;
      projectTotalCost = (+parseFloat(totalCost).toFixed(2));
      newMargin = (100.00 - (((projectTotalCost - newPlatformFee) / projectTotalCost) * 100));
      newSubcontractorPayout = (projectTotalCost - newPlatformFee);
      (<FormArray>this.subcontractorDetailForm.get('lstProjectJobsiteMarginDTO')).controls[rowIndex].get('newSubcontractorPayout').setValue(newSubcontractorPayout);
      (<FormArray>this.subcontractorDetailForm.get('lstProjectJobsiteMarginDTO')).controls[rowIndex].get('newMarginPercentage').setValue(newMargin);
    }
    else {
      (<FormArray>this.subcontractorDetailForm.get('lstProjectJobsiteMarginDTO')).controls[rowIndex].get('newSubcontractorPayout').setValue(null);
      (<FormArray>this.subcontractorDetailForm.get('lstProjectJobsiteMarginDTO')).controls[rowIndex].get('newPlatformFee').setValue(null);
      (<FormArray>this.subcontractorDetailForm.get('lstProjectJobsiteMarginDTO')).controls[rowIndex].get('newMarginPercentage').setValue(null);
    }
  }

  onBlur(index) {
    let totalCost = (<FormArray>this.subcontractorDetailForm.get('lstProjectJobsiteMarginDTO')).controls[index].get('totalCost').value;
    let newEnteredCost = (<FormArray>this.subcontractorDetailForm.get('lstProjectJobsiteMarginDTO')).controls[index].get('newPlatformFee').value;
    if (totalCost === newEnteredCost) {
      (<FormArray>this.subcontractorDetailForm.get('lstProjectJobsiteMarginDTO')).controls[index].get('newSubcontractorPayout').setValue(0.00);
      (<FormArray>this.subcontractorDetailForm.get('lstProjectJobsiteMarginDTO')).controls[index].get('newPlatformFee').setValue((+parseFloat(totalCost).toFixed(2)));
      (<FormArray>this.subcontractorDetailForm.get('lstProjectJobsiteMarginDTO')).controls[index].get('newMarginPercentage').setValue(100.00);
    }
  }


  save(): boolean {
    this.submitted = true;
    if (!this.subcontractorDetailForm.valid) {
      let controlName: string;
      for (controlName in this.subcontractorDetailForm.controls) {
        this.subcontractorDetailForm.controls[controlName].markAsDirty();
        this.subcontractorDetailForm.controls[controlName].updateValueAndValidity();
      }
      this.submitted = false;
      return false;
    }
    else {
      if (this.checkMarginsetOrNot()) {
        this.marginService.updateMarginForProjectOrJobsite(this.subcontractorDetailForm.value).subscribe(data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.submitted = false;
            this.notificationService.success('Margin submitted successfully', '');
            this.onProjectChange();
          }
        });
      }
      else {
        this.notificationService.error('Please set margin for atleast one row', '');
      }
    }
  }
  menuAccess(): void {
    let accessPermission = this.ProjectAccess.filter(e => e.menuName == 'Projects');
    if (accessPermission[0].canModify) {
      this.showButtons = true;
      this.btnDisabled = false;
    }
    else {
      this.showButtons = false;
      this.btnDisabled = true;
    }
  }

  checkMarginsetOrNot() {
    let count = 0;
    this.subcontractorDetailForm.value.lstProjectJobsiteMarginDTO.forEach(element => {
      if ((element.newPlatformFee !== null && element.newPlatformFee !== 0) || (element.newMarginPercentage !== null && element.newMarginPercentage !== 0)) {
        count++;
      }
    });

    if (count > 0) {
      return true;
    }
    else {
      return false;
    }
  }
}
