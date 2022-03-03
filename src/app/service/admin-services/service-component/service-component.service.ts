import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from '../../../shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceComponentService {
  constructor(private customHttpService: CustomHttpService, private http: HttpClient) { }

  getServiceList(dataTableParam: URLSearchParams): Observable<any> {
      const url = API_CONSTANTS.GET_SERVICE_LIST + '?' + dataTableParam;
      return this.customHttpService.get(url);
  }
  
  // tslint:disable-next-line: typedef
  addService(service) {
    const url = API_CONSTANTS.ADD_SERVICE;
    return this.customHttpService.post(url, service);
}
  // tslint:disable-next-line: typedef  
updateService(service) {
     const url = API_CONSTANTS.UPDATE_SERVICE;
     return this.customHttpService.put(url, service);
   }
  // tslint:disable-next-line: typedef
   enableService(id){
     const url = API_CONSTANTS.SERVICE_ENABLE + id;
     return this.customHttpService.put(url, id);
   }
  // tslint:disable-next-line: typedef
   disableService(id){
    const url = API_CONSTANTS.SERVICE_DISABLE + id;
    return this.customHttpService.put(url, id);
  }
  bulkUpload(file: File, id): Observable<HttpEvent<any>> {
    const url = API_CONSTANTS.BULK_UPLOAD_SERVICE + id;
    const formData: FormData = new FormData();

    formData.append('file', file);

    const req = new HttpRequest('PUT', url, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);

}
}
