import { Injectable } from '@angular/core';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class VerifyUserService {

  constructor(private _customHttpService: CustomHttpService,) { }

  verifyUserByToken(token) {
    const url = API_CONSTANTS.VERIFY_USER + '?token=' + token ;
    return this._customHttpService.putWithoutAuthorization(url, token);
  }

}
