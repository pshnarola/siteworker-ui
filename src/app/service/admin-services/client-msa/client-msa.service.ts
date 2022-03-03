import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class ClientMsaService {


  constructor(private customHttpService: CustomHttpService, private http: HttpClient) { }

  getClientMSAList(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_CLIENT_MSA + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }

  addClientMSA(client) {
    const url = API_CONSTANTS.ADD_CLIENT_MSA;
    return this.customHttpService.post(url, client);
  }

  updateClientMSA(client) {
    const url = API_CONSTANTS.UPDATE_CLIENT_MSA;
    return this.customHttpService.put(url, client);
  }

  onActive(id) {
    const url = API_CONSTANTS.ACTIVATE_CLIENT_MSA + id;
    return this.customHttpService.put(url, id);
  }

}
