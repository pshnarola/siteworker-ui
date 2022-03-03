import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { CommonService } from 'src/app/shared/common-services/common.service';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { City } from 'src/app/shared/vo/city/city';

import { SelectItem } from "primeng/api";
import { UpdatedService } from 'src/app/service/updated-service/updated.service';
import { MapsAPILoader } from '@agm/core';
import { ClipboardService } from 'ngx-clipboard';

declare var name: any;




@Component({
  selector: 'app-prime-ng',
  templateUrl: './prime-ng.component.html',
  animations: [
    trigger('errorState', [
      state('hidden', style({
        opacity: 0
      })),
      state('visible', style({
        opacity: 1
      })),
      transition('visible => hidden', animate('400ms ease-in')),
      transition('hidden => visible', animate('400ms ease-out'))
    ])
  ],
  styleUrls: ['./prime-ng.component.css']
})
export class PrimeNgComponent implements OnInit, OnDestroy {

  selectedCountry: any;

  blockSpecial: RegExp = /^[^<>*!]+$/;

  blockSpace: RegExp = /[^\s]/;

  ccRegex: RegExp = /[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}$/;

  cc: string;

  selectedCountries2: any;

  items: SelectItem[];

  values2: [];

  subscription = new Subscription();
  dateData;

  cities: City[];

  countries = [
    { 'name': 'Afghanistan', 'code': 'AF' },
    { 'name': 'Åland Islands', 'code': 'AX' },
    { 'name': 'Albania', 'code': 'AL' },
    { 'name': 'Algeria', 'code': 'DZ' },
    { 'name': 'American Samoa', 'code': 'AS' },
    { 'name': 'Andorra', 'code': 'AD' },
    { 'name': 'Angola', 'code': 'AO' },
    { 'name': 'Anguilla', 'code': 'AI' },
    { 'name': 'Antarctica', 'code': 'AQ' },
    { 'name': 'Antigua and Barbuda', 'code': 'AG' },
    { 'name': 'Argentina', 'code': 'AR' },
    { 'name': 'Armenia', 'code': 'AM' },
    { 'name': 'Aruba', 'code': 'AW' },
    { 'name': 'Australia', 'code': 'AU' },
    { 'name': 'Austria', 'code': 'AT' },
    { 'name': 'Azerbaijan', 'code': 'AZ' },
    { 'name': 'Bahamas', 'code': 'BS' },
    { 'name': 'Bahrain', 'code': 'BH' },
    { 'name': 'Bangladesh', 'code': 'BD' },
    { 'name': 'Barbados', 'code': 'BB' },
    { 'name': 'Belarus', 'code': 'BY' },
    { 'name': 'Belgium', 'code': 'BE' },
    { 'name': 'Belize', 'code': 'BZ' },
    { 'name': 'Benin', 'code': 'BJ' },
    { 'name': 'Bermuda', 'code': 'BM' },
    { 'name': 'Bhutan', 'code': 'BT' },
    { 'name': 'Bolivia', 'code': 'BO' },
    { 'name': 'Bosnia and Herzegovina', 'code': 'BA' },
    { 'name': 'Botswana', 'code': 'BW' },
    { 'name': 'Bouvet Island', 'code': 'BV' },
    { 'name': 'Brazil', 'code': 'BR' },
    { 'name': 'British Indian Ocean Territory', 'code': 'IO' },
    { 'name': 'Brunei Darussalam', 'code': 'BN' },
    { 'name': 'Bulgaria', 'code': 'BG' },
    { 'name': 'Burkina Faso', 'code': 'BF' },];



  filteredCountries: any[];

  selectedCountries: any[];

  selectedCountryAdvanced: any[];

  filteredBrands: any[];
  dateUTC: Date;

  readmoreString = "<b>Testing</b> <b>Varshiiiillll</b>";
  isCopied = false;
  couponText = 'Hi vinita';
  constructor(private primengConfig: PrimeNGConfig, private confirmDialogueService: ConfirmDialogueService,
    private uiNotification: UINotificationService, private projectJobSelectionService: ProjectJobSelectionService,
    private commonService: CommonService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private temp: UpdatedService,
    private _clipboardService: ClipboardService) {
    this.dateData = new Date();

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    // this.getLatLong();
    this.primengConfig.ripple = true;
    this.subscription.add(this.projectJobSelectionService.selectedJobSubject.subscribe(e => {
      // console.log(e);
    }));
    this.subscription.add(this.projectJobSelectionService.postTypeSubject.subscribe(e => {
      // console.log(e);
    }));
    this.subscription.add(this.projectJobSelectionService.selectedProjectSubject.subscribe(e => {
      // console.log(e);
    }));
    this.subscription.add(this.projectJobSelectionService.selectedJobsiteSubject.subscribe(e => {
      // console.log(e);
    }));

    this.commonService.getAllData('City');

    this.commonService.cityList.subscribe(e => {
      this.cities = e;
    });

    // this.temp.getAllData('State').subscribe(e => console.log(e));
  }

  filterCountry(event) {
    //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.countries.length; i++) {
      let country = this.countries[i];
      if (country.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(country);
      }
    }

    this.filteredCountries = filtered;
  }

  showNotification(): void {
    this.uiNotification.success("Success Message", "");
    this.uiNotification.warning("Warning Message", "");
    this.uiNotification.error("Error Message", "");
    this.uiNotification.info("Info Message", "");
  }
  OnClickDate() {
    console.log(this.dateData.toISOString())
    console.log(this.dateData)
  }
  sendInvitee(): void {
    console.log(this.values2);
  }

  getAddressFromAutocompleteMapsApi(event): void {
    console.log(event);
  }

  openDialog(): void {

    let options = null;

    options = {
      title: 'Delete your Account?',
      message: 'You are about to delete your own account and will be redirected to Login.',
      cancelText: 'No Way',
      confirmText: 'Yes sure'
    };

    this.confirmDialogueService.open(options);
    this.confirmDialogueService.confirmed().subscribe(confirmed => {
      console.log(confirmed);
      if (confirmed) {

      }
    });
  }

  //get lat long by state and city 
  getLatLong(city?: string,) {
    this.mapsAPILoader.load().then(() => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ 'address': 'Gujarat' }, function (completeAddress, status) {
        console.log(completeAddress);
        console.log(status);
        if (status == google.maps.GeocoderStatus.OK) {
          alert("location : " + completeAddress[0].geometry.location.lat() + " " + completeAddress[0].geometry.location.lng());
        } else {
          alert("Something got wrong " + status);
        }
      });
    });
  }
  copyDynamicText() {
    this._clipboardService.copyFromContent('Hi Vinita');
    this.isCopied = true;
  }


  // compareTwoArray() {
  //   let array1 = [];
  //   let array2 = [];
  //   array1 = array1.filter(val => array2.includes(val));
  //   console.log(array1);
  // }

}
