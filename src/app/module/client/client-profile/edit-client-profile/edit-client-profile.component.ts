import { MapsAPILoader } from '@agm/core';
import { HttpResponse } from '@angular/common/http';
import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ClientProfileService } from 'src/app/service/client-services/client-profile/client-profile.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { CommonService } from 'src/app/shared/common-services/common.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { City } from 'src/app/shared/vo/city/city';
import { State } from 'src/app/shared/vo/state/state';
import { environment } from 'src/environments/environment';
import { Clientvo } from '../clientvo/clientvo';

@Component({
  selector: 'app-edit-client-profile',
  templateUrl: './edit-client-profile.component.html',
  styleUrls: ['./edit-client-profile.component.css']
})
export class EditClientProfileComponent implements OnInit, OnDestroy {

  selectedLogo: File;
  showPreview = false;
  newImage = false;
  logoBody: any;
  logoData: string;
  image: any;
  singleImageView: any;
  spinner = false;
  displayDummyImage = false;
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  noOfEmployeeList: any[];

  subscription = new Subscription();
  cityData: City[];
  cityDataTemp: City[];
  cityNameList = [];
  stateNameList = [];
  stateData: State[];
  user: FormGroup;
  loginUserId;
  submitted = false;
  files: File[] = [];
  client: Clientvo;
  filteredCity = [];
  filteredState = [];
  filterednumberOfEmployee = [];
  profileFile: File[] = [];

  city;
  state;
  zipCode;
  isCityPresentInAdmin: boolean;
  isStatePresentInAdmin: boolean;

  latitude: number;
  longitude: number;
  zoom: number;
  address = '';
  private geoCoder;
  filterMap = new Map();
  @ViewChild('search')
  public searchElementRef: ElementRef;
  isCityUndefined: boolean;
  isStateUndefined: any;
  selectedEmployee = [];

