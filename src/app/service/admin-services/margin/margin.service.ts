import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class MarginService {

  constructor(private _customHttpService: CustomHttpService, private http: HttpClient) { }

  setMarginOfSubconrtactor(subcontractorProfile){
    const url = API_CONSTANTS.UPDATE_MARGIN;
    return this._customHttpService.put(url, subcontractorProfile);
  }

  setRiplingIdOfSubconrtactor(subcontractorProfile){
    const url = API_CONSTANTS.UPDATE_RIPLING_ID;
    return this._customHttpService.put(url, subcontractorProfile);
  }
  
  getMarginDataForProjectOrJobsite(id){
    const url = API_CONSTANTS.GET_MARGIN_DATA_FOR_PROJECT + id;
    return this._customHttpService.get(url);
  }

  updateMarginForProjectOrJobsite(marginDetail){
    const url = API_CONSTANTS.UPDATE_PROJECT_MARGIN;
    return this._customHttpService.put(url, marginDetail);
  }
}
