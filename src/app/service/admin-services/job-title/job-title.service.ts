import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class JobTitleService{

    constructor(private _customHttpService: CustomHttpService, private http: HttpClient) { }

    addJobTitle(jobTitle){
        const url = API_CONSTANTS.ADD_JOB_TITLE;
        return this._customHttpService.post(url, jobTitle);
    }

    getJobTitleList(dataTableParam: URLSearchParams): Observable<any> {
        const url = API_CONSTANTS.GET_JOB_TITLE_LIST + '?' + dataTableParam;
        return this._customHttpService.get(url);
    }

    updateJobTitle(jobTitle){
        const url = API_CONSTANTS.UPDATE_JOB_TITLE;
        return this._customHttpService.put(url, jobTitle);
    }

    disableJobTitle(id){
        const url = API_CONSTANTS.DISABLE_JOB_TITLE;
        return this._customHttpService.put(url + id, id);
    }

    enableJobTitle(id){
        const url = API_CONSTANTS.ENABLE_JOB_TITLE;
        return this._customHttpService.put(url + id, id);
    }

    bulkUpload(file: File, id): Observable<HttpEvent<any>> {
        const url = API_CONSTANTS.JOB_TITLE_BULK_UPLOAD + id;
        const formData: FormData = new FormData();
        formData.append('file', file);
        const req = new HttpRequest('PUT', url, formData, {
          reportProgress: true,
          responseType: 'json'
        });
        return this.http.request(req);
      }

      downloadFile(fileName: string): Observable<Blob> {
        const url = API_CONSTANTS.SAMPLE_FILE_PATH + fileName;
        return this.http.get(url, {
          responseType: 'blob'
        });
      }

}