import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class WorkerProfileDetailService {

  constructor(private customHttpService: CustomHttpService) { }

  getWorkerDetail(id: string): Observable<any> {
    const url = API_CONSTANTS.GET_WORKER_PROFILE_DETAIL + id;
    return this.customHttpService.get(url);
  }

  getAllWorkerDetail(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_ALL_WORKER_PROFILE + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }
  // tslint:disable-next-line: typedef
  updateRipplingTsheetId(workerProfileDTO){
    const url = API_CONSTANTS.UPDATE_RIPPLING_TSHEET_ID_FOR_WORKER;
    return this.customHttpService.put(url, workerProfileDTO);
  }
  getViewWorkerProfileDetailPublic(id: string): Observable<any> {
    const url = API_CONSTANTS.GET_VIEW_DETAILS_BY_USER_ID_PUBLIC + id;
    return this.customHttpService.getWithoutAuthorization(url);
  }

}
