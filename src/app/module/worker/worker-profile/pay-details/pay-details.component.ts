import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { WorkerDto } from 'src/app/module/worker/vo/worker-dto';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { BasicDetailService } from 'src/app/service/worker-services/basic-detail/basic-detail.service';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';

@Component({
  selector: 'app-pay-details',
  templateUrl: './pay-details.component.html',
  styleUrls: ['./pay-details.component.css']
})
export class PayDetailsComponent implements OnInit {
  loginUserId: any;
  workerDto: WorkerDto;
  submitted: boolean = false;
  fullTimeEmployee: boolean;
  minHourly: any;
  maxHourly: any;
  minFullTime: any;
  maxFullTime: any;
  errorFlagHour: boolean = false;
  errorFlagFullTimeEmployee: boolean = false;
  feedback: string;
  fullTimeEmployeeForm: FormGroup;

  @Output() goBackToBasicDetail = new EventEmitter<any>()
  @Output() goToWorkExpAndEducation = new EventEmitter<any>()



  constructor(
    private _formBuilder: FormBuilder,
    private _localStorageService: LocalStorageService,
    private _notificationService: UINotificationService,
    private translator: TranslateService,
    public _workerProfileServices: BasicDetailService,
  ) {
    this.loginUserId = this._localStorageService.getLoginUserId();
  }

  ngOnInit(): void {
    this._workerProfileServices.initializePayDetailForm();
    this.initializeFullTimeEmployeeDetailForm();
    this.getLogedInClientDetail(this.loginUserId);
    this._workerProfileServices.workerProfileDetailSubject.subscribe(data => {
      this.workerDto = data;
    });
  }

  onClick(event) {
    this.fullTimeEmployee = !this.fullTimeEmployee;

    if (this.fullTimeEmployee) {
      this.initializeFullTimeEmployeeDetailForm();
      this.submitted = false;
      this.fatchSecondDetail();
    }
  }

  initializeFullTimeEmployeeDetailForm(): void {
    this.fullTimeEmployeeForm = this._formBuilder.group({
      maxFullTimeSalary: ['', [CustomValidator.required, Validators.maxLength(10), Validators.min(0.01)]],
      minFullTimeSalary: ['', [CustomValidator.required, Validators.maxLength(10), Validators.min(0.01)]],
    });
  }

  get payDetailForm() { return this._workerProfileServices.payDetailForm; }

  getLogedInClientDetail(id) {
    this._workerProfileServices.getWorkerDetail(id).subscribe(
      (data) => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.workerDto = data.data;
          this.fullTimeEmployee = this.workerDto.workerProfile.isWillingToWorkFullTime;
          this.fatchDetail();
          if (this.fullTimeEmployee) {
            this.fatchSecondDetail();
          }
        } else {
        }
      },
      error => {
        this._notificationService.error(this.translator.instant('common.error'), '');
      }
    );
  }

  fatchDetail() {
    this._workerProfileServices.payDetailForm.patchValue({
      id: this.workerDto.workerProfile.id,
      willingToWorkFullTime: this.fullTimeEmployee,
      maxHourlyRate: this.workerDto.workerProfile.maxHourlyRate,
      minHourlyRate: this.workerDto.workerProfile.minHourlyRate,
    });
    this.fatchSecondDetail();
  }

  fatchSecondDetail() {
    if (this.fullTimeEmployee) {
      this.fullTimeEmployeeForm.patchValue({
        maxFullTimeSalary: this.workerDto.workerProfile.maxFullTimeSalary,
        minFullTimeSalary: this.workerDto.workerProfile.minFullTimeSalary,
      });
    }
  }

  onChangeValue(event) {
    this.minHourly = this._workerProfileServices.payDetailForm.value.minHourlyRate;
    this.maxHourly = event.target.value;
    if (parseFloat(this.maxHourly) <= parseFloat(this.minHourly)) {
      this.errorFlagHour = true;
    }
    else {
      this.errorFlagHour = false;
    }
  }

  onChangeValueForMin(event) {
    this.maxHourly = this._workerProfileServices.payDetailForm.value.maxHourlyRate;
    this.minHourly = event.target.value;
    if (parseFloat(this.maxHourly) <= parseFloat(this.minHourly)) {
      this.errorFlagHour = true;
      this.feedback = "To cannot be smaller than from";
    }
    else {
      this.errorFlagHour = false;
    }
  }

  onChangeFullTimeValue(event) {
    this.minFullTime = this.fullTimeEmployeeForm.value.minFullTimeSalary;
    this.maxFullTime = event.target.value;
    if (parseFloat(this.maxFullTime) <= parseFloat(this.minFullTime)) {
      this.errorFlagFullTimeEmployee = true;
      this.feedback = "To cannot be smaller than from";
    }
    else {
      this.errorFlagFullTimeEmployee = false;
    }
  }

  onChangeFullTimeValueForMin(event) {
    this.maxFullTime = this.fullTimeEmployeeForm.value.maxFullTimeSalary;
    this.minFullTime = event.target.value;
    if (parseFloat(this.maxFullTime) <= parseFloat(this.minFullTime)) {
      this.errorFlagFullTimeEmployee = true;
      this.feedback = "To cannot be smaller than from";
    }
    else {
      this.errorFlagFullTimeEmployee = false;
    }
  }

  onSubmit(next?) {
    this.submitted = true;

    if (this.fullTimeEmployee) {
      if (!this.fullTimeEmployeeForm.valid) {
        CustomValidator.markFormGroupTouched(this.fullTimeEmployeeForm);
        this.submitted = true;
        return false;
      }
    }

    if (this.errorFlagFullTimeEmployee) {
      return false;
    }

    if (this.errorFlagHour) {
      return false;
    }

    if (!this._workerProfileServices.payDetailForm.valid) {
      CustomValidator.markFormGroupTouched(this._workerProfileServices.payDetailForm);
      this.submitted = true;
      return false;
    }




    if (this._workerProfileServices.payDetailForm.controls.id.value != null || !this._workerProfileServices.payDetailForm.valid) {
      this.workerDto.workerProfile.id = this._workerProfileServices.payDetailForm.get('id').value;
      this.workerDto.workerProfile.maxHourlyRate = this._workerProfileServices.payDetailForm.get('maxHourlyRate').value;
      this.workerDto.workerProfile.minHourlyRate = this._workerProfileServices.payDetailForm.get('minHourlyRate').value;
      this.workerDto.workerProfile.isWillingToWorkFullTime = this._workerProfileServices.payDetailForm.get('willingToWorkFullTime').value;
      if (this.fullTimeEmployee) {
        this.workerDto.workerProfile.maxFullTimeSalary = this.fullTimeEmployeeForm.get('maxFullTimeSalary').value;
        this.workerDto.workerProfile.minFullTimeSalary = this.fullTimeEmployeeForm.get('minFullTimeSalary').value;
      }
      this._workerProfileServices.updateWorkerProfile(this.workerDto).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('worker.profile.updated'), '');
            this.submitted = false;
            if (next === "next") {
              this.next();
            }
          } else {
            this._notificationService.error(data, '');
          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.submitted = false;
        }
      );
    }
    else {
    }
  }

  previous() {
    this.goBackToBasicDetail.emit('');
  }

  next() {
    this.goToWorkExpAndEducation.emit('');
  }


}
