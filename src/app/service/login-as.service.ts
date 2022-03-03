import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { API_CONSTANTS } from '../shared/ApiConstants';
import { UINotificationService } from '../shared/notification/uinotification.service';
import { PATH_CONSTANTS } from '../shared/PathConstants';
import { User } from '../shared/vo/User';
import { CustomHttpService } from './customHttp.service';
import { LocalStorageService } from './localstorage.service';
import { LoginService } from './login.service';
import { ThemeService } from './theme.service';

@Injectable({
  providedIn: 'root'
})
export class LoginAsService {

  returnUrl: string;

  constructor(private _customHttpService: CustomHttpService,
     private localStorageService: LocalStorageService, 
     private notificationService: UINotificationService,
     private loginService: LoginService, private themeService: ThemeService, private _router: Router) { }


  generateTokenForLoginAs(dataTableParam: URLSearchParams,userEmail): void {
    const url = API_CONSTANTS.SIGN_IN + '?' + dataTableParam;
    this._customHttpService.postWithoutAuthorization(url, '').subscribe(e => {
      console.log(e);
      if(e.statusCode === '200' && e.message === 'OK'){
        this.localStorageService.logoutForNewRoleLogin();
        this.localStorageService.setItem('Authorization', 'Bearer ' + e.data.access_token);
        this.getUserInfo(userEmail);
      }
      else{
        this.notificationService.error(e.message,'');
      }
    });
  }


  getUserInfo(email: string): void {
    this.loginService.getUserByEmail(email).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.localStorageService.setItem('user', data.data);
          const user = data.data as User;

          this.themeService.setTheme(user.roles[0].roleName);
          if (this.returnUrl === '/') {
            this.openDefaultView();
          }
          else {
            this._router.navigateByUrl(this.returnUrl);
          }
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  openDefaultView(): void {
    const user = this.localStorageService.getLoginUserObject() as User;
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
}
