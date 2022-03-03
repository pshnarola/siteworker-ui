import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
    providedIn: 'root'
})
export class SupervisorService {

    public supervisorIdTransfer = new BehaviorSubject(null);

    constructor(private _customHttpService: CustomHttpService){}

    addSupervisor(supervisorDetails){
        const url = API_CONSTANTS.ADD_USER;
        return this._customHttpService.post(url, supervisorDetails);
    }

    getSupervisorList(dataTableParam: URLSearchParams): Observable<any> {
        const url = API_CONSTANTS.GET_SUPERVISOR_LIST + '?' + dataTableParam;
        return this._customHttpService.get(url);
    }

    updateSupervisor(supervisor){
        const url = API_CONSTANTS.UPDATE_SUPERVISOR;
        return this._customHttpService.put(url, supervisor);
    }

    activeSupervisor(id){
        const url = API_CONSTANTS.ACTIVE_SUPERVISOR;
        return this._customHttpService.put(url + id, id);
    }

    inactiveSupervisor(id){
        const url = API_CONSTANTS.INACTIVE_SUPERVISOR;
        return this._customHttpService.put(url + id, id);
    }

    getSupervisorProfileSupervisor(id){
        const url = API_CONSTANTS.GET_PROJECT_BY_ID + id;
    return this._customHttpService.get(url);
    }



    getSupervisorProfileDetailById(id){
        const url = API_CONSTANTS.GET_SUPERVISOR_PROFILE_BY_SUPERVISOR_ID + id;
        return this._customHttpService.get(url);
    }
}