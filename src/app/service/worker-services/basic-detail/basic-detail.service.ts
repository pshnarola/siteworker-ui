import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class BasicDetailService {

  workerEditForm: FormGroup;
  payDetailForm: FormGroup;
  loginUserId;

  workerProfileDetailSubject = new Subject<any>();


  constructor(private _customHttpService: CustomHttpService, private http: HttpClient
    , private _formBuilder: FormBuilder,) { }



  initializeForm(): void {
    this.workerEditForm = this._formBuilder.group({
      id: [''],
      mobilePhone: ['', [CustomValidator.required]],
      userId: ['', [CustomValidator.required]],
      firstName: ['', [CustomValidator.required, Validators.maxLength(50)]],
      lastName: ['', [CustomValidator.required, Validators.maxLength(50)]],
      email: ['', [CustomValidator.required, CustomValidator.emailValidator, Validators.maxLength(100)]],
      photo: [''],
      summary: ['', [Validators.maxLength(250)]],

      service: [null, [Validators.required]],
      jobTitle: ['', [CustomValidator.required]],
      status: ['', [CustomValidator.required]],

      city: ['', [CustomValidator.required, Validators.maxLength(30)]],
      state: ['', [CustomValidator.required, Validators.maxLength(30)]],
      zipCode: ['', [CustomValidator.required, Validators.maxLength(5)]],

      lastSavedStep: 1,
      latitude: '',
      longitude: '',
      location: ['', [CustomValidator.required, Validators.maxLength(200)]],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      preferredStates: [],
      certificateMatch: [true],
      jobTitleMatch: [true]
    });
  }

  initializePayDetailForm(): void {
    this.payDetailForm = this._formBuilder.group({
      id: [''],
      willingToWorkFullTime: [false],
      // willingToWorkFullTime: ['', [CustomValidator.required]],
      // maxFullTimeSalary: ['', [CustomValidator.required ,Validators.maxLength(4),Validators.min(0.01)]],
      // minFullTimeSalary: ['', [CustomValidator.required ,Validators.maxLength(4),Validators.min(0.01)]],
      maxHourlyRate: ['', [CustomValidator.required, Validators.maxLength(6), Validators.min(0.01)]],
      minHourlyRate: ['', [CustomValidator.required, Validators.maxLength(5), Validators.min(0.01)]],
      lastSavedStep: 2,

      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
    });
  }

  // isWillingToWorkFullTime: false
  // maxFullTimeSalary: 0
  // maxHourlyRate: 0
  // minFullTimeSalary: 0
  // minHourlyRate: 0
  // status: null
  // willingToWorkFullTime: false


  getWorkerDetail(id: string): Observable<any> {
    const url = API_CONSTANTS.GET_LOGGEDIN_WORKER_DETAIL + id;
    return this._customHttpService.get(url);
  }

  getAllWorkerDetail(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_WORKER_PROFILE + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }

  updateWorkerProfile(Worker) {
    const url = API_CONSTANTS.UPDATE_WORKER_PROFILE;
    return this._customHttpService.put(url, Worker);
  }
  updateListingConfiguration(workerProfileDTO){
    const url = API_CONSTANTS.UPDATE_JOB_LISTING_CONFIGURATION;
    return this._customHttpService.put(url, workerProfileDTO);
  }
  uploadLogo(logo) {
    const url = API_CONSTANTS.UPLOAD_INDUSTRY_LOGO;
    const req = new HttpRequest('PUT', url, logo, {
      reportProgress: true,
      responseType: 'json'
    });
    return this.http.request(req);
  }

  getLogo(fileId: URLSearchParams) {
    const url = API_CONSTANTS.GET_INDUSTRY_LOGO + '?' + fileId;
    const req = new HttpRequest('GET', url, {
      responseType: 'blob'
    });
    return this.http.request(req);
  }

  downloadFile(fileId, fileName) {
    const url = API_CONSTANTS.DOWNLOAD_FILE + '?' + fileId + '&?' + fileName;
    return this._customHttpService.get(url);
  }

}
