import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectComparisonService {

  constructor(private _customHttpService: CustomHttpService) { }

  getProjectBidComparisonData(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_BID_FOR_PROJECT_DATA + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }

  getJobsiteBidComparisonData(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_BID_FOR_JOBSITE_DATA + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }

  getLineItemBidComparisonData(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_BID_FOR_LINE_ITEM_DATA + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }


}
