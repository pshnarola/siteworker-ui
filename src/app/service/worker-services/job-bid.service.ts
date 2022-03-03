import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class JobBidService {

  constructor(private customHttpService: CustomHttpService) { }
  markAsFavourite(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.MARK_AS_FAVOURITE + '?' + dataTableParam;
    return this.customHttpService.put(url, '');
  }
  checkJobIsFavourite(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.CHECK_IS_FAVOURITE + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }
  startBidding(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.START_BIDDING + '?' + dataTableParam;
    return this.customHttpService.put(url, '');
  }
  getCertificates(id): Observable<any>{
    const url = API_CONSTANTS.GET_CERTIFICATES + '/' + id + '/';
    return this.customHttpService.get(url);
  }
  getScreeningQuestions(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_SCREENING_QUESTIONS + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }
  applyJob(jobBidDetail): Observable<any>{
    const url = API_CONSTANTS.APPLY_JOB;
    return this.customHttpService.put(url, jobBidDetail);
  }
  getJobBidDetail(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_JOB_BID_DETAIL + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }
  getAllJobBidDetail(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_JOB_BID_DETAIL_VIEW_ALL + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }
  getJobBidCertificate(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_JOB_BID_CERTIFICATE + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }
  getJobBidScreeningQuestions(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_JOB_BID_SCREENING_QUESTIONS + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }
  offerJob(jobBidDetail): Observable<any>{
    const url = API_CONSTANTS.OFFER_JOB;
    return this.customHttpService.put(url, jobBidDetail);
  }
  getJobBidDetailByJobAndWorker(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_DETAIL_BY_JOB_AND_WORKER + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }
  acceptJob(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.ACCEPT_JOB + '?' + dataTableParam;
    return this.customHttpService.put(url, '');
  }
  rejectJob(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.REJECT_JOB + '?' + dataTableParam;
    return this.customHttpService.put(url, '');
  }
}
