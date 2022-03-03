import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class AwardProjectService {

  constructor(private customHttpService: CustomHttpService) { }

  checkProjectIsAllowToAward(projectId): Observable<any> {
    const url = API_CONSTANTS.GET_PROJECT_BID_DETAIL_TO_AWARD + '?projectId=' + projectId;
    return this.customHttpService.get(url);
  }

  getPoDetailToAward(projectId): Observable<any> {
    const url = API_CONSTANTS.GET_PO_DETAIL_TO_AWARD + '?projectId=' + projectId;
    return this.customHttpService.get(url);
  }

  addPoDetailToAward(projectId): Observable<any> {
    const url = API_CONSTANTS.ADD_PO_DETAIL_TO_AWARD;
    return this.customHttpService.post(url, projectId);
  }

  offerProject(projectBidDetail): Observable<any> {
    const url = API_CONSTANTS.OFFER_PROJECT;
    return this.customHttpService.put(url, projectBidDetail);
  }


  getPaymentMileStoneList(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_PAYMENT_MILESTONE_BID_DETAIL_BY_JOBSITE_ID + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }




}
