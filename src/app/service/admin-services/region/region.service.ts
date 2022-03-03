import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Region } from 'src/app/shared/vo/region/region';
import { CustomHttpService } from '../../customHttp.service';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';


@Injectable({
  providedIn: 'root'
})
export class RegionService {

  regionSubject= new Subject<Region[]>();


  constructor(private _customHttpService: CustomHttpService, private http: HttpClient) { }

  getRegionList(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_REGION + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }

  addRegion(region) {
    const url = API_CONSTANTS.ADD_REGION;
    return this._customHttpService.post(url, region);
  }

  updateRegion(region) {
    const url = API_CONSTANTS.UPDATE_REGION;
    return this._customHttpService.put(url, region);
  }

  enableRegion(id: string): Observable<any> {
    const url = API_CONSTANTS.ACTIVE_REGION + id;
    return this._customHttpService.put(url, id);
  }

  disableRegion(id: string): Observable<any> {
    const url = API_CONSTANTS.DEACTIVE_REGION + id;
    return this._customHttpService.put(url, id);
  }

  disableAllRegion(): Observable<any> {
    const url = API_CONSTANTS.DEACTIVE_ALL_REGION;
    return this._customHttpService.put(url, 'Disable All');
  }

  enableAllRegion(): Observable<any> {
    const url = API_CONSTANTS.ACTIVE_ALL_REGION;
    return this._customHttpService.put(url, 'Enable All');
  }

  bulkUpload(file: File, id): Observable<HttpEvent<any>> {
    const url = API_CONSTANTS.BULK_UPLOAD + id;
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
