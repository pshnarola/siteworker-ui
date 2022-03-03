import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class AwardJobsiteService {

  constructor(private customHttpService: CustomHttpService) { }

  offerShortListedJobsite(jobsiteBidDetail): Observable<any> {
    const url = API_CONSTANTS.OFFER_JOBSITE;
    return this.customHttpService.put(url, jobsiteBidDetail);
  }

}
