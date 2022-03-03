import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class ChangeRequestService {

  constructor(private _customHttpService: CustomHttpService, private http: HttpClient) { }

  getChangeRequestList(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_CHANGE_REQUEST + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }

  getChangeRequestAttachmentList(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_CHANGE_REQUEST_ATTACHMENT + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }

  addChangeRequest(changeRequest) {
    const url = API_CONSTANTS.ADD_CHANGE_REQUEST;
    return this._customHttpService.post(url, changeRequest);
  }

  updateChangeRequest(changeRequest) {
    const url = API_CONSTANTS.UPDATE_CHANGE_REQUEST;
    return this._customHttpService.put(url, changeRequest);
  }

  deleteChangeRequest(id) {
    const url = API_CONSTANTS.DELETE_CHANGE_REQUEST + id;
    return this._customHttpService.delete(url);
  }
  approveChangeRequest(id , isfromClient) {
    const url = API_CONSTANTS.APPROVE_CHANGE_REQUEST + isfromClient;
    return this._customHttpService.put(url, id);
  }
  rejectChangeRequest(id) {
    const url = API_CONSTANTS.REJECT_CHANGE_REQUEST;
    return this._customHttpService.put(url, id);
  }

  downloadChangRequestAttachments(id) {
    const url = API_CONSTANTS.DOWNLOAD_CHANGE_REQUEST_ATTACHMENTS + id;
    const req = new HttpRequest('GET', url, {
      responseType: 'arraybuffer'
    });
    return this.http.get(url, { responseType: 'arraybuffer' });
  }

}
