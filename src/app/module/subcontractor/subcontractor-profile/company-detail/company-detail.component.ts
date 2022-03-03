import { MapsAPILoader } from '@agm/core';
import { Component, ElementRef, EventEmitter, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Service } from 'src/app/module/admin/service-component/service';
import { DiversityCategoryService } from 'src/app/service/admin-services/diversity-category/diversity-category.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { SubcontractorProfileService } from 'src/app/service/subcontractor-services/subcontractor-profile/subcontractor-profile.service';
import { CommonService } from 'src/app/shared/common-services/common.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { City } from 'src/app/shared/vo/city/city';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { State } from 'src/app/shared/vo/state/state';
import { SubContractorServiceDTO } from '../vo/sub-contractor-service-dto';
import { SubcontractorProfileDto } from '../vo/subcontractor-profile-dto';

@Component({
  selector: 'app-company-detail',
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.css']
})
export class CompanyDetailComponent implements OnInit {

  ein: boolean;
  validate = COMMON_CONSTANTS.EIN_REGX;
  values;
  loginUserId: string;
  subcontractor: SubcontractorProfileDto;
  submitted = false;
  subscription = new Subscription();
  filteredServices = [];
  diversityCategoryList = [];
  numberOfEmployeeList = [];
  industryTypeList = [];
  serviceList = [];
  city;
  state;
  zipCode;

  cityData: City[];
  cityNameList = [];
  stateNameList = [];
  stateData: State[];
  filteredCity = [];
  filteredNumberOfEmployee = [];
  filteredDiversityStatus = [];
  filteredIndustryType = [];
  filteredState = [];

  @Output() goToBasicInformation = new EventEmitter<any>();
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;

  latitude: number;
  longitude: number;
  zoom: number;
  address = '';
  private geoCoder;
  filterMap = new Map();
  @ViewChild('search', { static: false })
  public searchElementRef: ElementRef;
  isCityUndefined: boolean;
  isStateUndefined: any;

  queryParam: URLSearchParams;
  datatableParam: DataTableParam;
  totalRecords: any;
  globalFilter: string;
  size = 2;
  offset: Number = 0;
  sortField: any;
  sortOrder: any;
  tempNumberOfEmployee: any;
  tempIndustryType: any;
  tempDIversityCategory: any;
  selectedServices: any[];
  serviceTemp: Service;
  subcontractorServiceDTO: SubContractorServiceDTO;
  subcontractorServiceList = [];
  tempData = [];
  list = [];

  @Output() goToCertificate = new EventEmitter<any>();
  cityParams: { name: any; };


  constructor(
    public _subContractorProfileServices: SubcontractorProfileService,
    private _localStorageService: LocalStorageService,
    private _notificationService: UINotificationService,
    private translator: TranslateService,
    private commonService: CommonService,
    private _diversityCategoryService: DiversityCategoryService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private filterLeftPanelService: FilterLeftPanelDataService
  ) {
    this.loginUserId = _localStorageService.getLoginUserId();
    this.subcontractor = new SubcontractorProfileDto();
  }

  ngOnInit(): void {
    this._subContractorProfileServices.initializeSecondForm();
    this.getLocation();
    this.getLogedInClientDetail(this.loginUserId);
    this._subContractorProfileServices.subContractorProfileDetailSubject.subscribe(data => this.subcontractor = data);
    this.subscription.add(this.commonService.industryType.subscribe(
      data => {
        this.industryTypeList = data;
      }));
    this.subscription.add(this.commonService.DiversityCategory.subscribe(
      data => {
        this.diversityCategoryList = data;
      }));
    this.subscription.add(this.commonService.noOfEmployeeList.subscribe(
      data => {
        this.numberOfEmployeeList = data;
      }));
    this.subscription.add(this.commonService.serviceList.subscribe(
      data => {
        this.serviceList = data;
      }));
    this.subscription.add(this.commonService.stateList.subscribe(data => {
      this.stateData = data;
      this.stateData.forEach(state => {
        this.stateNameList.push(state.name);
      });
    }));
    // this.subscription.add(this.commonService.cityList.subscribe(data => {
    //   this.cityData = data;
    //   this.cityData.forEach(city => {
    //     this.cityNameList.push(city.name);
    //   });
    // }));

    this._subContractorProfileServices.compnayDetailEdit.get('eins').valueChanges.subscribe(response => {
      if (!response) {
        this._subContractorProfileServices.compnayDetailEdit.removeControl('ein');
        this._subContractorProfileServices.compnayDetailEdit.addControl('ssn', new FormControl('', [Validators.required, Validators.pattern(COMMON_CONSTANTS.SSN_REGX)]));
      }
      if (response) {
        this._subContractorProfileServices.compnayDetailEdit.removeControl('ssn');
        this._subContractorProfileServices.compnayDetailEdit.addControl('ein', new FormControl('', [Validators.required, Validators.pattern(COMMON_CONSTANTS.EIN_REGX)]));
      }
    });

  }

