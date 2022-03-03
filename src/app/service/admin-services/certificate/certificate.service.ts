import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from '../../../shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {

  constructor(private _customHttpService: CustomHttpService) { }

    getCertificateList(dataTableParam: URLSearchParams): Observable<any> {
        const url = API_CONSTANTS.GET_CERTIFICATE_LIST + '?' + dataTableParam;
        return this._customHttpService.get(url);
    }
    // tslint:disable-next-line: typedef
    addCertificate(certificate){
      const url = API_CONSTANTS.ADD_CERTIFICATE;
      return this._customHttpService.post(url, certificate);
    }
    // tslint:disable-next-line: typedef
     updateCertificate(certificate) {
       const url = API_CONSTANTS.UPDATE_CERTIFICATE;
       return this._customHttpService.put(url, certificate);
     }
    // tslint:disable-next-line: typedef
     enableCertificate(id){
       const url = API_CONSTANTS.CERTIFICATE_ENABLE + id;
       return this._customHttpService.put(url, id);
     }
    // tslint:disable-next-line: typedef
     disableCertificate(id){
      const url = API_CONSTANTS.CERTIFICATE_DISABLE + id;
      return this._customHttpService.put(url, id);
    }

}
