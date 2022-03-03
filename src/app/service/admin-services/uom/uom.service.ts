import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class UomService {

  constructor(private _customHttpService: CustomHttpService, private http: HttpClient) { }

  getUOMList(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_UOM + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }

  addUOM(uom) {
    const url = API_CONSTANTS.ADD_UOM;
    return this._customHttpService.post(url, uom);
  }

  updateUOM(uom) {
    const url = API_CONSTANTS.UPDATE_UOM;
    return this._customHttpService.put(url, uom);
  }

  enableUOM(id: string): Observable<any> {
    const url = API_CONSTANTS.ACTIVE_UOM + id;
    return this._customHttpService.put(url, id);
  }

  disableUOM(id: string): Observable<any> {
    const url = API_CONSTANTS.DEACTIVE_UOM + id;
    return this._customHttpService.put(url, id);
  }

  
}
