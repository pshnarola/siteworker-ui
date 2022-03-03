import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class CoiService {

 
  constructor(private _customHttpService: CustomHttpService, private http: HttpClient) { }

  getCOIList(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_COI + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }

  addCOI(COI) {
    const url = API_CONSTANTS.ADD_COI;
    return this._customHttpService.post(url, COI);
  }

  updateCOI(COI) {
    const url = API_CONSTANTS.UPDATE_COI;
    return this._customHttpService.put(url, COI);
  }

  deleteCOI(COIId) {
    const url = API_CONSTANTS.DELETE_COI + COIId;
    return this._customHttpService.delete(url);
  }

  approveCoi(Coi){
    const url = API_CONSTANTS.APPROVE_COI;
    return this._customHttpService.put(url, Coi);
  }
  rejectCoi(Coi){
    const url = API_CONSTANTS.REJECT_COI;
    return this._customHttpService.put(url, Coi);
  }

  clearCoi(id,adminId){
    const url = API_CONSTANTS.CLEAR_COI + id + '/' + adminId;
    return this._customHttpService.put(url, null);
  }

}
