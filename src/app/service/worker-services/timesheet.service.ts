import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {

  constructor(private customHttpService: CustomHttpService ,private http : HttpClient) { }
  getTimesheetList(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_TIMESHEET + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }

  getTimesheetListByClientId(id): Observable<any> {
    const url = API_CONSTANTS.GET_PENDING_TIMESHEET_BY_CLIENT_ID + id;
    return this.customHttpService.get(url);
  }

    // tslint:disable-next-line: typedef
    rejectTimesheet(approveRejectDTO){
      const url = API_CONSTANTS.REJECT_TIMESHEET;
      return this.customHttpService.put(url, approveRejectDTO);
    }
    // tslint:disable-next-line: typedef
    approveTimesheet(approveRejectDTO){
      const url = API_CONSTANTS.APPROVE_TIMESHEET;
      return this.customHttpService.put(url, approveRejectDTO);
    }

    getApprovedAndRejectedTimesheetByWorkerId(id): Observable<any> {
      const url = API_CONSTANTS.GET_PENDING_AND_APPROVED_TIMESHEET_BY_WORKER_ID + id;
      return this.customHttpService.get(url);
    }

    downloadInvoice(dataTableParam: URLSearchParams): Observable<any> {
      const url = API_CONSTANTS.DOWNLOAD_WORKER_INVOICE + '?' + dataTableParam;
      const req = new HttpRequest('GET', url, {
        responseType: 'arraybuffer'
      });
      return this.http.get(url, { responseType: 'arraybuffer' });
    }
}
