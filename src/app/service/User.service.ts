
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { API_CONSTANTS } from '../shared/ApiConstants';
import { CustomHttpService } from './customHttp.service';

@Injectable()
export class UserService {

    constructor(private _customHttpService: CustomHttpService) { }

    getUserList(dataTableParam: URLSearchParams): Observable<any> {
        const url = API_CONSTANTS.GET_USER_LIST + '?' + dataTableParam;
        return this._customHttpService.get(url);
    }

    addUser(user) {
        const url = API_CONSTANTS.ADD_USER;
        return this._customHttpService.postWithoutAuthorization(url, user);
    }

    addUserFromAdmin(user) {
        const url = API_CONSTANTS.ADD_USER;
        return this._customHttpService.post(url, user);
    }

    updateUser(user) {
        const url = API_CONSTANTS.UPDATE_USER;
        return this._customHttpService.put(url, user);
    }

    resetPassword(dataTableParam: URLSearchParams): Observable<any> {
        const url = API_CONSTANTS.RESET_PASSWORD + '?' + dataTableParam;
        console.log(url);
        console.log(dataTableParam);
        return this._customHttpService.putWithoutAuthorization(url, '');

    }

    changePassword(id, password, oldPassword): Observable<any> {
        const url = API_CONSTANTS.CHANGE_PASSWORD + id + '?password=' + password + '&&oldPassword=' + oldPassword;
        return this._customHttpService.put(url, '');
    }

    forgotPassword(dataTableParam: URLSearchParams): Observable<any> {
        const url = API_CONSTANTS.FORGOT_PASSWORD + '?' + dataTableParam;
        console.log(url);
        return this._customHttpService.getWithoutAuthorization(url);
    }

    // enableDisableUser(id: string, isActive: number): Observable<any> {
    //     const url = API_CONSTANTS.ACTIVE_DEACTIVE_USER + '?' + 'userId=' + id + '&isActive=' + isActive;
    //     const body = JSON.stringify({ 'data': '1' });
    //     return this._customHttpService.put(url, body);
    // }

    activateUser(id): Observable<any> {
        const url = API_CONSTANTS.ACTIVATE_USER;
        return this._customHttpService.put(url, id);
    }

    deactivateUser(id): Observable<any> {
        const url = API_CONSTANTS.DEACTIVATE_USER;
        return this._customHttpService.put(url, id);
    }

    // deleteUser(id: string): Observable<any> {
    //     const url = API_CONSTANTS.DELETE_USER + '?' + 'userId=' + id;
    //     return this._customHttpService.delete(url);
    // }

    // getUserById(userId: string): Observable<any> {
    //     const url = API_CONSTANTS.GET_PARENT_USER_BY_ID + '?' + 'userId=' + userId;
    //     return this._customHttpService.get(url);
    // }

    getSupervisorByClientAndIsActive(id) {
        const url = API_CONSTANTS.GET_SUPERVISOR_BY_CLIENT + id;
        return this._customHttpService.get(url);
    }
    userSelection(dataTableParam: URLSearchParams): Observable<any> {
        const url = API_CONSTANTS.USER_SELECTION + '?' + dataTableParam;
        return this._customHttpService.get(url);
    }
    userSelectionCustom(dataTableParam: URLSearchParams): Observable<any> {
        const url = API_CONSTANTS.USER_SELECTION_CUSTOM + '?' + dataTableParam;
        return this._customHttpService.get(url);
    }
    findUserById(id) {
        const url = API_CONSTANTS.GET_USER_BY_ID + id;
        return this._customHttpService.get(url);
    }

    getUserCountForDashboard(): Observable<any> {
        const url = API_CONSTANTS.GET_USER_COUNT_BY_ROLES;
        return this._customHttpService.get(url);
    }

}
