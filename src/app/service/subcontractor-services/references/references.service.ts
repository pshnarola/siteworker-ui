import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class ReferencesService {

  constructor(private _customHttpService: CustomHttpService, private http: HttpClient
    , private _formBuilder: FormBuilder,) { }


    getReferenceList(dataTableParam: URLSearchParams): Observable<any> {
      const url = API_CONSTANTS.GET_REFERENCE + '?' + dataTableParam;
      return this._customHttpService.get(url);
    }
  
    addReference(reference) {
      const url = API_CONSTANTS.ADD_REFERENCE;
      return this._customHttpService.post(url, reference);
    }

    getWorkerReferenceList(dataTableParam: URLSearchParams): Observable<any> {
      const url = API_CONSTANTS.GET_WORKER_REFERENCE + '?' + dataTableParam;
      return this._customHttpService.get(url);
    }
  
    addWorkerReference(reference) {
      const url = API_CONSTANTS.ADD_WORKER_REFERENCE;
      return this._customHttpService.post(url, reference);
    }
    
}
