import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class ContentMSAService {

  constructor(private _customHttpService: CustomHttpService, private http: HttpClient) { }

  getMSAContentList(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_MSA_CONTENT + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }

  addMSAContent(msaContent) {
    const url = API_CONSTANTS.ADD_MSA_CONTENT;
    return this._customHttpService.post(url, msaContent);
  }

  updateMSAContent(msaContent) {
    const url = API_CONSTANTS.UPDATE_MSA_CONTENT;
    return this._customHttpService.put(url, msaContent);
  }

  enableMSAContent(id: string): Observable<any> {
    const url = API_CONSTANTS.ACTIVE_MSA_CONTENT + id;
    return this._customHttpService.put(url, id);
  }

  disableMSAContent(id: string): Observable<any> {
    const url = API_CONSTANTS.DEACTIVE_MSA_CONTENT + id;
    return this._customHttpService.put(url, id);
  }

  
}