  constructor(
    public _clientProfileService: ClientProfileService,
    private router: Router,
    private _localStorageService: LocalStorageService,
    private _notificationService: UINotificationService,
    private captionChangeService: HeaderManagementService,
    private translator: TranslateService,
    private commonService: CommonService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
  ) {
    this.loginUserId = _localStorageService.getLoginUserId();
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.CLIENT_PROFILE_1);
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.CLIENT_PROFILE_1);
    this._clientProfileService.initializeForm();
    this.getLogedInClientDetail(this.loginUserId);
    this.getLocation();
    this.subscription.add(this.commonService.getAllNoOfEmployeeList().subscribe(data => {
      this.noOfEmployeeList = data;
    }));
    this.subscription.add(this.commonService.getAllStateList().subscribe(data => {
      this.stateData = data;
      this.stateData.forEach(state => {
        this.stateNameList.push(state.name);
      });
    }));
    this.subscription.add(this.commonService.getAllCityList().subscribe(data => {
      this.cityData = data;
      this.cityData.forEach(city => {
        this.cityNameList.push(city.name);
      });
    }));
  }

  ngOnDestroy(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(false);
    this.subscription.unsubscribe();
  }

  onSelect(event) {
    this.files.push(...event.addedFiles);
    if (this.files[1] != null) {
      this.onRemove(this.files[0]);
    }
    this.selectedLogo = this.files[0];
    this.showPreview = true;
    this.profileFile = this.files;
    this.files = [];
    if (event.rejectedFiles.length > 0) {
      if (event.rejectedFiles[0].reason === 'size') {
        this._notificationService.error(this.translator.instant('max.file.size.5.mb'), '');
      } else {
        this._notificationService.error(this.translator.instant('image.upload'), '');
      }
      this.showPreview = false;
      event.rejectedFiles = [];
    }
  }

  onRemove(event) {
    this.files.splice(this.files.indexOf(event), 1);
    this.showPreview = false;

  }

  uploadLogo(next?: string) {
    this.spinner = true;
    if (this.selectedLogo) {
      const uploadImageData = new FormData();
      uploadImageData.append('file', this.selectedLogo);
      this._clientProfileService.uploadLogo(uploadImageData).subscribe(
        event => {
          if (event instanceof HttpResponse) {
            this.logoBody = event.body;
            this.logoData = this.logoBody.data;
            this._clientProfileService.clientEditForm.controls.photo.patchValue(this.logoData);
            if (next == 'next') {
              this.onSubmit('next');
            } else {
              this.onSubmit();
            }
          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
        }
      );
    }
    else {
      if (next == 'next') {
        this.onSubmit('next');
      } else {
        this.onSubmit();
      }
    }
  }

  get f() { return this._clientProfileService.clientEditForm; }

  getLogedInClientDetail(id) {
    this._clientProfileService.getClientDetail(id).subscribe(
      (data) => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.client = data.data;
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

    this._clientProfileService.clientEditForm.patchValue({
      id: this.client.id,
      companyName: this.client.companyName,
      companyPhone: this.client.companyPhone,
      contactPhone: this.client.contactPhone,
      contactName: this.client.contactName,
      contactEmail: this.client.contactEmail,
      user: {
        id: this.client.user.id,
        email: this.client.user.email,
        firstName: this.client.user.firstName,
        lastName: this.client.user.lastName,
      },
      yearFounded: this.client.yearFounded,
      dunNumber: this.client.dunNumber,
      companyDescription: this.client.companyDescription,
      city: this.client.city,
      state: this.client.state,
      zipCode: this.client.zipCode,

      photo: this.client.photo,

      legalCompanyName: this.client.legalCompanyName,
      designation: this.client.designation,
      lastSavedStep: this.client.lastSavedStep,

      isProjectAccess: this.client.isProjectAccess,
      isJobAccess: this.client.isJobAccess,
      isProjectApproved: this.client.isProjectApproved,
      isJobApproved: this.client.isJobApproved,
      isProjectMSAccepted: this.client.isProjectMSAccepted,
      isJobMSAccepted: this.client.isJobMSAccepted,

      latitude: this.client.latitude,
      longitude: this.client.longitude,
      location: this.client.location,
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      createdDate: this.client.createdDate,
      updatedDate: this.client.updatedDate,

    });
    if (this.client.numberOfEmployee !== null && this.client.numberOfEmployee !== undefined) {
      this._clientProfileService.clientEditForm.patchValue({
        numberOfEmployee: this.client.numberOfEmployee
      });
    } else {
    }

    if (this.client.photo) {
      this.singleImageView = environment.baseURL + '/file/getById?fileId=' + this.client.photo;
      this.displayDummyImage = false;
    } else {
      this.displayDummyImage = true;
    }

  }

  onSubmit(next?: string) {
    this.submitted = true;
    if (!this._clientProfileService.clientEditForm.valid) {
      let controlName: string;
      // tslint:disable-next-line: forin
      for (controlName in this._clientProfileService.clientEditForm.controls) {
        this._clientProfileService.clientEditForm.controls[controlName].markAsDirty();
        this._clientProfileService.clientEditForm.controls[controlName].updateValueAndValidity();
      }
      this.submitted = true;
      this.spinner = false;
      return false;
    }

    this.client = this._clientProfileService.clientEditForm.value;


    if (this._clientProfileService.clientEditForm.controls.id.value != null && this._clientProfileService.clientEditForm.valid) {
      this._clientProfileService.updateClientProfile(this.client).subscribe(
        data => {
          const client = data;
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('client.profile.updated'), '');
            this.spinner = false;
            this.submitted = false;
            this.files = [];
            this.showPreview = false;
            this.captionChangeService.profileDataSubject.next(client.data.user.id);
            if (client.data.photo) {
              this.singleImageView = environment.baseURL + '/file/getById?fileId=' + client.data.photo;
              this.displayDummyImage = false;
            }
            if (next == 'next') {
              this.files = [];
              setTimeout(() => {
                this.saveAndNext();
              }, 2000);
            }
          } else {
            this._notificationService.error(data.message, '');
            this.spinner = false;
          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.submitted = false;
          this.files = [];
          this.showPreview = false;
          this.spinner = false;
        }
      );
    }
    else {
      this._notificationService.error(this.translator.instant('enter valid data'), '');
      this.spinner = false;
    }
  }

  saveAndNext() {
    this.router.navigate(['client/edit-client-msa']);
  }

  redirectToDashboard() {
    this.router.navigate(['client/client-dashboard']);
  }

  getAddressFromAutocompleteMapsApi(event): void {
    this.isStatePresentInAdmin = false;
    this.isCityPresentInAdmin = false;
    this.city = event.get('LOCALITY');
    this.state = event.get('STATE');
    this.zipCode = event.get('ZIPCODE');
    this.address = event.get('ADDRESS');
    this.latitude = event.get('LATITUDE');
    this.longitude = event.get('LONGITUDE');
    if (this.zipCode) {
      this._clientProfileService.clientEditForm.controls.zipCode.setValue(this.zipCode);
    }
    this._clientProfileService.clientEditForm.get('city').setValue(this.city);
    this._clientProfileService.clientEditForm.get('state').setValue(this.state);
    this._clientProfileService.clientEditForm.get('zipCode').setValue(this.zipCode);
    this._clientProfileService.clientEditForm.get('location').setValue(this.address);
    this._clientProfileService.clientEditForm.get('latitude').setValue(this.latitude);
    this._clientProfileService.clientEditForm.get('longitude').setValue(this.longitude);
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

  filternumberOfEmployee(event) {
    const filtered: any[] = [];
    const query = event.query;
    for (let i = 0; i < this.noOfEmployeeList.length; i++) {
      const employee = this.noOfEmployeeList[i];
      if (employee.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(employee);
      }
    }
    this.filterednumberOfEmployee = filtered;
    this.filterednumberOfEmployee = this.filterednumberOfEmployee.sort();
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

}
