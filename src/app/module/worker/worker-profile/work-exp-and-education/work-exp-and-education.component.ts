import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { WorkerDto } from 'src/app/module/worker/vo/worker-dto';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { BasicDetailService } from 'src/app/service/worker-services/basic-detail/basic-detail.service';
import { WorkExpAndEducationService } from 'src/app/service/worker-services/workExpAndEducation/work-exp-and-education.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { WorkerEducation } from '../../vo/WorkerEducation';
import { WorkExp } from '../../vo/workExp';


@Component({
  selector: 'app-work-exp-and-education',
  templateUrl: './work-exp-and-education.component.html',
  styleUrls: ['./work-exp-and-education.component.css']
})
export class WorkExpAndEducationComponent implements OnInit {
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  queryParam;
  datatableParam: DataTableParam = null;

  workerDto: WorkerDto;
  loginUserId: any;

  WorkExpForm: FormGroup;
  submitted: boolean;
  workExpDialog: boolean;
  checkedCurrentlyWorking = false;
  endedDate: Date;
  startedDate: Date;
  minDate: Date;
  expDialogHeader = 'Add Work Experience';
  educationDialogHeader = 'Add Education';

  workerEducationForm: FormGroup;
  submittedWorkerEducation: boolean;
  workerEducationDialog: boolean;
  checkedCurrentlyWorkerEducating = false;
  endedDateOfEducatin: Date;
  startedDateOfEducatin: Date;

  workerWorkExperience = new WorkExp();
  workerEducation = new WorkerEducation();
  workExpList: WorkExp[] = [];
  workerEducationList: WorkerEducation[] = [];

  @Output() goBackToPayDetail = new EventEmitter<any>();
  @Output() goToCertificates = new EventEmitter<any>();
  loginUser: any;


  constructor(
    private _formBuilder: FormBuilder,
    private _localStorageService: LocalStorageService,
    private _notificationService: UINotificationService,
    private translator: TranslateService,
    public _workerProfileServices: BasicDetailService,
    public _workExpService: WorkExpAndEducationService,
  ) {
    this.loginUserId = this._localStorageService.getLoginUserId();
    this.loginUser = this._localStorageService.getLoginUserObject();
    this.workerWorkExperience = new WorkExp();
    this.workerEducation = new WorkerEducation();
  }

  ngOnInit(): void {
    this.initializeWorkExpForm();
    this.initializeworkerEducationForm();
    this.getAllWorkExpDetail();
    this.getAllWorkerEducationDetail();
  }

  getAllWorkExpDetail() {
    this._workExpService.getAllWorkerExpDetailByUserId(this.loginUserId).subscribe(
      data => {
        if (data.statusCode === '200' && data.message == 'OK') {
          this.workExpList = data.data;
        }
      },
      error => {
      }
    );
  }

  getAllWorkerEducationDetail() {
    this._workExpService.getAllEducationDetailByUserId(this.loginUserId).subscribe(
      data => {
        if (data.statusCode === '200' && data.message == 'OK') {
          this.workerEducationList = data.data;
        }
      },
      error => {
      }
    );
  }

  openWorkExpDialog() {
    this.expDialogHeader = 'Add Work Experience';
    this.submitted = false;
    this.workExpDialog = true;
    this.startedDate = null;
    this.endedDate = null;
    this.checkedCurrentlyWorking = false;
    this.initializeWorkExpForm();
  }

  hideDialog() {
    this.workExpDialog = false;
    this.submitted = false;
    this.startedDate = null;
    this.endedDate = null;
    this.workerWorkExperience = new WorkExp();
    this.checkedCurrentlyWorking = false;
    this.initializeWorkExpForm();
  }

  initializeWorkExpForm() {
    this.WorkExpForm = this._formBuilder.group({
      id: [null],
      companyName: ['', [CustomValidator.required, Validators.maxLength(50)]],
      designation: ['', [CustomValidator.required, Validators.maxLength(50)]],
      description: ['', [CustomValidator.required, Validators.maxLength(200)]],
      startDate: ['', [CustomValidator.required]],
      currentlyWorking: [false, [CustomValidator.required]],
      endDate: ['', CustomValidator.required],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
    });
  }

