import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class MarkAsFavouriteService {

  constructor(
    private customHttpService: CustomHttpService,
    private http: HttpClient) { }

  AddMarkAsFavourite(dto) {
    const url = API_CONSTANTS.ADD_MARK_AS_FAVOURITE_PROJECT;
    return this.customHttpService.post(url, dto);
  }

  UpdateMarkAsFavourite(dto) {
    const url = API_CONSTANTS.UPDATE_MARK_AS_FAVOURITE_PROJECT;
    return this.customHttpService.put(url, dto);
  }

  checkProjectsIsFavourite(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_MARK_AS_FAVOURITE_PROJECT + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }

}
