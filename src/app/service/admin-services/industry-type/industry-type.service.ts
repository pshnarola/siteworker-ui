import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
    providedIn: 'root'
})
export class IndustryTypeService{

    constructor(private _customHttpService: CustomHttpService,private http:HttpClient) { }

    addIndustryType(industryType){
        const url = API_CONSTANTS.ADD_INDUSTRY_TYPE;
        return this._customHttpService.post(url, industryType);
    }

    getIndustryTypeList(dataTableParam: URLSearchParams): Observable<any> {
        const url = API_CONSTANTS.GET_INDUSTRY_TYPE_LIST + '?' + dataTableParam;
        return this._customHttpService.get(url);
    }

    updateIndustryType(industryType){
        const url = API_CONSTANTS.UPDATE_INDUSTRY_TYPE;
        return this._customHttpService.put(url, industryType);
    }

    disableIndustryType(id){
        const url = API_CONSTANTS.DISABLE_INDUSTRY_TYPE;
        return this._customHttpService.put(url + id, id);
    }

    enableIndustryType(id){
        const url = API_CONSTANTS.ENABLE_INDUSTRY_TYPE;
        return this._customHttpService.put(url + id, id);
    }

    uploadLogo(logo){
        console.log(logo);
        const url = API_CONSTANTS.UPLOAD_INDUSTRY_LOGO;
        const req = new HttpRequest('PUT', url, logo, {
            reportProgress: true,
            responseType: 'json'
          });
        return this.http.request(req);
    }

    getLogo(fileId: URLSearchParams) {
        const url = API_CONSTANTS.GET_INDUSTRY_LOGO + '?' + fileId;
        const req = new HttpRequest('GET', url, {
            responseType: 'blob'
          });
        return this.http.request(req);
    }
}