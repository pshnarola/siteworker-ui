import { Injectable } from '@angular/core';
// import { map } from 'jquery';
import { from, Observable, ReplaySubject, Subject } from 'rxjs';
import { map, publishReplay, refCount } from 'rxjs/operators';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { State } from 'src/app/shared/vo/state/state';
import { CityService } from '../admin-services/city/city.service';
import { DiversityCategoryService } from '../admin-services/diversity-category/diversity-category.service';
import { IndustryTypeService } from '../admin-services/industry-type/industry-type.service';
import { NoOfEmployeesService } from '../admin-services/no-of-employees/no-of-employees.service';
import { ServiceComponentService } from '../admin-services/service-component/service-component.service';
import { StateService } from '../admin-services/state/state.service';
import { LocalStorageService } from '../localstorage.service';

@Injectable({
  providedIn: 'root'
})
export class UpdatedService {
  queryParam: URLSearchParams;
  isStateLoaded: boolean = false;

  datatableParam: DataTableParam = {
    offset: 0,
    size: 100000,
    sortField: 'CREATED_DATE',
    sortOrder: 0,
    searchText: null
  };
  // stateList = new ReplaySubject<State[]>();
  stateList = new Observable<State[]>();
  data: State[];


  constructor(
    private _stateService: StateService,
    private _cityService: CityService,
    private _noOfEmployees: NoOfEmployeesService,
    private _industryTypeService: IndustryTypeService,
    private _diversityCategoryService: DiversityCategoryService,
    private _service: ServiceComponentService,
    private _local: LocalStorageService,
  ) { }

  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  getAllData(type): Observable<State[]> {

    this.isStateLoaded = this._local.getItem('key');
    console.log('key', this.isStateLoaded)
    this.queryParam = this.prepareQueryParam(this.datatableParam);

    switch (type) {
      case "State":
        if (!this.isStateLoaded) {
          this.stateList = from(this._stateService.getStateList(this.queryParam).pipe(
            // map(e=> { e.data.result }),
            publishReplay(1),
            refCount()));
          this._local.setItem('key', this.isStateLoaded = false || true ? true : false);

        }
        return this.stateList;
        break;

      default:
        console.log("nothing")
        break;
    }
  }

}


// .subscribe(
        //   data => {
        //     if (data.statusCode === '200') {
        //       if (data.message == 'OK') {
        //         this.data = data.data.result;
        //         // console.log(this.data);
        //         this.stateList.next(this.data);
        //         return this.stateList;
        //       }
        //     } else {
        //       console.log(data.message);
        //     }
        //   }, error => { console.log(error); });



// if (type === 'State') {
    //   this._stateService.getStateList(this.queryParam).subscribe(
    //     data => {
    //       if (data.statusCode === '200') {
    //         if (data.message == 'OK') {
    //           this.data = data.data.result;
    //           console.log(this.data);
    //           return this.stateList.next(this.data);
    //         }
    //       } else {
    //         console.log(data.message);
    //       }
    //     },
    //     error => {
    //       console.log(error);
    //     }
    //   );
    //   return this.stateList;
    // }
