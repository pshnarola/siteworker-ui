import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { AdminUserService } from 'src/app/service/admin-services/admin-user/admin-user.service';
import { SupervisorService } from 'src/app/service/client-services/supervisor/supervisor.service';
import { DateHelperService } from 'src/app/service/date-helper.service';
import { ThemeService } from 'src/app/service/theme.service';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import * as MenuJson from 'src/assets/translate/menu/en.json';
import { LocalStorageService } from './../../service/localstorage.service';
import { LoginService } from './../../service/login.service';
import { CustomValidator } from './../../shared/CustomValidator';
import { PATH_CONSTANTS } from './../../shared/PathConstants';
import { User } from './../../shared/vo/User';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [MessageService],
})
export class LoginComponent implements OnInit {

  public form: FormGroup;
  public email: AbstractControl;
  public password: AbstractControl;
  public submitted = false;
  loader = false;
  returnUrl: string;
  menuAccessJson = MenuJson;
  userMenuAccess: any;

  @ViewChild('emailField')
  emailField: any;
  accessData: any;

  constructor(
    private fb: FormBuilder,
    private _router: Router,
    private _loginService: LoginService,
    private _localStorageService: LocalStorageService,
    private _adminUserService: AdminUserService,
    private _route: ActivatedRoute,
    private _activatedRoute: ActivatedRoute,
    private SupervisorService: SupervisorService,
    private translator: TranslateService,
    private primengConfig: PrimeNGConfig,
    private _errorService: UINotificationService,
    private themeService: ThemeService,
    private dateHelperService: DateHelperService,
    private spinner: NgxSpinnerService
  ) {
    this.checkLogin();
    this.form = this.fb.group({
      email: ['', [CustomValidator.required, CustomValidator.emailValidator]],
      password: ['', [CustomValidator.required]]
    });

    this.email = this.form.controls.email;
    this.password = this.form.controls.password;
  }

  ngOnInit(): void {
    this.primengConfig.ripple = true;
    this.spinner.hide();
  }

  ngAfterViewInit(): void {
    // this.emailField.nativeElement.focus();
  }

  onSubmit(values: Object) {
    this.returnUrl = this._route.snapshot.queryParams.returnUrl || '/'; // Get return URL
    this.loader = true;
    if (!this.form.valid) {
      CustomValidator.markFormGroupTouched(this.form);
      this.submitted = true;
      return false;
    }
    if (this.form.valid) {
      this._loginService.login(this.form).subscribe(
        data => {
          if (data.access_token) {
            this._localStorageService.setItem('isFromLogin', true);
            this._localStorageService.setItem('Authorization', 'Bearer ' + data.access_token);
            this.getUserInfo(this.form.controls.email.value);

            // set tomorrow date
            const myDate = new Date(new Date().getTime() + (1 * 24 * 60 * 60 * 1000));
            const customDate = this.setDate(myDate);
            console.log('customDate', customDate);

            // auto logout
            // this._loginService.autoLogout(43200000);
          } else {
            this.loader = false;
          }
        },
        error => {
          this.loader = false;
          console.log(error);
          // if (error) {
          //   alert(JSON.stringify(error));
          //   alert(error);
          //   if (error.statusCode === 400) {
          //     this._errorService.error('Invalid Username/Password.', '');
          //   }
          //   else{
          //     this._errorService.error('Something went wrong. Please try again later or contact your administrator', '');
          //   }
          // }
        }
      );
    } else {
      CustomValidator.markFormGroupTouched(this.form);
      this.loader = false;
    }
  }
  setDate(myDate: Date) {
    myDate.setHours(0);
    myDate.setMinutes(0);
    myDate.setSeconds(0);

    return myDate;
  }

  getUserInfo(email: string): void {
    this._loginService.getUserByEmail(email).subscribe(
      data => {
        this.loader = false;
        if (data.statusCode === '200' && data.message === 'OK') {
          this._localStorageService.setItem('user', data.data);
          const user = data.data as User;
          this.checkUserRoleRights(user.roles[0].roleName, user.id);
          this.themeService.setTheme(user.roles[0].roleName);
        }
      },
      error => {
        this.loader = false;
        console.log(error);
      }
    );
  }

