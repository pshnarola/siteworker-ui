import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class WorkExpAndEducationService {

  constructor(private _customHttpService: CustomHttpService, private http: HttpClient
    , private _formBuilder: FormBuilder,) { }

  // getAllWorkerExpDetail(dataTableParam: URLSearchParams): Observable<any> {
  //   const url = API_CONSTANTS.GET_WORKER_PROFILE + '?' + dataTableParam;
  //   return this._customHttpService.get(url);
  // }

  getAllWorkerExpDetailByUserId(id): Observable<any> {
    const url = API_CONSTANTS.GET_WORKER_EXP_DISPLAY_DETAIL + id;
    return this._customHttpService.get(url);
  }

  updateWorkerExp(Worker) {
    const url = API_CONSTANTS.UPDATE_WORKER_EXP;
    return this._customHttpService.put(url, Worker);
  }

  addWorkerExp(Worker) {
    const url = API_CONSTANTS.ADD_WORKER_EXP;
    return this._customHttpService.post(url, Worker);
  }



  // getAllEducationDetail(dataTableParam: URLSearchParams): Observable<any> {
  //   const url = API_CONSTANTS.GET_WORKER_PROFILE + '?' + dataTableParam;
  //   return this._customHttpService.get(url);
  // }

  getAllEducationDetailByUserId(id): Observable<any> {
    const url = API_CONSTANTS.GET_WORKER_EDUCATION_DISPLAY_DETAIL + id;
    return this._customHttpService.get(url);
  }

  updateEducation(Worker) {
    const url = API_CONSTANTS.UPDATE_WORKER_EDUCATION;
    return this._customHttpService.put(url, Worker);
  }

  addEducation(Worker) {
    const url = API_CONSTANTS.ADD_WORKER_EDUCATION;
    return this._customHttpService.post(url, Worker);
  }
}
