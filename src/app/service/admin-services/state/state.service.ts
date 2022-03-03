import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { CustomHttpService } from '../../customHttp.service';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  constructor(private _customHttpService: CustomHttpService, private http: HttpClient) { }


  getStateList(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_STATE + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }

  addState(state) {
    const url = API_CONSTANTS.ADD_STATE;
    return this._customHttpService.post(url, state);
  }

  updateState(state) {
    const url = API_CONSTANTS.UPDATE_STATE;
    return this._customHttpService.put(url, state);
  }

  enableState(id: string): Observable<any> {
    const url = API_CONSTANTS.ENABLE_STATE + id;
    return this._customHttpService.put(url, id);
  }

  disableState(id: string): Observable<any> {
    const url = API_CONSTANTS.DISABLE_STATE + id;
    return this._customHttpService.put(url, id);
  }

  bulkUpload(file: File, id): Observable<HttpEvent<any>> {
    const url = API_CONSTANTS.BULK_UPLOAD_STATE + id;
    // return this._customHttpService.put(url,"adsad" );
    const formData: FormData = new FormData();

    formData.append('file', file);

    const req = new HttpRequest('PUT', url, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }
}
