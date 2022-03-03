import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from '../../../shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
    providedIn: 'root'
})
export class ExperienceLevelService{

    constructor(private _customHttpService: CustomHttpService) { }

    addExperienceLevel(experience){
        const url = API_CONSTANTS.ADD_EXPERIENCE_LEVEL;
        return this._customHttpService.post(url, experience);
    }

    getExperienceLevelList(dataTableParam: URLSearchParams): Observable<any> {
        const url = API_CONSTANTS.GET_EXPERIENCE_LEVEL_LIST + '?' + dataTableParam;
        return this._customHttpService.get(url);
    }

    updateExperienceLevel(experience){
        const url = API_CONSTANTS.UPDATE_EXPERIENCE_LEVEL;
        return this._customHttpService.put(url, experience);
    }

    disableExperienceLevel(id){
        const url = API_CONSTANTS.DISABLE_EXPERIENCE_LEVEL;
        return this._customHttpService.put(url + id, id);
    }

    enableExperienceLevel(id){
        const url = API_CONSTANTS.ENABLE_EXPERIENCE_LEVEL;
        return this._customHttpService.put(url + id, id);
    }
}