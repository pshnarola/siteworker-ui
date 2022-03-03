import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class ApproveClientService {

  constructor(private customHttpService: CustomHttpService, private http: HttpClient) { }

  getApproveClientList(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_APPROVE_CLIENT + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }

  addApproveClient(client) {
    const url = API_CONSTANTS.ADD_APPROVE_CLIENT;
    return this.customHttpService.post(url, client);
  }

  updateApproveClient(client) {
    const url = API_CONSTANTS.UPDATE_APPROVE_CLIENT;
    return this.customHttpService.put(url, client);
  }

  getApproveClientDetailByClientId(id: any): Observable<any> {
    const url = API_CONSTANTS.GET_APPROVE_CLIENT_BY_CLIENT_ID + id;
    return this.customHttpService.get(url);
  }

  deleteApproveClientAttachment(id) {
    const url = API_CONSTANTS.DELETE_APPROVE_CLIENT_ATTACHMENT + id;
    return this.customHttpService.delete(url);
  }

  getApproveClientAttachmentList(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_APPROVE_CLIENT_ATTACHMENT + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }

  downloadApproveClientAttachments(id) {
    const url = API_CONSTANTS.DOWNLOAD_APPROVE_CLIENT_ATTACHMENTS + id;
    const req = new HttpRequest('GET', url, {
      responseType: 'arraybuffer'
    });
    return this.http.get(url, { responseType: 'arraybuffer' });
  }

}
