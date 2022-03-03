import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';


@Injectable({
    providedIn: 'root'
})
export class LoginHistoryService{

    constructor(private _customHttpService: CustomHttpService,private http: HttpClient) { }

    getLoginHistoryList(dataTableParam: URLSearchParams): Observable<any> {
        const url = API_CONSTANTS.GET_LOGIN_HISTORY + '?' + dataTableParam;
        return this._customHttpService.get(url);
    }

    getLastLoginDetailById(id){
        const url = API_CONSTANTS.GET_LAST_LOGIN_DETAIL + id;
        return this._customHttpService.get(url);
    }

    exportToExcel(dataTableParam: URLSearchParams) : Observable<any>{
        const url = API_CONSTANTS.EXPORT_TO_EXCEL_FOR_LOGIN_HISTORY + '?' + dataTableParam;
        const req = new HttpRequest('GET', url, {
            responseType: 'arraybuffer'
        });
        
        return this.http.get(url,{responseType: 'arraybuffer' });
    }  
}