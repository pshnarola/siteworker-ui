import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'src/app/service/User.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { MustMatch } from 'src/app/shared/must-match.validator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { Client } from './client';

@Component({
  selector: 'app-client-signup',
  templateUrl: './client-signup.component.html',
  styleUrls: ['./client-signup.component.css']
})
export class ClientSignupComponent implements OnInit {
  /*
    @author Vinita Jagwani
  */
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  myForm: FormGroup;
  submitted = false;
  client: Client[] = [];
  passwordSuggestion = false;
  constructor(private formBuilder: FormBuilder,
    private userService: UserService,
    private translator: TranslateService,
    private notificationService: UINotificationService,
    private router: Router) {

  }

  ngOnInit(): void {
    this.initializeForm();
    let element = document.getElementsByTagName("body")[0];
    element.classList.add("client-theme");
    element.classList.remove("admin-theme");
  }

  ngOnDestroy() {
    let element = document.getElementsByTagName("body")[0];
    element.classList.remove("client-theme");
    element.classList.remove("admin-theme");
  }

  initializeForm(): void {
    this.myForm = this.formBuilder.group({
      id: [],
      companyName: ['', [CustomValidator.required, Validators.maxLength(50)]],
      firstName: ['', [CustomValidator.required, Validators.maxLength(50)]],
      lastName: ['', [CustomValidator.required, Validators.maxLength(50)]],
      email: ['', [CustomValidator.required, CustomValidator.emailValidator, CustomValidator.clientEmailValidator, Validators.maxLength(50)
      ]],
      password: ['', [CustomValidator.required,
      Validators.pattern(COMMON_CONSTANTS.PASSWORD_REGX), Validators.maxLength(20), Validators.minLength(8)]],
      confirmPassword: ['', [CustomValidator.required,
      Validators.pattern(COMMON_CONSTANTS.PASSWORD_REGX), Validators.maxLength(20), Validators.minLength(8)]],
      workPhone: ['', [CustomValidator.required]],
      mobilePhone: ['', [CustomValidator.required]],
      role: 'CLIENT'
    },
      {
        validator: MustMatch('password', 'confirmPassword')
      }
    );
  }
  onFocus(): void {
    this.passwordSuggestion = true;
  }

  onFocusOut(): void {
    this.passwordSuggestion = false;
  }

  onSubmit(): boolean {
    this.submitted = true;
    if (!this.myForm.valid) {
      let controlName: string;
      // tslint:disable-next-line: forin
      for (controlName in this.myForm.controls) {
        this.myForm.controls[controlName].markAsDirty();
        this.myForm.controls[controlName].updateValueAndValidity(); // Validate form field and show the message
      }
      this.submitted = true;
      return false;
    }

    this.userService.addUser(JSON.stringify(this.myForm.value)).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success(this.translator.instant('signup.successMessage'), '');
          setTimeout(() => {
            this.router.navigate([PATH_CONSTANTS.LOGIN_PATH]);
          }, 2000);
        }
        else {
          this.notificationService.error(this.translator.instant('email.already.exists'), '');
          this.submitted = false;
        }
      },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      }
    );
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
