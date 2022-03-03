import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';


@Injectable({
    providedIn: 'root'
})
export class IcJobTypeService{

    constructor(private _customHttpService: CustomHttpService) { }

    getIcJobTitleList(dataTableParam: URLSearchParams): Observable<any> {
        const url = API_CONSTANTS.GET_IC_JOB_TITLE_LIST + '?' + dataTableParam;
        return this._customHttpService.get(url);
    }

    disapprove(id){
        const url = API_CONSTANTS.DISAPPROVE_IC_JOB_TITLE_LIST;
        return this._customHttpService.put(url + id, id);
    }

    approve(id){
        const url = API_CONSTANTS.APPROVE_IC_JOB_TITLE_LIST;
        return this._customHttpService.put(url + id, id);
    }
}