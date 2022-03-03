import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class ComplianceService {

  constructor(private _customHttpService: CustomHttpService, private http: HttpClient) { }

  getComplianceList(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_COMPLIANCE + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }

  getComplianceById(id): Observable<any> {
    const url = API_CONSTANTS.GET_COMPLIANCE_BY_ID + id;
    return this._customHttpService.get(url);
  }

  addCompliance(Compliance) {
    const url = API_CONSTANTS.ADD_COMPLIANCE;
    return this._customHttpService.post(url, Compliance);
  }

  updateCompliance(Compliance) {
    const url = API_CONSTANTS.UPDATE_COMPLIANCE;
    return this._customHttpService.put(url, Compliance);
  }

  deleteCompliance(ComplianceId) {
    const url = API_CONSTANTS.DELETE_COMPLIANCE + ComplianceId;
    return this._customHttpService.delete(url);
  }
}
