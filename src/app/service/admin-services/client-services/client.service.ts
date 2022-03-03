import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from '../../../shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(private _customHttpService: CustomHttpService) { }

    getClientList(dataTableParam: URLSearchParams): Observable<any> {
        const url = API_CONSTANTS.GET_CLIENT_LIST + '?' + dataTableParam;
        return this._customHttpService.get(url);
    }
    // tslint:disable-next-line: typedef
    addClient(client){
      const url = API_CONSTANTS.ADD_CLIENT;
      return this._customHttpService.post(url, client);
    }
    // tslint:disable-next-line: typedef
     updateClient(client) {
       const url = API_CONSTANTS.UPDATE_CLIENT;
       return this._customHttpService.put(url, client);
     }
}
