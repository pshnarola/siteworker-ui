import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private _customHttpService: CustomHttpService) { }

  getDashboardDetailOfSubcontractor(id): Observable<any> {
    const url = API_CONSTANTS.SUBCONTRACTOR_DASHBOARD_DETAIL + id;
    return this._customHttpService.get(url);
  }

  getDashboardDetailOfWorker(id): Observable<any> {
    const url = API_CONSTANTS.WORKER_DASHBOARD_DETAIL + id;
    return this._customHttpService.get(url);
  }

  getDashboardRevenueforAdmin() {
    const url = API_CONSTANTS.DASHBOARD_REVENUE;
    return this._customHttpService.get(url);
  }

  getDashboardProjectAndJobAndJobsiteforAdmin() {
    const url = API_CONSTANTS.DASHBOARD_CHART_DETAIL_PROJECT_JOB_JOBSITE;
    return this._customHttpService.get(url);
  }
  getDashboardProjectAndJobAndJobsiteforClient(id) {
    const url = API_CONSTANTS.CLIENT_DASHBOARD_CHART_DETAIL_PROJECT_JOB_JOBSITE + id;
    return this._customHttpService.get(url);
  }

  getDashboardCloseoutforClient(id) {
    const url = API_CONSTANTS.CLIENT_DASHBOARD_CHART_DETAIL_CLOSEOUT + id;
    return this._customHttpService.get(url);
  }

}
