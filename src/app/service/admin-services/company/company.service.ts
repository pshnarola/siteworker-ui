import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from '../../../shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  constructor(private customHttpService: CustomHttpService) { }

  getCompanyList(dataTableParam: URLSearchParams): Observable<any> {
      const url = API_CONSTANTS.GET_COMPANY_LIST + '?' + dataTableParam;
      return this.customHttpService.get(url);
  }
  getCustomCompanyList(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_ALL_CUSTOM_COMPANY + '?' + dataTableParam;
    return this.customHttpService.get(url);
}
  // tslint:disable-next-line: typedef
  addCompany(service) {
    const url = API_CONSTANTS.ADD_COMPANY;
    return this.customHttpService.post(url, service);
}
 // tslint:disable-next-line: typedef
  updateCompany(company) {
     const url = API_CONSTANTS.UPDATE_COMPANY;
     return this.customHttpService.put(url, company);
   }
    // tslint:disable-next-line: typedef
   enableCompany(id){
     const url = API_CONSTANTS.COMPANY_ENABLE + id;
     return this.customHttpService.put(url, id);
   }

   // assign company
   assignCompany(data){
    const url = API_CONSTANTS.ASSIGNCOMPANY;
    return this.customHttpService.put(url, data);
   }
    // tslint:disable-next-line: typedef
   disableCompany(id){
    const url = API_CONSTANTS.COMPANY_DISABLE + id;
    return this.customHttpService.put(url, id);
  }
   // tslint:disable-next-line: typedef
  mergeCompany(company) {
    const url = API_CONSTANTS.MERGE_COMPANY;
    return this.customHttpService.put(url, company);
  }
}
