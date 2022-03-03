import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, Subject, Subscription } from 'rxjs';
import { Certificate } from 'src/app/module/admin/certificate/certificate';
import { DiversityCategory } from 'src/app/module/admin/diversity-category/diversity-category';
import { Service } from 'src/app/module/admin/service-component/service';
import { CertificateService } from 'src/app/service/admin-services/certificate/certificate.service';
import { CityService } from 'src/app/service/admin-services/city/city.service';
import { DiversityCategoryService } from 'src/app/service/admin-services/diversity-category/diversity-category.service';
import { IndustryTypeService } from 'src/app/service/admin-services/industry-type/industry-type.service';
import { JobTitleService } from 'src/app/service/admin-services/job-title/job-title.service';
import { NoOfEmployeesService } from 'src/app/service/admin-services/no-of-employees/no-of-employees.service';
import { ServiceComponentService } from 'src/app/service/admin-services/service-component/service-component.service';
import { StateService } from 'src/app/service/admin-services/state/state.service';
import { CustomHttpService } from 'src/app/service/customHttp.service';
import { API_CONSTANTS } from '../ApiConstants';
import { City } from '../vo/city/city';
import { DataTableParam } from '../vo/DataTableParam';
import { IndustryType } from '../vo/IndustryType';
import { JobTitle } from '../vo/JobTitle';
import { State } from '../vo/state/state';


const mycitySubject = new Subject<void>();
@Injectable({
  providedIn: 'root'
})
export class CommonService {
  queryParam: URLSearchParams;

  datatableParam: DataTableParam = {
    offset: 0,
    size: 100000,
    sortField: 'CREATED_DATE',
    sortOrder: 0,
    searchText: '{"ENABLE" : true}'
  };

  totalRecords: any;
  globalFilter: string;
  size: number = 2;
  offset: Number = 0;
  sortField: any;
  sortOrder: any = 1;
  data: any[];
  commonSubject = new Subject<any[]>();
  stateList = new Subject<State[]>();
  cityList = new Subject<City[]>();
  noOfEmployeeList = new Subject<any[]>();
  industryType = new Subject<IndustryType[]>();
  jobTitleList = new Subject<JobTitle[]>();
  DiversityCategory = new Subject<DiversityCategory[]>();
  serviceList = new Subject<Service[]>();
  certificateList = new Subject<Certificate[]>();
  industryTypeList = [];
  filterMap = new Map();

  constructor(
    private _customHttpService: CustomHttpService,
    private _stateService: StateService,
    private _cityService: CityService,
    private _noOfEmployees: NoOfEmployeesService,
    private _industryTypeService: IndustryTypeService,
    private _diversityCategoryService: DiversityCategoryService,
    private _service: ServiceComponentService,
    private _jobtitleService: JobTitleService,
    private _certificateService: CertificateService,
  ) { }

  setAllData(data: any[], type): any {
    if (type === 'State') {
      this.stateList.next(data);
      return 'state present'
    } else if (type === 'City') {
      this.cityList.next(data);
      return 'city present'
    } else if (type === 'noOfEmployee') {
      this.noOfEmployeeList.next(data);
      return 'no of employee present';
    } else if (type === 'industryType') {
      this.industryType.next(data);
      return 'no of employee present';
    } else if (type === 'diversityCategory') {
      this.DiversityCategory.next(data);
      return 'no of employee present';
    } else if (type === 'service') {
      this.serviceList.next(data);
      return 'no of employee present';
    }
    else if (type === 'jobTitle') {
      this.jobTitleList.next(data);
      return 'no of employee present';
    }
    else if (type === 'certificate') {
      this.certificateList.next(data);
      return 'no of employee present';
    }
  }

  setFilterToGetByClient() {
    this.filterMap.clear();
    this.filterMap.set('ENABLE', true);
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    let globalFilter = JSON.stringify(jsonObject);
    return globalFilter;
  }

  onLazyLoad(event): void {
    this.sortOrder = event.sortOrder == -1 ? 0 : 1;
    this.globalFilter = event.globalFilter ? event.globalFilter : this.setFilterToGetByClient();
    this.sortField = event.sortField ? event.sortField : 'CREATED_DATE';
    this.offset = event.first / event.rows;
    this.datatableParam = {
      offset: null,
      size: event.rows ? event.rows : 1000,
      sortField: 'CREATED_DATE',
      sortOrder: this.sortOrder,
      searchText: null
    };
  }

  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  getAllStateList(): Observable<any> {
    this.datatableParam = {
      offset: this.offset,
      size: 100000,
      sortField: 'NAME',
      sortOrder: this.sortOrder,
      searchText: '{"ENABLE" : true}'
    };
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this._stateService.getStateList(this.queryParam).subscribe(
      data => {
        this.data = data.data.result;
        this.stateList.next(this.data);
      });
    return this.stateList.asObservable();
  }

