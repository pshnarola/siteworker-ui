import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectDetailService {

  constructor(private customHttpService: CustomHttpService, private http: HttpClient) { }

  subject = new Subject<any>();
  cancelledAndCompletedProjectSubject = new Subject<any>();
  getProjectByUserId(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_PROJECT_BY_USER_ID + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }

  getProjectByUserIdForSidebar(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_PROJECT_BY_USER_ID_FOR_SIDEBAR + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }

  getProjectForSubContractor(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_PROJECT_FOR_SUBCONTRACTOR + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }

  setStatus(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.SET_STATUS_OF_PROJECT + '?' + dataTableParam;
    return this.customHttpService.put(url, '');
  }

  setStatusOfJobsite(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.SET_STATUS_OF_JOBSITE + '?' + dataTableParam;
    return this.customHttpService.put(url, '');
  }

  getAllProject(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_PROJECT_BY_USER_ID + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }

  getAllProjectsByMatchMaking(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_PROJECT_BY_MATCH_MAKING + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }

  getAllProjectInvitee(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.PROJECT_INVITEE + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }

  getProjectBidAmount(id: string): Observable<any> {
    const url = API_CONSTANTS.GET_PROJECT_BID_AMOUNT + id;
    return this.customHttpService.get(url);
  }

  getProjectById(projectId: string): Observable<any> {
    const url = API_CONSTANTS.GET_PROJECT_BY_ID + projectId;
    return this.customHttpService.get(url);
  }

  getProjectByProjectId(projectId: string): Observable<any> {
    const url = API_CONSTANTS.GET_PROJECT_BY_PROJECT_ID + projectId;
    return this.customHttpService.get(url);
  }

  getProjectSubmitRatingReviewList(dataTableParam: URLSearchParams, id): Observable<any> {
    const url = API_CONSTANTS.GET_SUBMIT_RATING_REVIEW_LIST + id + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }
  getJobsiteSubmitRatingReviewList(dataTableParam: URLSearchParams, id): Observable<any> {
    const url = API_CONSTANTS.GET_JOBSITE_SUBMIT_RATING_REVIEW_LIST + id + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }

  getJobSubmitRatingReviewList(dataTableParam: URLSearchParams, id): Observable<any> {
    const url = API_CONSTANTS.GET_JOB_SUBMIT_RATING_REVIEW_LIST + id + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }
  assignSupervisor(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.ASSIGN_PROJECT_SUPERVISOR + '?' + dataTableParam;
    return this.customHttpService.put(url, '');
  }
  assignSupervisorToJobsite(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.ASSIGN_JOBSITE_SUPERVISOR + '?' + dataTableParam;
    return this.customHttpService.put(url, '');
  }

  // tslint:disable-next-line: typedef
  downloadJobsiteAttachments(id) {
    const url = API_CONSTANTS.DOWNLOAD_JOBSITE_ATTACHMNET_ZIP_FILE + id;
    const req = new HttpRequest('GET', url, {
      responseType: 'arraybuffer'
    });
    return this.http.get(url, { responseType: 'arraybuffer' });
  }
  downloadProjectAttachments(id) {
    const url = API_CONSTANTS.DOWNLOAD_PROJECT_ATTACHMNET_ZIP_FILE + id;
    const req = new HttpRequest('GET', url, {
      responseType: 'arraybuffer'
    });
    return this.http.get(url, { responseType: 'arraybuffer' });
  }
  getJobSubmitRatingReviewListByUserId(userId): Observable<any> {
    const url = API_CONSTANTS.GET_RAR_BY_USERID + userId;
    return this.customHttpService.get(url);
  }
  getJobSubmitRatingReviewListByUserIdAndJobId(userId, jobId): Observable<any> {
    const url = API_CONSTANTS.GET_RAR_BY_USERID_AND_JOB_ID + userId + '/' + jobId;
    return this.customHttpService.get(url);
  }
  getJobSubmitRatingReviewListByUserIdForWorker(userId): Observable<any> {
    const url = API_CONSTANTS.GET_RAR_BY_USERID_FOR_WORKER + userId;
    return this.customHttpService.get(url);
  }
  getJobSubmitRatingReviewListByUserIdAndJobIdForWorker(userId, jobId): Observable<any> {
    const url = API_CONSTANTS.GET_RAR_BY_USERID_AND_JOB_ID_FOR_WORKER + userId + '/' + jobId;
    return this.customHttpService.get(url);
  }
  getJobsiteSubmitRatingReviewListByUserId(userId): Observable<any> {
    const url = API_CONSTANTS.GET_JOBSITE_RAR_BY_USERID + userId;
    return this.customHttpService.get(url);
  }
  getJobsiteSubmitRatingReviewListByUserIdAndProjectId(userId, projectId): Observable<any> {
    const url = API_CONSTANTS.GET_RAR_BY_USERID_AND_PROJECT_ID + userId + '/' + projectId;
    return this.customHttpService.get(url);
  }
  getJobsiteSubmitRatingReviewListByUserIdAndJobsiteId(userId, jobsiteId, projectId): Observable<any> {
    const url = API_CONSTANTS.GET_RAR_BY_USERID_AND_JOBSITE_ID + userId + '/' + jobsiteId + '/' + projectId;
    return this.customHttpService.get(url);
  }
  getJobsiteSubmitRatingReviewListForSubcontractor(userId): Observable<any> {
    const url = API_CONSTANTS.GET_RAR_FOR_SUBCONTRACTOR + userId;
    return this.customHttpService.get(url);
  }
  getJobsiteSubmitRatingReviewListByProjectIdForSubcontractor(userId, projectId): Observable<any> {
    const url = API_CONSTANTS.GET_RAR_FOR_SUBCONTRACTOR_BY_PROJECT_ID + userId + '/' + projectId;
    return this.customHttpService.get(url);
  }
  getJobsiteSubmitRatingReviewListForSubcontractorByJobsiteId(jobsiteId, userId, projectId): Observable<any> {
    const url = API_CONSTANTS.GET_RAR_FOR_SUBCONTRACTOR_BY_JOBSITE_ID + jobsiteId + '/' + userId + '/' + projectId;
    return this.customHttpService.get(url);
  }

  getProjectByProjectIdForPublicURL(projectId): Observable<any> {
    const url = API_CONSTANTS.PUBLIC_GET_PROJECT_BY_PROJECT_ID + projectId;
    return this.customHttpService.getWithoutAuthorization(url);
  }

  setUpdatedDateForProject(id: string): Observable<any> {
    const url = API_CONSTANTS.UPDATE_UPDATED_DATE + '?id=' + id;
    return this.customHttpService.put(url, '');
  }


}
