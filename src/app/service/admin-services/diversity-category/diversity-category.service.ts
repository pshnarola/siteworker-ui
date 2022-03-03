import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from '../../../shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class DiversityCategoryService {

  constructor(private customHttpService: CustomHttpService) { }

    getDiversityList(dataTableParam: URLSearchParams): Observable<any> {
        const url = API_CONSTANTS.GET_DIVERSITY_LIST + '?' + dataTableParam;
        return this.customHttpService.get(url);
    }
    // tslint:disable-next-line: typedef
    addDiversity(diversity) {
      const url = API_CONSTANTS.ADD_DIVERSITY;
      return this.customHttpService.post(url, diversity);
  }
  // tslint:disable-next-line: typedef
     updateDiversity(diversity) {
       const url = API_CONSTANTS.UPDATE_DIVERSITY;
       return this.customHttpService.put(url, diversity);
     }
     // tslint:disable-next-line: typedef
     enableDiversity(id){
       const url = API_CONSTANTS.DIVERSITY_ENABLE + id;
       return this.customHttpService.put(url, id);
     }
     // tslint:disable-next-line: typedef
     disableDiversity(id){
      const url = API_CONSTANTS.DIVERSITY_DISABLE + id;
      return this.customHttpService.put(url, id);
    }

}
