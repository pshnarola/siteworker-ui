import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class EmrService {

  constructor(private _customHttpService: CustomHttpService, private http: HttpClient) { }

  getEmrList(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_EMR + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }

  addEmr(Emr) {
    const url = API_CONSTANTS.ADD_EMR;
    return this._customHttpService.post(url, Emr);
  }

  updateEmr(Emr) {
    const url = API_CONSTANTS.UPDATE_EMR;
    return this._customHttpService.put(url, Emr);
  }

  deleteEmr(EmrId) {
    const url = API_CONSTANTS.DELETE_EMR + EmrId;
    return this._customHttpService.delete(url);
  }

  approveEmr(Emr){
    const url = API_CONSTANTS.APPROVE_EMR;
    return this._customHttpService.put(url, Emr);
  }
  rejectEmr(Emr){
    const url = API_CONSTANTS.REJECT_EMR;
    return this._customHttpService.put(url, Emr);
  }

  clearEmr(id,adminId){
    const url = API_CONSTANTS.CLEAR_EMR + id + '/' + adminId;
    return this._customHttpService.put(url,null);
  }

}
