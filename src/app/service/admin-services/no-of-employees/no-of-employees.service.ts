import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class NoOfEmployeesService {


  constructor(private _customHttpService: CustomHttpService, private http: HttpClient) { }

  getNoOfEmployeeList(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_NO_OF_EMPLOYEES + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }

  addNoOfEmployee(entity) {
    const url = API_CONSTANTS.ADD_NO_OF_EMPLOYEES;
    return this._customHttpService.post(url, entity);
  }

  updateNoOfEmployee(entity) {
    const url = API_CONSTANTS.UPDATE_NO_OF_EMPLOYEES;
    return this._customHttpService.put(url, entity);
  }

  enableNoOfEmployee(id: string): Observable<any> {
    const url = API_CONSTANTS.ENABLE_NO_OF_EMPLOYEES + id;
    return this._customHttpService.put(url, id);
  }

  disableNoOfEmployee(id: string): Observable<any> {
    const url = API_CONSTANTS.DISABLE_NO_OF_EMPLOYEES + id;
    return this._customHttpService.put(url, id);
  }

  
  

  
}
