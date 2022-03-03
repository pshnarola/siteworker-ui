import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class RantingAndReviewService {

  constructor(
    private _customHttpService: CustomHttpService
  ) { }

  getRatingReviewList(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_RATING_AND_REVIEW_LIST + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }

  updateRatingReview(entity) {
    const url = API_CONSTANTS.UPDATE_RATING_AND_REVIEW;
    return this._customHttpService.put(url, entity);
  }

  addRatingReview(entity) {
    const url = API_CONSTANTS.ADD_RATING_AND_REVIEW;
    return this._customHttpService.post(url, entity);
  }
  reportToAdmin(entity){
    const url = API_CONSTANTS.REPORT_TO_ADMIN;
    return this._customHttpService.put(url, entity);
  }
  acceptRatingReview(id){
    const url = API_CONSTANTS.ACCEPTED_BY_ADMIN + '/' + id;
    return this._customHttpService.put(url, '');
  }
  rejectRatingReview(id){
    const url = API_CONSTANTS.REJECTED_BY_ADMIN + '/' + id;
    return this._customHttpService.put(url, '');
  }
}