  openWorkerEducationDialog() {
    this.educationDialogHeader = 'Add Education';
    this.submittedWorkerEducation = false;
    this.workerEducationDialog = true;
    this.startedDateOfEducatin = null;
    this.endedDateOfEducatin = null;
    this.checkedCurrentlyWorkerEducating = false;
    this.initializeworkerEducationForm();
  }

  hideDialogworkerEducation() {
    this.workerEducationDialog = false;
    this.submittedWorkerEducation = false;
    this.startedDateOfEducatin = null;
    this.endedDateOfEducatin = null;
    this.workerEducation = new WorkerEducation();
    this.checkedCurrentlyWorkerEducating = false;
    this.initializeworkerEducationForm();
  }

  initializeworkerEducationForm() {
    this.workerEducationForm = this._formBuilder.group({
      id: [null],
      institutionName: ['', [CustomValidator.required, Validators.maxLength(100)]],
      degree: ['', [CustomValidator.required, Validators.maxLength(50)]],
      major: ['', [Validators.maxLength(100)]],
      startDate: ['', [CustomValidator.required]],
      currentlyWorking: [false, [CustomValidator.required]],
      endDate: ['', CustomValidator.required],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
    });
  }

  dateChange(event) {
  }

  onClick() {
    this.checkedCurrentlyWorking = !this.checkedCurrentlyWorking;
    if (!this.checkedCurrentlyWorking) {
      this.endedDate = null;
      this.WorkExpForm.addControl('endDate', new FormControl('', [CustomValidator.required]));
    }
    if (this.checkedCurrentlyWorking) {
      this.endedDate = null;
      this.WorkExpForm.removeControl('endDate');
    }
  }

  onClickCurrentlyEducating() {
    this.checkedCurrentlyWorkerEducating = !this.checkedCurrentlyWorkerEducating;
    if (!this.checkedCurrentlyWorkerEducating) {
      this.endedDateOfEducatin = null;
      this.workerEducationForm.addControl('endDate', new FormControl('', [CustomValidator.required]));
    }
    if (this.checkedCurrentlyWorkerEducating) {
      this.endedDateOfEducatin = null;
      this.workerEducationForm.removeControl('endDate');
    }
  }

