import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { API_CONSTANTS } from '../shared/ApiConstants';
import { CustomHttpService } from './customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class BellNotificationService {


  public msgNumber = new BehaviorSubject<number>(0);

  constructor(private _customHttpService: CustomHttpService) { }

  getBellNotification(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_BELL_NOTIFICATION + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }

  markNotificationAsSeenByUserId(id): Observable<any> {
    const url = API_CONSTANTS.MARK_AS_SEEN;
    return this._customHttpService.put(url + id, id);
  }

  getUnreadNotificationCount(id): Observable<any>{
    const url = API_CONSTANTS.GET_UNREAD_NOTIFICATION_COUNT;
    return this._customHttpService.get(url + id);
  }


}
