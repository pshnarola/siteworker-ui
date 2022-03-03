import { Component, OnInit, ViewChild, ElementRef, NgZone, Output, EventEmitter, Input } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { FormGroup } from '@angular/forms';


@Component({
  selector: 'app-auto-complete-map-places',
  templateUrl: './auto-complete-map-places.component.html',
  styleUrls: ['./auto-complete-map-places.component.css']
})
export class AutoCompleteMapPlacesComponent implements OnInit {

  @Output() pickAddress: EventEmitter<any> = new EventEmitter();

  latitude: number;
  longitude: number;
  zoom: number;
  address = '';
  // city = '';
  // state = '';
  // country = '';
  // region = '';
  // zip = '';
  private geoCoder;
  filterMap = new Map();
  @Input() jobDetailForm: FormGroup;
  @Input() location: any;
  @Input() submitted: any;
  @Input() jobsiteFilterLocation: any;
  @Input() jobFilterFormGroup: any;
  @Input() filterFlage;

  addressData;
  addressDataTwo;
  address1;
  address2;
  @ViewChild('search')
  public searchElementRef: ElementRef;
  constructor(
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
  ) { }

  ngOnInit(): void {
    this.mapsAPILoader.load().then(() => {
      // this.setCurrentLocation();
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
            console.log(e.types[0]);
            switch (e.types[0]) {
              case 'sublocality_level_1':
                this.filterMap.set('REGION', e.long_name);
                // this.region = e.long_name;
                break;
              case 'administrative_area_level_1':
                this.filterMap.set('STATE', e.long_name);
                // this.state = e.long_name;
                break;
              case 'country':
                this.filterMap.set('COUNTRY', e.long_name);
                // this.country = e.long_name;
                break;
              case 'postal_code':
                this.filterMap.set('ZIPCODE', e.long_name);
                // this.zip = e.long_name;
                break;
              case 'locality':
                this.filterMap.set('LOCALITY', e.long_name);
                // this.city = e.long_name;
                break;
              default:
                console.log('No such day exists!');
                break;
            }
          });
          this.address1 = place.formatted_address;
          this.address2 = place.formatted_address;
          this.filterMap.set('LATITUDE', place.geometry.location.lat());
          this.filterMap.set('LONGITUDE', place.geometry.location.lng());
          this.filterMap.set('ADDRESS', this.address1);
          this.filterMap.set('ADDRESS', this.address2);
          // this.latitude = place.geometry.location.lat();
          // this.longitude = place.geometry.location.lng();
          // this.address = place.vicinity;
          this.zoom = 12;
          console.log(this.address1);
          console.log(this.address2);
          const jsonObject = {};
          // tslint:disable-next-line: no-shadowed-variable
          this.pickAddress.emit(this.filterMap);
          this.filterMap.forEach((value, key) => {
            jsonObject[key] = value;
          });
          console.log(JSON.stringify(jsonObject));
        });
      });
    });
    if (this.jobDetailForm == undefined || this.jobDetailForm == null) {
      this.addressDataTwo = this.location;
      this.address1 = this.addressDataTwo;
      // this.address2 = this.addressDataTwo;

    } else {
      this.addressData = this.jobDetailForm.value.location;
      this.address1 = this.addressData;
      // this.address2 = this.addressData;
      console.log(this.submitted);

    }
    if (this.jobDetailForm == undefined || this.jobDetailForm == null) {
      this.addressDataTwo = this.location;
      this.address2 = this.addressDataTwo;

    } else {
      this.addressData = this.jobDetailForm.value.location;
      this.address2 = this.addressData;
      console.log(this.submitted);

    }
    // this.addressData = this.jobDetailForm.value.location;
    // this.addressDataTwo = this.location;
    // console.log(this.addressData)
    // console.log(this.addressDataTwo)
    // this.address1=this.addressDataTwo
  }

  ngOnChanges(){
    this.address1 = this.jobsiteFilterLocation;
    this.address2 = this.jobFilterFormGroup;
  }

  private setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 8;
        this.getAddress(this.latitude, this.longitude);
      });
    }
  }

  getAddress(latitude, longitude) {
    this.geoCoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          this.zoom = 12;
          this.address = results[0].formatted_address;
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });
  }

  placesModelChanged(event: any): void {
    if (this.address1 === '') {
      this.filterMap.clear();
      this.filterMap.set('NO_DATA_FOUND', 'NO_DATA_FOUND');
      this.pickAddress.emit(this.filterMap);
    }
    if (this.address2 === '') {
      this.filterMap.clear();
      this.filterMap.set('NO_DATA_FOUND', 'NO_DATA_FOUND');
      this.pickAddress.emit(this.filterMap);
    }
  }

  placesReset(): void {
    this.address1 = '';
    this.address2 = '';
  }

}