  onSubmitWorkExp() {
    this.submitted = true;

    if (!this.WorkExpForm.valid) {
      CustomValidator.markFormGroupTouched(this.WorkExpForm);
      this.submitted = true;
      return false;
    }

    if (this.WorkExpForm.value.id) {
      this.workerWorkExperience.id = this.WorkExpForm.value.id;
      this.workerWorkExperience.companyName = this.WorkExpForm.get('companyName').value;
      this.workerWorkExperience.designation = this.WorkExpForm.get('designation').value;
      this.workerWorkExperience.description = this.WorkExpForm.get('description').value;
      this.workerWorkExperience.startDate = this.startedDate.toISOString();
      this.workerWorkExperience.isCurrentlyWorking = this.WorkExpForm.get('currentlyWorking').value;
      this.workerWorkExperience.user = this.loginUser;
      if (this.endedDate && !this.workerWorkExperience.isCurrentlyWorking) {
        this.workerWorkExperience.endDate = this.endedDate.toISOString();
      } else {
        this.workerWorkExperience.endDate = null;
      }
      this._workExpService.updateWorkerExp(this.workerWorkExperience).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('worker.profile.updated'), '');
            this.submitted = false;
            this.workExpDialog = false;
            this.workerWorkExperience = new WorkExp();
            this.checkedCurrentlyWorking = false;
            this.startedDate = null;
            this.endedDate = null;
            this.getAllWorkExpDetail();
          } else {
            this._notificationService.error(data.message, '');
          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.submitted = false;
          this.workExpDialog = false;
          this.checkedCurrentlyWorking = false;
          this.startedDate = null;
          this.endedDate = null;
          this.getAllWorkExpDetail();
        }
      );
    } else if (this.WorkExpForm.valid) {
      this.workerWorkExperience.id = this.WorkExpForm.value.id;
      this.workerWorkExperience.companyName = this.WorkExpForm.get('companyName').value;
      this.workerWorkExperience.designation = this.WorkExpForm.get('designation').value;
      this.workerWorkExperience.description = this.WorkExpForm.get('description').value;
      this.workerWorkExperience.startDate = this.startedDate.toISOString();
      this.workerWorkExperience.isCurrentlyWorking = this.WorkExpForm.get('currentlyWorking').value;
      this.workerWorkExperience.user = this.loginUser;
      if (this.endedDate && !this.workerWorkExperience.isCurrentlyWorking) {
        this.workerWorkExperience.endDate = this.endedDate.toISOString();
      } else {
        this.workerWorkExperience.endDate = null;
      }
      this._workExpService.addWorkerExp(this.workerWorkExperience).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('worker.profile.updated'), '');
            this.submitted = false;
            this.workExpDialog = false;
            this.checkedCurrentlyWorking = false;
            this.workerWorkExperience = new WorkExp();
            this.startedDate = null;
            this.endedDate = null;
            this.getAllWorkExpDetail();
          } else {
            this._notificationService.error(data.message, '');
          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.submitted = false;
          this.workExpDialog = false;
          this.checkedCurrentlyWorking = false;
          this.startedDate = null;
          this.endedDate = null;
          this.getAllWorkExpDetail();
        }
      );
    }
    else {
      this.workExpDialog = false;
    }
  }

  updateExp(item) {
    this.workerWorkExperience = new WorkExp();
    this.workerWorkExperience = { ...item };
    this.WorkExpForm.controls.companyName.patchValue(this.workerWorkExperience.companyName);
    this.WorkExpForm.controls.description.patchValue(this.workerWorkExperience.description);
    this.WorkExpForm.controls.designation.patchValue(this.workerWorkExperience.designation);
    if (this.workerWorkExperience.endDate) {
      this.endedDate = new Date(this.workerWorkExperience.endDate);
    } else {
      this.endedDate = null;
    }
    this.startedDate = new Date(this.workerWorkExperience.startDate);
    this.WorkExpForm.controls.endDate.patchValue(this.endedDate);
    this.WorkExpForm.controls.startDate.patchValue(this.startedDate);
    this.WorkExpForm.controls.id.patchValue(this.workerWorkExperience.id);
    this.checkedCurrentlyWorking = this.workerWorkExperience.isCurrentlyWorking;
    this.WorkExpForm.controls.currentlyWorking.patchValue(this.checkedCurrentlyWorking);
    if (!this.checkedCurrentlyWorking) {
      this.WorkExpForm.addControl('endDate', new FormControl('', [CustomValidator.required]));
    }
    if (this.checkedCurrentlyWorking) {
      this.WorkExpForm.removeControl('endDate');
    }
    this.workerWorkExperience = new WorkExp();
    this.expDialogHeader = 'Edit Work Experience';
    this.workExpDialog = true;
  }

  onSubmitWorkerEducation() {
    this.submittedWorkerEducation = true;

    if (!this.workerEducationForm.valid) {
      CustomValidator.markFormGroupTouched(this.workerEducationForm);
      this.submittedWorkerEducation = true;
      return false;
    }
    if (this.workerEducationForm.value.id) {
      this.workerEducation.id = this.workerEducationForm.value.id;
      this.workerEducation.institutionName = this.workerEducationForm.get('institutionName').value;
      this.workerEducation.degree = this.workerEducationForm.get('degree').value;
      this.workerEducation.major = this.workerEducationForm.get('major').value;
      this.workerEducation.startDate = this.startedDateOfEducatin.toISOString();
      this.workerEducation.isCurrentlyWorking = this.workerEducationForm.get('currentlyWorking').value;
      this.workerEducation.user = this.loginUser;
      if (this.endedDateOfEducatin && !this.workerEducation.isCurrentlyWorking) {
        this.workerEducation.endDate = this.endedDateOfEducatin.toISOString();
      } else {
        this.workerEducation.endDate = null;
      }
      this._workExpService.updateEducation(this.workerEducation).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('worker.profile.updated'), '');
            this.submittedWorkerEducation = false;
            this.checkedCurrentlyWorkerEducating = false;
            this.workerEducation = new WorkerEducation();
            this.workerEducationDialog = false;
            this.startedDateOfEducatin = null;
            this.endedDateOfEducatin = null;
            this.getAllWorkerEducationDetail();
          } else {
            this._notificationService.error(data.message, '');
          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.submittedWorkerEducation = false;
          this.checkedCurrentlyWorkerEducating = false;
          this.workerEducationDialog = false;
          this.startedDateOfEducatin = null;
          this.endedDateOfEducatin = null;
          this.getAllWorkerEducationDetail();
        }
      );
    } else if (this.workerEducationForm.valid) {
      this.workerEducation.id = this.workerEducationForm.value.id;
      this.workerEducation.institutionName = this.workerEducationForm.get('institutionName').value;
      this.workerEducation.degree = this.workerEducationForm.get('degree').value;
      this.workerEducation.major = this.workerEducationForm.get('major').value;
      this.workerEducation.startDate = this.startedDateOfEducatin.toISOString();
      this.workerEducation.isCurrentlyWorking = this.workerEducationForm.get('currentlyWorking').value;
      this.workerEducation.user = this.loginUser;
      if (this.endedDateOfEducatin && !this.workerEducation.isCurrentlyWorking) {
        this.workerEducation.endDate = this.endedDateOfEducatin.toISOString();
      } else {
        this.workerEducation.endDate = null;
      }
      this._workExpService.addEducation(this.workerEducation).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('worker.profile.updated'), '');
            this.submittedWorkerEducation = false;
            this.workerEducation = new WorkerEducation();
            this.checkedCurrentlyWorkerEducating = false;
            this.workerEducationDialog = false;
            this.startedDateOfEducatin = null;
            this.endedDateOfEducatin = null;
            this.getAllWorkerEducationDetail();
          } else {
            this._notificationService.error(data.message, '');
          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.submittedWorkerEducation = false;
          this.checkedCurrentlyWorkerEducating = false;
          this.workerEducationDialog = false;
          this.startedDateOfEducatin = null;
          this.endedDateOfEducatin = null;
          this.getAllWorkerEducationDetail();
        }
      );
    } else {
      this.workerEducationDialog = false;
    }
  }

  updateEducation(item) {
    this.workerEducation = new WorkerEducation();
    this.workerEducation = { ...item };
    this.workerEducationForm.controls.institutionName.patchValue(this.workerEducation.institutionName);
    this.workerEducationForm.controls.major.patchValue(this.workerEducation.major);
    this.workerEducationForm.controls.degree.patchValue(this.workerEducation.degree);
    if (this.workerEducation.endDate) {
      this.endedDateOfEducatin = new Date(this.workerEducation.endDate);
    } else {
      this.endedDateOfEducatin = null;
    }
    this.startedDateOfEducatin = new Date(this.workerEducation.startDate);
    this.workerEducationForm.controls.endDate.patchValue(this.endedDateOfEducatin);
    this.workerEducationForm.controls.startDate.patchValue(this.startedDateOfEducatin);
    this.workerEducationForm.controls.id.patchValue(this.workerEducation.id);
    this.checkedCurrentlyWorkerEducating = this.workerEducation.isCurrentlyWorking;
    this.workerEducationForm.controls.currentlyWorking.patchValue(this.checkedCurrentlyWorkerEducating);
    if (!this.checkedCurrentlyWorkerEducating) {
      this.workerEducationForm.addControl('endDate', new FormControl('', [CustomValidator.required]));
    }
    if (this.checkedCurrentlyWorkerEducating) {
      this.workerEducationForm.removeControl('endDate');
    }
    this.workerEducation = new WorkerEducation();
    this.workerEducationDialog = true;
    this.educationDialogHeader = 'Edit Education';
  }

  previous() {
    this.goBackToPayDetail.emit('');
  }

  next() {
    this._notificationService.success(this.translator.instant('worker.profile.updated'), '');
    this.goToCertificates.emit('');
  }

}
