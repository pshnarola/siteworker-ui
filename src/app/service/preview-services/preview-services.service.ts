import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class PreviewServicesService {

  constructor(private _customHttpService: CustomHttpService) { }

  getWorkerDetail(id: string): Observable<any> {
    const url = API_CONSTANTS.GET_WORKER_PROFILE_DETAIL + id;
    return this._customHttpService.get(url);
  }

  getProfileForPrivateOrPublic(clientId, workerId): Observable<any> {
    const url = API_CONSTANTS.GET_WORKER_PROFILE_FOR_PRIVATE_OR_PUBLIC + clientId + '/' + workerId;
    return this._customHttpService.get(url);
  }

}
