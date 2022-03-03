import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { API_CONSTANTS } from '../shared/ApiConstants';
import { CustomHttpService } from './customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class ChatMessageServiceService {

  public unreadMessagesCount = new BehaviorSubject<number>(0);


  constructor(private customHttpService: CustomHttpService) { }
  // tslint:disable-next-line: typedef

  create(chatMessage) {
    const url = API_CONSTANTS.CREATE_CHAT_MESSAGE;
    return this.customHttpService.post(url, chatMessage);
  }

  getChat(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_CHAT_MESSAGE + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }

  getListOfUserByJob(id): Observable<any> {
    const url = API_CONSTANTS.GET_USERS_BY_JOB_FOR_MESSAGE + '?jobId=' + id;
    return this.customHttpService.get(url);
  }

  getListOfUserByJobsite(jId, pId): Observable<any> {
    const url = API_CONSTANTS.GET_USERS_BY_JOBSITE_FOR_MESSAGE + '?jobSiteId=' + jId + '&projectId=' + pId;
    return this.customHttpService.get(url);
  }

  getListOfUserByProject(id): Observable<any> {
    const url = API_CONSTANTS.GET_USERS_BY_PROJECT_FOR_MESSAGE + '?projectId=' + id;
    return this.customHttpService.get(url);
  }

  getUnreadMessageCount(id): Observable<any> {
    const url = API_CONSTANTS.GET_UNREAD_MESSAGE_COUNT;
    return this.customHttpService.get(url + id);
  }

  markNotificationAsSeenByUserId(userId, projectId?, jobsiteId?, jobId?): Observable<any> {
    const url = API_CONSTANTS.MESSAGE_MARK_AS_SEEN + userId + '/' + projectId + '/' + jobsiteId + '/' + jobId;
    return this.customHttpService.put(url, '');
  }

  markNotificationAsSeenByUserId1(userId, projectId): Observable<any> {
    const url = API_CONSTANTS.MESSAGE_MARK_AS_SEEN1 + userId + '/' + projectId;
    return this.customHttpService.put(url, '');
  }

  markNotificationAsSeenByUserId2(userId, jobsiteId?): Observable<any> {
    const url = API_CONSTANTS.MESSAGE_MARK_AS_SEEN2 + userId + '/' + jobsiteId;
    return this.customHttpService.put(url, '');
  }

  markNotificationAsSeenByUserId3(userId, jobId?): Observable<any> {
    const url = API_CONSTANTS.MESSAGE_MARK_AS_SEEN3 + userId + '/' + jobId;
    return this.customHttpService.put(url, '');
  }

}
