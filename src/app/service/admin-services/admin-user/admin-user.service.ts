import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {

  constructor(private customHttpService: CustomHttpService) { }

  getUserPermissionsListById(id): Observable<any> {
    const url = API_CONSTANTS.GET_USER_PERMISSIONS_LIST_BY_ID + id;
    return this.customHttpService.get(url);
  }

  getUserList(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_SUB_ADMIN_USER_LIST + '?' + dataTableParam;
    return this.customHttpService.get(url);
}

  addUser(user) {
    const url = API_CONSTANTS.ADD_ADMIN_USER;
    return this.customHttpService.post(url, user);
  }

  updateUser(user) {
    const url = API_CONSTANTS.UPDATE_ADMIN_USER;
    return this.customHttpService.put(url, user);
  }

  updateUserPermissions(user) {
    const url = API_CONSTANTS.UPDATE_ADMIN_USER_PERMISSIONS;
    return this.customHttpService.put(url, user);
  }

}
