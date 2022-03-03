import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot
} from '@angular/router';
import { LocalStorageService } from './../service/localstorage.service';
import { User } from './vo/User';

@Injectable()
export class AuthGuardAdmin implements CanActivate {
  user: User;
  accessData: any;

  constructor(
    private _localStorageService: LocalStorageService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.user = this._localStorageService.getLoginUserObject();
    this.accessData = this._localStorageService.getItem('subMenuAccess');
    if (this.user && this.user.roles[0].roleName === 'ADMIN') {
      return true;
    }
    else if (this.user.roles[0].roleName === 'SUBADMIN') {
      if (this.user && this.accessData) {
        if (this.authenticateAdminAccess(state.url)) {
          return true;
        }
      }
      // not logged in so redirect to login page
    }
    // not logged in so redirect to login page
    // this._router.navigate(["login"], { queryParams: { returnUrl: state.url } });
    return false;
  }
  authenticateAdminAccess(url) {
    // tslint:disable-next-line: forin
    for (const key in this.accessData) {
      // console.log(this.accessData[key].menuName);
      // console.log(this.accessData[key].menuName.indexOf(url.split('/')[2]));
      if (this.accessData[key].menuName.toLowerCase().indexOf(url.split('/')[2]) > -1) {
        const viewMenu = this.accessData[key].canView;
        if (viewMenu) {
          return true;
        }
        else {
          return false;
        }
      }
      else if (this.accessData[key].routes != null && this.accessData[key].routes.filter(x => (x.routerlink.split('/')[1])).length > 0) {
        const viewMenu = this.accessData[key].canView;
        if (viewMenu) {
          return true;
        }
        else {
          return false;
        }
      }
    }
    return false;
  }
}
