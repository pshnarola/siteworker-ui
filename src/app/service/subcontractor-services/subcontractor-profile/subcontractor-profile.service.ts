import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class SubcontractorProfileService {

  subcontractorEditForm: FormGroup;
  compnayDetailEdit: FormGroup;
  loginUserId;

  subContractorProfileDetailSubject = new Subject<any>();


  constructor(private _customHttpService: CustomHttpService, private http: HttpClient
    , private _formBuilder: FormBuilder,) { }

  initializeForm(): void {
    this.subcontractorEditForm = this._formBuilder.group({
      id: [''],
      companyName: ['', [Validators.maxLength(70)]],
      workPhone: ['', [CustomValidator.required]],
      mobilePhone: ['', [CustomValidator.required]],
      userId: ['', [CustomValidator.required]],
      firstName: ['', [CustomValidator.required, Validators.maxLength(50)]],
      lastName: ['', [CustomValidator.required, Validators.maxLength(50)]],
      email: ['', [CustomValidator.required, CustomValidator.emailValidator, Validators.maxLength(100)]],
      photo: [''],
      description: ['', [CustomValidator.required, Validators.maxLength(250)]],
      dba: ['', [CustomValidator.required, Validators.maxLength(50)]],
      dbaPersonal: ['', [Validators.maxLength(50)]],

      loginAsCompany: [''],
      lastSavedStep: 1,
      latitude: '',
      longitude: '',
      location: '',

      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      preferredStates: [],
      industryTypeMatch: [true]
    });
  }


  initializeSecondForm(): void {
    this.compnayDetailEdit = this._formBuilder.group({
      id: [''],
      userId: ['', [CustomValidator.required]],

      yearFounded: ['', [CustomValidator.required, Validators.maxLength(4)]],
      service: [null, [Validators.required]],

      city: ['', [CustomValidator.required, Validators.maxLength(30)]],
      state: ['', [CustomValidator.required, Validators.maxLength(30)]],
      zipCode: ['', [CustomValidator.required, Validators.maxLength(5)]],

      ssn: ['', [CustomValidator.required, Validators.pattern(COMMON_CONSTANTS.SSN_REGX)]],
      ein: ['', [Validators.pattern(COMMON_CONSTANTS.EIN_REGX)]],

      eins: [false, [CustomValidator.required]],
      websiteURL: ['', [Validators.pattern(COMMON_CONSTANTS.WEBSITE_URL), Validators.maxLength(70)]],
      numberOfEmployee: ['', [CustomValidator.required]],
      industryType: ['', [CustomValidator.required]],
      diversityStatus: ['', [CustomValidator.required]],
      loginAsCompany: [''],
      lastSavedStep: [2, [CustomValidator.required]],
      latitude: [1, [CustomValidator.required]],
      longitude: [1, [CustomValidator.required]],
      location: [1, [CustomValidator.required, Validators.maxLength(200)]],

      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
    });
  }

  getSubcontractorDetail(id: string): Observable<any> {
    const url = API_CONSTANTS.GET_LOGGEDIN_SUBCONTRACTOR_DETAIL + id;
    return this._customHttpService.get(url);
  }

  getSubcontractorProfileDetailById(id: string): Observable<any> {
    const url = API_CONSTANTS.GET_SUBCONTRACTOR_PROFILE_DETAIL + id;
    return this._customHttpService.get(url);
  }

  getSubcontractorPublicProfileDetailById(id: string): Observable<any> {
    const url = API_CONSTANTS.GET_PUBLIC_SUBCONTRACTOR_PROFILE_DETAIL + id;
    return this._customHttpService.getWithoutAuthorization(url);
  }

  getAllSubcontractorDetail(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_SUBCONTRACTOR_PROFILE + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }

  updateSubcontractorProfile(subcontractor) {
    const url = API_CONSTANTS.UPDATE_SUBCONTRACTOR_PROFILE;
    return this._customHttpService.put(url, subcontractor);
  }
  updateListingConfiguration(SubcontractorProfileDto){
    const url = API_CONSTANTS.UPDATE_PROJECT_LISTING_CONFIGURATION;
    return this._customHttpService.put(url, SubcontractorProfileDto);
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

  getProfileForPrivateOrPublic(clientId, subcontractorId): Observable<any> {
    const url = API_CONSTANTS.GET_SUBCONTRACTOR_PROFILE_FOR_PRIVATE_OR_PUBLIC + clientId + '/' + subcontractorId;
    return this._customHttpService.get(url);
  }

}