  checkUserRoleRights(role: any, id: any): void {
    let loggedInUserId = this._localStorageService.getLoginUserId();
    if (role === 'SUPERVISOR') {
      this.SupervisorService.getSupervisorProfileDetailById(loggedInUserId).subscribe(data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this._localStorageService.setItem('clientOfLoggedInSupervisor', data.data.user);
          this._router.navigate([PATH_CONSTANTS.CHANGE_REQUEST]);
        }
      });
    }
    else if (role === 'SUBADMIN') {
      this._adminUserService.getUserPermissionsListById(id).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.userMenuAccess = data.data;
            this.menuAccess();
            this.openDefaultView();
          }
        },
        error => {
          this._errorService.error(this.translator.instant('common.error'), '');
          console.log(error);
        }
      );
    } else {
      if (this.verifyReturnURL(this.returnUrl, role)) {
        if (this.returnUrl === '/') {
          this.openDefaultView();
        }
        else {
          this._router.navigateByUrl(this.returnUrl);
        }
      } else {
        this.openDefaultView();
      }
    }
  }

  menuAccess(): void {
    this._localStorageService.setItem("userAccess", this.userMenuAccess);
    this.userMenuAccess.forEach(element => {
      if (element.menuName === this.menuAccessJson["default"].adminClients.menuName) {
        this.menuAccessJson["default"].adminClients.canView = element.canView;
      }
      else if (element.menuName === this.menuAccessJson["default"].adminDashboard.menuName) {
        this.menuAccessJson["default"].adminDashboard.canView = element.canView;
      }
      else if (element.menuName === this.menuAccessJson["default"].adminJobs.menuName) {
        this.menuAccessJson["default"].adminJobs.canView = element.canView;
      }
      else if (element.menuName === this.menuAccessJson["default"].adminMasters.menuName) {
        this.menuAccessJson["default"].adminMasters.canView = element.canView;
      }
      else if (element.menuName === this.menuAccessJson["default"].adminProjects.menuName) {
        this.menuAccessJson["default"].adminProjects.canView = element.canView;
      }
      else if (element.menuName === this.menuAccessJson["default"].adminReports.menuName) {
        this.menuAccessJson["default"].adminReports.canView = element.canView;
      }
      else if (element.menuName === this.menuAccessJson["default"].adminSubcontractors.menuName) {
        this.menuAccessJson["default"].adminSubcontractors.canView = element.canView;
      }
      else if (element.menuName === this.menuAccessJson["default"].adminWorkers.menuName) {
        this.menuAccessJson["default"].adminWorkers.canView = element.canView;
      }
    });
    this._localStorageService.setItem("subMenuAccess", this.menuAccessJson["default"]);
  }

  checkLogin(): void {
    if (this._localStorageService.getItem('Authorization')) {
      this.openDefaultView();
    }
  }

  forgotPassword(): void {
    // this._router.navigate([PATH_CONSTANTS.FORGOT_PASSWORD]);
    this._router.navigate(['./forgotPassword'], { relativeTo: this._activatedRoute });

    // setTimeout(function () {
    //   window.location.reload();
    // });
  }

  openDefaultView(): void {
    const user = this._localStorageService.getLoginUserObject() as User;
    switch (user.roles[0].roleName) {
      case 'ADMIN':
        this._router.navigate([PATH_CONSTANTS.ADMIN_DASHBOARD]);
        break;
      case 'SUBADMIN':
        this._router.navigate([PATH_CONSTANTS.ADMIN_DASHBOARD]);
        break;
      case 'CLIENT':
        this._router.navigate([PATH_CONSTANTS.CLIENT_DASHBOARD]);
        break;
      case 'SUBCONTRACTOR':
        this._router.navigate([PATH_CONSTANTS.SUBCONTRACTOR_PROJECT_LIST]);
        break;
      case 'WORKER':
        this._router.navigate([PATH_CONSTANTS.WOKER_JOB_LISTING]);
        break;

    }
  }

  onPrivacyPolicyClick() {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.TERMLY_PRIVACY_POLICY);
  }

  onTermsOfUseClick() {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.TERMLY_TERMS_OF_USE);
  }

  onCookiePolicyClick() {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.TERMLY_COOKIE_POLICY);
  }

  onSignup() {
    // event.preventDefault();
    // this.emailField.nativeElement.focus();
    this._router.navigate(['../signup']);
  }

  onForgotPassword() {
    this._router.navigate(['../signup/forgot-password']);
  }

  preventBlur(event) {
    event.preventDefault();
    this._router.navigate(['../signup']);
  }

  verifyReturnURL(returnURL, roleName): boolean {
    if (roleName.toLowerCase() === returnURL.split('/')[1]) {
      return true;
    } else {
      return false;
    }
  }

}


