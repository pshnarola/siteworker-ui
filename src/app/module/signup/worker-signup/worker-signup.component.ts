import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { UserService } from 'src/app/service/User.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { MustMatch } from 'src/app/shared/must-match.validator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { Client } from '../client-signup/client';

@Component({
  selector: 'app-worker-signup',
  templateUrl: './worker-signup.component.html',
  styleUrls: ['./worker-signup.component.css']
})
export class WorkerSignupComponent implements OnInit {

  myForm: FormGroup;
  submitted = false;
  isLoginAsCompany: boolean;
  client: Client[] = [];
  selectedValue: boolean = false;
  loginUserId: string;
  workPhoneNumber: number;
  passwordSuggestion: boolean = false;

  constructor(
    private _userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private _localStorageService: LocalStorageService,
    private _notificationService: UINotificationService,
    private _formBuilder: FormBuilder,
    private captionChangeService: HeaderManagementService,
    private translator: TranslateService
  ) {
    this.loginUserId = _localStorageService.getLoginUserId();
  }

  ngOnInit(): void {
    this.initializeForm();
    let element = document.getElementsByTagName("body")[0];
    element.classList.add("worker-theme");
    element.classList.remove("admin-theme");
    element.classList.remove("client-theme");
  }

  initializeForm(): void {
    this.myForm = this._formBuilder.group({
      id: [],
      isLoginAsCompany: [false],
      companyName: [''],
      firstName: ['', [CustomValidator.required, Validators.maxLength(50)]],
      lastName: ['', [CustomValidator.required, Validators.maxLength(50)]],
      email: ['', [CustomValidator.required, CustomValidator.emailValidator, Validators.maxLength(100)]],
      password: ['', [CustomValidator.required, Validators.pattern(COMMON_CONSTANTS.PASSWORD_REGX), Validators.maxLength(20), Validators.minLength(8)]],
      confirmPassword: ['', [CustomValidator.required, Validators.pattern(COMMON_CONSTANTS.PASSWORD_REGX), Validators.maxLength(20), Validators.minLength(8)]],
      mobilePhone: ['', [CustomValidator.required]],
      workPhone: [''],
      role: 'WORKER',
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      createdDate: [],
      updatedDate: []

    },
      {
        validator: MustMatch('password', 'confirmPassword')
      });
  }

  ngOnDestroy() {
    let element = document.getElementsByTagName("body")[0];
    element.classList.remove("worker-theme");
    element.classList.remove("admin-theme");
    element.classList.remove("client-theme");
  }

  onSubmit(): boolean {
    this.workPhoneNumber = this.myForm.controls.mobilePhone.value;
    this.myForm.controls['workPhone'].setValue(this.workPhoneNumber);

    this.submitted = true;

    if (!this.myForm.valid) {
      let controlName: string;
      for (controlName in this.myForm.controls) {
        this.myForm.controls[controlName].markAsDirty();
        this.myForm.controls[controlName].updateValueAndValidity(); // Validate form field and show the message
      }
      this.submitted = true;
      return false;
    }

    this._userService.addUser(JSON.stringify(this.myForm.value)).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this._notificationService.success(this.translator.instant('signup.successMessage.by.worker'), '');
          this.submitted = false;
          setTimeout(() => {
            this.router.navigate([PATH_CONSTANTS.LOGIN_PATH])
          }, 2000);
        } else {
          this._notificationService.error(this.translator.instant('email.already.exists'), '');
          this.submitted = false;
        }
      },
      error => {
        this._notificationService.error(this.translator.instant('common.error'), '');
        console.log(error);
        this.submitted = false;
      }
    );
  }

  onFocus() {
    this.passwordSuggestion = true;
  }

  onFocusOut() {
    this.passwordSuggestion = false;
  }

  onServiceAgreementClick() {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.SERVICE_AGREEMENT);
  }

  onTermsOfUseClick() {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.TERMLY_TERMS_OF_USE);
  }

  onPrivacyPolicyClick() {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.TERMLY_PRIVACY_POLICY);
  }

  onCookiePolicyClick() {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.TERMLY_COOKIE_POLICY);
  }

}