  loadCityData(event: any) {
    this.cityParams = {
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.cityParams);
    this.filterLeftPanelService.getCity(this.queryParam).subscribe(data => {
      this.filteredCity = data.data;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onClick(event) {
    console.log(this.ein);
  }

  getLogedInClientDetail(id) {
    this._subContractorProfileServices.getSubcontractorDetail(id).subscribe(
      (data) => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.subcontractor = data.data;
          this.ein = this.subcontractor.subcontractorProfile.isEIN,
            this.fatchDetail();
        } else {
        }
      },
      error => {
        this._notificationService.error(this.translator.instant('common.error'), '');
      }
    );
  }


  fatchDetail() {
    this.subcontractor.subcontractorServices.forEach(
      res => {
        this.subcontractorServiceList.push(res.service); this.tempData.push(new SubContractorServiceDTO(res.service));
      });

    this._subContractorProfileServices.compnayDetailEdit.patchValue({
      id: this.subcontractor.subcontractorProfile.id,
      userId: this.subcontractor.subcontractorProfile.user.id,
      yearFounded: this.subcontractor.subcontractorProfile.yearFounded,

      eins: this.subcontractor.subcontractorProfile.isEIN,
      websiteURL: this.subcontractor.subcontractorProfile.websiteURL,

      lastSavedStep: 2,
      loginAsCompany: this.subcontractor.subcontractorProfile.isLoginAsCompany,
      location: this.subcontractor.subcontractorProfile.location,
      service: this.subcontractorServiceList,
      city: this.subcontractor.subcontractorProfile.city,
      state: this.subcontractor.subcontractorProfile.state,
      zipCode: this.subcontractor.subcontractorProfile.zipCode,
      latitude: this.subcontractor.subcontractorProfile.latitude,
      longitude: this.subcontractor.subcontractorProfile.longitude,
    });

    if (this.ein) {
      this._subContractorProfileServices.compnayDetailEdit.get('ein').patchValue(this.subcontractor.subcontractorProfile.einorSSN);
    } else {
      this._subContractorProfileServices.compnayDetailEdit.get('ssn').patchValue(this.subcontractor.subcontractorProfile.einorSSN);
    }

    if (this.subcontractor.subcontractorProfile.numberOfEmployee !== null && this.subcontractor.subcontractorProfile.industryType !== null && this.subcontractor.subcontractorProfile.diversityStatus !== null) {
      this._subContractorProfileServices.compnayDetailEdit.patchValue({
        numberOfEmployee: this.subcontractor.subcontractorProfile.numberOfEmployee,
        industryType: this.subcontractor.subcontractorProfile.industryType,
        diversityStatus: this.subcontractor.subcontractorProfile.diversityStatus
      });
    } else if (this.subcontractor.subcontractorProfile.industryType !== null && this.subcontractor.subcontractorProfile.industryType !== undefined) {
      this._subContractorProfileServices.compnayDetailEdit.patchValue({
        industryType: this.subcontractor.subcontractorProfile.industryType,
      });
    } else if (this.subcontractor.subcontractorProfile.diversityStatus !== null && this.subcontractor.subcontractorProfile.diversityStatus !== undefined) {
      this._subContractorProfileServices.compnayDetailEdit.patchValue({
        diversityStatus: this.subcontractor.subcontractorProfile.diversityStatus
      });
    } else if (this.subcontractor.subcontractorProfile.numberOfEmployee !== null && this.subcontractor.subcontractorProfile.numberOfEmployee !== undefined) {
      this._subContractorProfileServices.compnayDetailEdit.patchValue({
        numberOfEmployee: this.subcontractor.subcontractorProfile.numberOfEmployee,
      });
    } else {
      console.log('nothing to show');
    }

  }

  get companyForm() { return this._subContractorProfileServices.compnayDetailEdit; }

  onChange(data: Service[]) {
    this.tempData.length = 0;
    data.forEach(element => {
      this.tempData.push(new SubContractorServiceDTO(element));
    });
  }


  onSubmit(next?) {
    this.submitted = true;
    if (!this._subContractorProfileServices.compnayDetailEdit.valid) {
      CustomValidator.markFormGroupTouched(this._subContractorProfileServices.compnayDetailEdit);
      this.submitted = true;
      return false;
    }

    if (this._subContractorProfileServices.compnayDetailEdit.controls.id.value != null || !this._subContractorProfileServices.compnayDetailEdit.valid) {

      this.selectedServices = this._subContractorProfileServices.compnayDetailEdit.value.service;
      this.subcontractor.subcontractorServices = this.tempData;
      if (this.ein) {
        this.subcontractor.subcontractorProfile.einorSSN = this._subContractorProfileServices.compnayDetailEdit.get('ein').value;
      } else {
        this.subcontractor.subcontractorProfile.einorSSN = this._subContractorProfileServices.compnayDetailEdit.get('ssn').value;
      }

      this.subcontractor.subcontractorProfile.isEIN = this._subContractorProfileServices.compnayDetailEdit.get('eins').value;
      this.subcontractor.subcontractorProfile.id = this._subContractorProfileServices.compnayDetailEdit.get('id').value;
      this.subcontractor.subcontractorProfile.user.id = this._subContractorProfileServices.compnayDetailEdit.get('userId').value;
      this.subcontractor.subcontractorProfile.websiteURL = this._subContractorProfileServices.compnayDetailEdit.get('websiteURL').value;
      this.subcontractor.subcontractorProfile.yearFounded = this._subContractorProfileServices.compnayDetailEdit.get('yearFounded').value;
      this.subcontractor.subcontractorProfile.city = this._subContractorProfileServices.compnayDetailEdit.get('city').value;
      this.subcontractor.subcontractorProfile.state = this._subContractorProfileServices.compnayDetailEdit.get('state').value;
      this.subcontractor.subcontractorProfile.zipCode = this._subContractorProfileServices.compnayDetailEdit.get('zipCode').value;
      this.subcontractor.subcontractorProfile.location = this._subContractorProfileServices.compnayDetailEdit.get('location').value;
      this.subcontractor.subcontractorProfile.latitude = this._subContractorProfileServices.compnayDetailEdit.get('latitude').value;
      this.subcontractor.subcontractorProfile.longitude = this._subContractorProfileServices.compnayDetailEdit.get('longitude').value;
      this.subcontractor.subcontractorProfile.lastSavedStep = this._subContractorProfileServices.compnayDetailEdit.get('lastSavedStep').value;

      this.tempNumberOfEmployee = this._subContractorProfileServices.compnayDetailEdit.get('numberOfEmployee').value;
      this.subcontractor.subcontractorProfile.numberOfEmployee = this.tempNumberOfEmployee;

      this.subcontractor.subcontractorProfile.diversityStatus = this._subContractorProfileServices.compnayDetailEdit.get('diversityStatus').value;
      this.subcontractor.subcontractorProfile.industryType = this._subContractorProfileServices.compnayDetailEdit.get('industryType').value;
      this._subContractorProfileServices.updateSubcontractorProfile(this.subcontractor).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('subcontractor.profile.updated'), '');
            this.submitted = false;
            if (next == 'next') {
              this.next();
            }
          } else {
            this._notificationService.error(data.message, '');
          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.submitted = false;
        }
      );
    }
    else {
    }
  }

  next(string?) {
    this.goToCertificate.emit('');
  }

  filterService(event) {
    const filtered: any[] = [];
    const query = event.query;
    if (this.list.length < 5) {
      for (let i = 0; i < this.serviceList.length; i++) {
        const serviceTemp = this.serviceList[i];
        if (serviceTemp.serviceName.toLowerCase().indexOf(query.toLowerCase()) == 0) {
          filtered.push(serviceTemp);
        }
      }
      this.filteredServices = filtered;
    } else {
      this._notificationService.error(this.translator.instant('max.limit.reached'), '');
    }
  }

  getAddressFromAutocompleteMapsApi(event): void {
    this.city = event.get('LOCALITY');
    this.state = event.get('STATE');
    this.zipCode = event.get('ZIPCODE');
    this.address = event.get('ADDRESS');
    this.latitude = event.get('LATITUDE');
    this.longitude = event.get('LONGITUDE');
    this._subContractorProfileServices.compnayDetailEdit.get('city').setValue(this.city);
    this._subContractorProfileServices.compnayDetailEdit.get('state').setValue(this.state);
    this._subContractorProfileServices.compnayDetailEdit.get('zipCode').setValue(this.zipCode);
    this._subContractorProfileServices.compnayDetailEdit.get('location').setValue(this.address);
    this._subContractorProfileServices.compnayDetailEdit.get('latitude').setValue(this.latitude);
    this._subContractorProfileServices.compnayDetailEdit.get('longitude').setValue(this.longitude);
  }

  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  dS() {
    this._diversityCategoryService.getDiversityList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.diversityCategoryList = data.data.result;
          }
        } else {
        }
      },
      error => {
      }
    );
  }

  getLocation() {
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder();

      const autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          const place: google.maps.places.PlaceResult = autocomplete.getPlace();
          this.filterMap.clear();
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          const info = place.address_components;
          info.forEach(e => {
            switch (e.types[0]) {
              case 'sublocality_level_1':
                this.filterMap.set('REGION', e.long_name);
                break;
              case 'administrative_area_level_1':
                this.filterMap.set('STATE', e.long_name);
                break;
              case 'country':
                this.filterMap.set('COUNTRY', e.long_name);
                break;
              case 'postal_code':
                this.filterMap.set('ZIPCODE', e.long_name);
                break;
              case 'locality':
                this.filterMap.set('LOCALITY', e.long_name);
                break;
              default:
                break;
            }
          });
          this.filterMap.set('LATITUDE', place.geometry.location.lat());
          this.filterMap.set('LONGITUDE', place.geometry.location.lng());
          this.filterMap.set('ADDRESS', place.formatted_address);
          this.zoom = 12;
          const jsonObject = {};
          this.getAddressFromAutocompleteMapsApi(this.filterMap);

          this.filterMap.forEach((value, key) => {
            jsonObject[key] = value;
          });
        });
      });
    });
  }

  filterCity(event) {
    const filtered: any[] = [];
    const query = event.query;
    for (let i = 0; i < this.cityNameList.length; i++) {
      const client = this.cityNameList[i];
      if (client.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(client);
      }
    }
    this.filteredCity = filtered;
    this.filteredCity = this.filteredCity.sort();
  }

  filterState(event) {
    const filtered: any[] = [];
    const query = event.query;
    for (let i = 0; i < this.stateNameList.length; i++) {
      const state = this.stateNameList[i];
      if (state.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(state);
      }
    }
    this.filteredState = filtered;
    this.filteredState = this.filteredState.sort();
  }

  filterIndustryType(event) {
    const filtered: any[] = [];
    const query = event.query;
    for (let i = 0; i < this.industryTypeList.length; i++) {
      const entity = this.industryTypeList[i];
      if (entity.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(entity);
      }
    }
    this.filteredIndustryType = filtered;
    this.filteredIndustryType = this.filteredIndustryType.sort();
  }

  filterNumberOfEmployee(event) {
    const filtered: any[] = [];
    const query = event.query;
    for (let i = 0; i < this.numberOfEmployeeList.length; i++) {
      const entity = this.numberOfEmployeeList[i];
      if (entity.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(entity);
      }
    }
    this.filteredNumberOfEmployee = filtered;
    this.filteredNumberOfEmployee = this.filteredNumberOfEmployee.sort();
  }

  filterDiversityStatus(event) {
    const filtered: any[] = [];
    const query = event.query;
    for (let i = 0; i < this.diversityCategoryList.length; i++) {
      const entity = this.diversityCategoryList[i];
      if (entity.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(entity);
      }
    }
    this.filteredDiversityStatus = filtered;
    this.filteredDiversityStatus = this.filteredDiversityStatus.sort();
  }

  previous() {
    this.goToBasicInformation.emit('');
  }


}
