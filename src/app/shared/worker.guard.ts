import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LocalStorageService } from '../service/localstorage.service';
import { User } from './vo/User';

@Injectable({
  providedIn: 'root'
})
export class WorkerGuard implements CanActivate {
  user: User;

  constructor(
    private _router: Router,
    private _localStorageService: LocalStorageService
  ) { }


  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.user = this._localStorageService.getLoginUserObject();
    
    if (this.user && (this.user.roles[0].roleName === "WORKER")) {
      return true;
    }
    // not logged in so redirect to login page
    this._router.navigate(["login"], { queryParams: { returnUrl: state.url } });
    return false;
  }

}
