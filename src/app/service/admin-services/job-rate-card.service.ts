import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class JobRateCardService {

  constructor(private customHttpService: CustomHttpService, private http: HttpClient) { }

  getJobRateCardList(dataTableParam: URLSearchParams): Observable<any> {
      const url = API_CONSTANTS.GET_JOB_RATE_CARD + '?' + dataTableParam;
      return this.customHttpService.get(url);
  }
  // tslint:disable-next-line: typedef
  generateJobRateCard(jobRateCard){
    const url = API_CONSTANTS.GENERATE_JOB_RATE_CARD;
    return this.customHttpService.post(url, jobRateCard);
  }
  // tslint:disable-next-line: typedef
  enableJobRateCard(enableDisableJobRateCard){
    const url = API_CONSTANTS.ENABLE_JOB_RATE_CARD;
    return this.customHttpService.put(url, enableDisableJobRateCard);
  }
   // tslint:disable-next-line: typedef
   disableJobRateCard(enableDisableJobRateCard){
    const url = API_CONSTANTS.DISABLE_JOB_RATE_CARD;
    return this.customHttpService.put(url, enableDisableJobRateCard);
  }
  bulkUpload(file, fileParams): Observable<HttpEvent<any>> {
    const url = API_CONSTANTS.BULK_UPLOAD_JOB_RATE_CARD + '?' + fileParams;
    const formData: FormData = new FormData();

    formData.append('file', file);
    const req = new HttpRequest('PUT', url, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }
  getJobRateCardConfiguration(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_JOB_RATE_CARD_CONFIGURATION + '?' + dataTableParam;
    return this.customHttpService.get(url);
}
}