  getAllCityList(): Observable<any> {
    this.datatableParam = {
      offset: this.offset,
      size: 100000,
      sortField: 'CREATED_DATE',
      sortOrder: this.sortOrder,
      searchText: '{"ENABLE" : true}'
    };
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this._cityService.getCityList(this.queryParam).subscribe(
      data => {
        this.data = data.data.result;
        this.cityList.next(this.data);
      });
    return this.cityList.asObservable();
  }

  getAllServicesList(): Observable<any> {
    this.datatableParam = {
      offset: this.offset,
      size: 100000,
      sortField: 'CREATED_DATE',
      sortOrder: this.sortOrder,
      searchText: '{"ENABLE" : true}'
    };
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this._service.getServiceList(this.queryParam).subscribe(
      data => {
        this.data = data.data.result;
        this.serviceList.next(this.data);
      });
    return this.serviceList.asObservable();
  }

  getAllCertificateList(): Observable<any> {
    this.datatableParam = {
      offset: this.offset,
      size: 100000,
      sortField: 'CREATED_DATE',
      sortOrder: this.sortOrder,
      searchText: '{"IS_ENABLE" : true}'
    };
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this._certificateService.getCertificateList(this.queryParam).subscribe(
      data => {
        this.data = data.data.result;
        this.certificateList.next(this.data);
      });
    return this.certificateList.asObservable();
  }

  getAllNoOfEmployeeList(): Observable<any> {
    this.datatableParam = {
      offset: this.offset,
      size: 100000,
      sortField: 'CREATED_DATE',
      sortOrder: this.sortOrder,
      searchText: '{"IS_ENABLE" : true}'
    };
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this._noOfEmployees.getNoOfEmployeeList(this.queryParam).subscribe(
      data => {
        this.data = data.data.result;
        this.noOfEmployeeList.next(this.data);
      });
    return this.noOfEmployeeList.asObservable();
  }

  getAllIndustryTypeList(): Observable<any> {
    this.datatableParam = {
      offset: this.offset,
      size: 100000,
      sortField: 'CREATED_DATE',
      sortOrder: this.sortOrder,
      searchText: '{"IS_ENABLE" : true}'
    };
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this._industryTypeService.getIndustryTypeList(this.queryParam).subscribe(
      data => {
        this.data = data.data.result;
        this.industryType.next(this.data);
      });
    return this.industryType.asObservable();
  }

  getAllDiversityList(): Observable<any> {
    this.datatableParam = {
      offset: this.offset,
      size: 100000,
      sortField: 'CREATED_DATE',
      sortOrder: this.sortOrder,
      searchText: '{"IS_ENABLE" : true}'
    };
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this._diversityCategoryService.getDiversityList(this.queryParam).subscribe(
      data => {
        this.data = data.data.result;
        this.DiversityCategory.next(this.data);
      });
    return this.DiversityCategory.asObservable();
  }

  getAllJobTitleList(): Observable<any> {
    this.datatableParam = {
      offset: this.offset,
      size: 100000,
      sortField: 'CREATED_DATE',
      sortOrder: this.sortOrder,
      searchText: '{"ENABLE" : true}'
    };
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this._jobtitleService.getJobTitleList(this.queryParam).subscribe(
      data => {
        this.data = data.data.result;
        this.jobTitleList.next(this.data);
      });
    return this.jobTitleList.asObservable();
  }

