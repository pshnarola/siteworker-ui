import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class OshaService {

  constructor(private _customHttpService: CustomHttpService, private http: HttpClient) { }

  getOshaList(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_OSHA + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }

  getOshaById(id): Observable<any> {
    const url = API_CONSTANTS.GET_OSHA_BY_ID + id;
    return this._customHttpService.get(url);
  }

  addOsha(Osha) {
    const url = API_CONSTANTS.ADD_OSHA;
    return this._customHttpService.post(url, Osha);
  }

  updateOsha(Osha) {
    const url = API_CONSTANTS.UPDATE_OSHA;
    return this._customHttpService.put(url, Osha);
  }

  deleteOsha(OshaId) {
    const url = API_CONSTANTS.DELETE_OSHA + OshaId;
    return this._customHttpService.delete(url);
  }
  approveOsha(Osha){
    const url = API_CONSTANTS.APPROVE_OSHA;
    return this._customHttpService.put(url, Osha);
  }
  rejectOsha(Osha){
    const url = API_CONSTANTS.REJECT_OSHA;
    return this._customHttpService.put(url, Osha);
  }

  clearOsha(id,adminId){
    const url = API_CONSTANTS.CLEAR_OSHA + id + '/' + adminId;
    return this._customHttpService.put(url, null);
  }
}
