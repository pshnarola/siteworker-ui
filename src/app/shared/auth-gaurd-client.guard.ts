import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { LocalStorageService } from '../service/localstorage.service';
import { User } from './vo/User';

@Injectable({
  providedIn: 'root'
})
export class AuthGaurdClientGuard implements CanActivate {
  user: User;
  urlSet = ['/client/client-job-time-sheet-details','/client/change-request','/client/projectDetails','/client/jobsiteDetails','/client/view-job-details','/client/clientJobTimeSheet','/client/changePassword','/client/post-project'];

  constructor(
    private _router: Router,
    private _localStorageService: LocalStorageService
  ) { }


  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.user = this._localStorageService.getLoginUserObject();

    if (this.user && (this.user.roles[0].roleName === "CLIENT" || this.user.roles[0].roleName === "SUPERVISOR")) {
      if (this.user.roles[0].roleName === "SUPERVISOR") {
        if (this.authenticateSupervisor(state.url)) {
          return true;
        } else {
          this._router.navigate(["/client/change-request"]);
          return false;
        }
      } else if (this.user.roles[0].roleName === "CLIENT") {
        return true;
      }
    }
    // not logged in so redirect to login page
    this._router.navigate(["login"], { queryParams: { returnUrl: state.url } });
    return false;
  }

  authenticateSupervisor(url) {
    if (this.urlSet.includes(url)) {
      return true;
    } else {
      return false;
    }
  }

}
