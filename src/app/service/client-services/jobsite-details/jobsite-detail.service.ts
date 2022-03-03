import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { API_CONSTANTS } from "src/app/shared/ApiConstants";
import { CustomHttpService } from "../../customHttp.service";

@Injectable({
    providedIn: 'root'
})
export class JobsiteDetailService {

    constructor(private _customHttpService: CustomHttpService){}

    getJobsiteDetailList(dataTableParam: URLSearchParams): Observable<any> {
        const url = API_CONSTANTS.GET_JOBSITE_LIST + '?' + dataTableParam;
        return this._customHttpService.get(url);
    }

    getJobsiteDetailById(id): Observable<any> {
        const url = API_CONSTANTS.GET_JOBSITE_BY_ID + id;
        return this._customHttpService.get(url);
    }

}