import { LocalStorageService } from './../service/localstorage.service';
import { Injectable } from "@angular/core";
import {
  Router,
  CanActivate,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from "@angular/router";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private _router: Router,
    private _localStorageService: LocalStorageService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this._localStorageService.getItem("user")) {
      return true;
    }
    // not logged in so redirect to login page
    this._router.navigate(["login"], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
