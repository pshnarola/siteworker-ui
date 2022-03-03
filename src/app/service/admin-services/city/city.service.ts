import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class CityService {

  constructor(private _customHttpService: CustomHttpService, private http: HttpClient) { }

  getCityList(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_CITY + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }

  //load master data for city
  getCityListForMaster(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_CITY_FOR_MASTER + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }

  addCity(city) {
    const url = API_CONSTANTS.ADD_CITY;
    return this._customHttpService.post(url, city);
  }

  updateCity(city) {
    const url = API_CONSTANTS.UPDATE_CITY;
    return this._customHttpService.put(url, city);
  }

  enableCity(id: string): Observable<any> {
    const url = API_CONSTANTS.ENABLE_CITY + id;
    return this._customHttpService.put(url, id);
  }

  disableCity(id: string): Observable<any> {
    const url = API_CONSTANTS.DISABLE_CITY + id;
    return this._customHttpService.put(url, id);
  }

  bulkUpload(file: File, id): Observable<HttpEvent<any>> {
    const url = API_CONSTANTS.BULK_UPLOAD_CITY + id;
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
