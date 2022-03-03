import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class GamificationConfigurationService {

  toggleGamificationSubject = new ReplaySubject(1);
  constructor(private customHttpService: CustomHttpService) { }

  getSubcontractorGamificationConfigurationList(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_SUBCONTRACTOR_GAMIFICATION + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }

  addSubcontractorGamificationConfiguration(dto) {
    const url = API_CONSTANTS.ADD_SUBCONTRACTOR_GAMIFICATION;
    return this.customHttpService.post(url, dto);
  }

  updateSubcontractorGamificationConfiguration(dto) {
    const url = API_CONSTANTS.UPDATE_SUBCONTRACTOR_GAMIFICATION;
    return this.customHttpService.put(url, dto);
  }

  getWorkerGamificationConfigurationList(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_WORKER_GAMIFICATION + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }

  addWorkerGamificationConfiguration(dto) {
    const url = API_CONSTANTS.ADD_WORKER_GAMIFICATION;
    return this.customHttpService.post(url, dto);
  }

  updateWorkerGamificationConfiguration(dto) {
    const url = API_CONSTANTS.UPDATE_WORKER_GAMIFICATION;
    return this.customHttpService.put(url, dto);
  }

  getClientGamificationConfigurationList(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_CLIENT_GAMIFICATION + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }

  addClientGamificationConfiguration(dto) {
    const url = API_CONSTANTS.ADD_CLIENT_GAMIFICATION;
    return this.customHttpService.post(url, dto);
  }

  updateClientGamificationConfiguration(dto) {
    const url = API_CONSTANTS.UPDATE_CLIENT_GAMIFICATION;
    return this.customHttpService.put(url, dto);
  }

  toggleGamification(toggle){
    const url = API_CONSTANTS.TOGGLE_GAMIFICATION + toggle;
    return this.customHttpService.put(url, toggle);
  }
  getGamificationConfiguration(){
    const url = API_CONSTANTS.GET_GAMIFICATION_TOGGLE;
    return this.customHttpService.get(url);
  }
}
