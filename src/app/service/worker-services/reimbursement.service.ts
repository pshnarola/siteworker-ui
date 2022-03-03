import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class ReimbursementService {

  constructor(private customHttpService: CustomHttpService,
              private http: HttpClient) { }
  // tslint:disable-next-line: typedef
  addReimbursement(reimbursement){
    const url = API_CONSTANTS.ADD_REIMBURSEMENT;
    return this.customHttpService.post(url, reimbursement);
  }
  getReimbursementList(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_REIMBURSEMENT + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }
   // tslint:disable-next-line: typedef
  updateReimbursement(reimbursement) {
    const url = API_CONSTANTS.UPDATE_REIMBURSEMENT;
    return this.customHttpService.put(url, reimbursement);
  }
  // tslint:disable-next-line: typedef
  downloadReimbursementAttachments(id){
    const url = API_CONSTANTS.DOWNLOAD_REIMBURSEMENT_ATTACHMNET_ZIP_FILE + id ;
    const req = new HttpRequest('GET', url, {
      responseType: 'arraybuffer'
    });
    return this.http.get(url, { responseType: 'arraybuffer' });
  }
  // tslint:disable-next-line: typedef
  deleteReimbursement(id) {
    const url = API_CONSTANTS.DELETE_REIMBURSEMENT + id;
    return this.customHttpService.delete(url);
  }
  getAttachments(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_REIMBURSEMENT_ATTACHMENT + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }
  deleteAttachment(id){
    const url = API_CONSTANTS.DELETE_REIMBURSEMENT_ATTACHMENT + id;
    return this.customHttpService.delete(url);
  }
}