  getAllData(type) {
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    if (type === 'State') {
      this.datatableParam = {
        offset: this.offset,
        size: 100000,
        sortField: 'CREATED_DATE',
        sortOrder: this.sortOrder,
        searchText: '{"ENABLE" : true}'
      };
      this.queryParam = this.prepareQueryParam(this.datatableParam);
      this._stateService.getStateList(this.queryParam).subscribe(
        data => {
          if (data.statusCode === '200') {
            if (data.message == 'OK') {
              this.data = data.data.result;
              this.setAllData(this.data, type);
            }
          } else {
            console.log(data.message);
          }
        },
        error => {
          console.log(error);
        }
      );
    } else if (type === 'City') {
      this.datatableParam = {
        offset: this.offset,
        size: 100000,
        sortField: 'CREATED_DATE',
        sortOrder: this.sortOrder,
        searchText: '{"ENABLE" : true}'
      };
      this.queryParam = this.prepareQueryParam(this.datatableParam);
      this._cityService.getCityList(this.queryParam).subscribe(
        data => {
          if (data.statusCode === '200') {
            if (data.message == 'OK') {
              this.data = data.data.result;
              this.setAllData(this.data, type);
            }
          } else {
            console.log(data.message);
          }
        },
        error => {
          console.log(error);
        }
      );
    }
    else if (type === 'noOfEmployee') {
      this.datatableParam = {
        offset: this.offset,
        size: 100000,
        sortField: 'CREATED_DATE',
        sortOrder: this.sortOrder,
        searchText: '{"IS_ENABLE" : true}'
      };
      this.queryParam = this.prepareQueryParam(this.datatableParam);
      this._noOfEmployees.getNoOfEmployeeList(this.queryParam).subscribe(
        data => {
          if (data.statusCode === '200') {
            if (data.message == 'OK') {
              this.data = data.data.result;
              this.setAllData(this.data, type);
            }
          } else {
            console.log(data.message);
          }
        },
        error => {
          console.log(error);
        }
      );
    }
    else if (type == 'industryType') {
      this.datatableParam = {
        offset: this.offset,
        size: 100000,
        sortField: 'CREATED_DATE',
        sortOrder: this.sortOrder,
        searchText: '{"IS_ENABLE" : true}'
      };
      this.queryParam = this.prepareQueryParam(this.datatableParam);
      this._industryTypeService.getIndustryTypeList(this.queryParam).subscribe(
        data => {
          if (data.statusCode === '200') {
            if (data.message == 'OK') {
              this.data = data.data.result;
              this.setAllData(this.data, type);
            }
          } else {
            console.log(data.message);
          }
        },
        error => {
          console.log(error);
        }
      );
    }
    else if (type == 'diversityCategory') {
      this.datatableParam = {
        offset: this.offset,
        size: 100000,
        sortField: 'CREATED_DATE',
        sortOrder: this.sortOrder,
        searchText: '{"IS_ENABLE" : true}'
      };
      this.queryParam = this.prepareQueryParam(this.datatableParam);
      this._diversityCategoryService.getDiversityList(this.queryParam).subscribe(
        data => {
          if (data.statusCode === '200') {
            if (data.message == 'OK') {
              this.data = data.data.result;
              this.setAllData(this.data, type);
            }
          } else {
            console.log(data.message);
          }
        },
        error => {
          console.log(error);
        }
      );
    }
    else if (type == 'service') {
      this.datatableParam = {
        offset: this.offset,
        size: 100000,
        sortField: 'CREATED_DATE',
        sortOrder: this.sortOrder,
        searchText: '{"ENABLE" : true}'
      };
      this.queryParam = this.prepareQueryParam(this.datatableParam);
      this._service.getServiceList(this.queryParam).subscribe(
        data => {
          if (data.statusCode === '200') {
            if (data.message == 'OK') {
              this.data = data.data.result;
              this.setAllData(this.data, type);
            }
          } else {
            console.log(data.message);
          }
        },
        error => {
          console.log(error);
        }
      );
    }
    else if (type == 'jobTitle') {
      this.datatableParam = {
        offset: this.offset,
        size: 100000,
        sortField: 'CREATED_DATE',
        sortOrder: this.sortOrder,
        searchText: '{"ENABLE" : true}'
      };
      this.queryParam = this.prepareQueryParam(this.datatableParam);
      this._jobtitleService.getJobTitleList(this.queryParam).subscribe(
        data => {
          if (data.statusCode === '200') {
            if (data.message == 'OK') {
              this.data = data.data.result;
              this.setAllData(this.data, type);
            }
          } else {
            console.log(data.message);
          }
        },
        error => {
          console.log(error);
        }
      );
    }
    else if (type == 'certificate') {
      this.datatableParam = {
        offset: this.offset,
        size: 100000,
        sortField: 'CREATED_DATE',
        sortOrder: this.sortOrder,
        searchText: '{"IS_ENABLE" : true}'
      };
      this.queryParam = this.prepareQueryParam(this.datatableParam);
      this._certificateService.getCertificateList(this.queryParam).subscribe(
        data => {
          if (data.statusCode === '200') {
            if (data.message == 'OK') {
              this.data = data.data.result;
              this.setAllData(this.data, type);
            }
          } else {
            console.log(data.message);
          }
        },
        error => {
          console.log(error);
        }
      );
    }
  }

  getCityList(): Observable<any> {
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    return this._cityService.getCityList(this.queryParam);
  }
}
