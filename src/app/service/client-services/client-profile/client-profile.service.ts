import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { environment } from 'src/environments/environment';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class ClientProfileService {
  clientEditForm: FormGroup;
  loginUserId;


  constructor(
    private _customHttpService: CustomHttpService,
    private http: HttpClient,
    private _formBuilder: FormBuilder
  ) { }

  initializeForm(): void {
    this.clientEditForm = this._formBuilder.group({
      id: [],
      companyName: ['', [CustomValidator.required, Validators.maxLength(50)]],
      companyPhone: ['', [CustomValidator.required]],
      contactPhone: ['', [CustomValidator.required]],
      contactName: ['', [CustomValidator.required, Validators.maxLength(50)]],
      contactEmail: ['', [CustomValidator.required, CustomValidator.emailValidator, Validators.maxLength(100)]],
      user: this._formBuilder.group({
        id: ['', [CustomValidator.required]],
        firstName: ['', [CustomValidator.required]],
        lastName: ['', [CustomValidator.required]],
        email: ['', [CustomValidator.required, CustomValidator.emailValidator, Validators.maxLength(100)]],
      }),
      yearFounded: ['', [CustomValidator.required, Validators.maxLength(4)]],
      photo: [''],
      numberOfEmployee: ['', [Validators.required]],
      dunNumber: ['', [Validators.maxLength(50)]],
      companyDescription: ['', [CustomValidator.required, Validators.maxLength(300)]],
      city: ['', [CustomValidator.required, Validators.maxLength(30)]],
      state: ['', [CustomValidator.required, Validators.maxLength(30)]],
      zipCode: ['', [CustomValidator.required, Validators.maxLength(6)]],
      legalCompanyName: [''],
      designation: [''],
      lastSavedStep: 1,
      isProjectAccess: '',
      isJobAccess: '',
      isProjectApproved: '',
      isJobApproved: '',
      isProjectMSAccepted: '',
      isJobMSAccepted: '',
      latitude: '',
      longitude: '',
      location: ['', [CustomValidator.required, Validators.maxLength(100)]],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      createdDate: [],
      updatedDate: [],

      // jobInviteeConfiguration: this._formBuilder.group({
      //   id: [],
      //   states: [],
      //   jobTitleMatch: [],
      //   certificateMatch: [],
      //   avgRatingMax: [],
      //   avgRatingMin: [],
      //   successRatioMax: [],
      //   successRatioMin: [],
      //   createdBy: [],
      // }),

      // projectInviteeConfiguration: this._formBuilder.group({
      //   id: [],
      //   states: [],
      //   avgRatingMax: [],
      //   avgRatingMin: [],
      //   industryMatch: [],
      //   successRatioMax: [],
      //   successRatioMin: [],
      //   createdBy: [],
      // }),

      // rangeValuesProjectSuccessRatio: [[0, 0]],
      // rangeValuesJobSuccessRatio: [[0, 0]],
      // rangeValuesJobAverageRating: [[0, 0]],
      // rangeValuesProjectAverageRating: [[0, 0]],
      // industryMatch: [false],
      // certificateMatch: [false],
      // jobTitleMatch: [false],
      // preferedStateProject: [],
      // preferedStateJob: [],
    });

  }

  getClientDetail(id: string): Observable<any> {
    const url = API_CONSTANTS.GET_LOGGEDIN_CLIENT_DETAIL + id;
    return this._customHttpService.get(url);
  }

  getClientProfileDetailById(id: string): Observable<any> {
    const url = API_CONSTANTS.GET_CLIENT_PROFILE_DETAIL + id;
    return this._customHttpService.get(url);
  }

  updateClientProfile(client) {
    const url = API_CONSTANTS.UPDATE_CLIENT_PROFILE;
    return this._customHttpService.put(url, client);
  }



  getActiveMsaByClient(id: string, type: string): Observable<any> {
    const url = API_CONSTANTS.GET_ACTIVE_MSA + id + '/' + type;
    return this._customHttpService.get(url);
  }

  acceptClientMSA(msaId, clientId) {
    const url = API_CONSTANTS.ACCEPT_CLIENT_MSA + msaId + '/' + clientId;
    return this._customHttpService.put(url, "client msa accept");
  }

  getLatestAcceptedClientMSA(clientId, type) {
    const url = API_CONSTANTS.GET_LATEST_ACCEPTED_CLIENT_MSA + clientId + '/' + type;
    return this._customHttpService.get(url);
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

  // downloadFile(fileId, fileName) {
  //   const url = API_CONSTANTS.DOWNLOAD_FILE + '?fileId=' + fileId + '&fileName=' + fileName;
  //   return this._customHttpService.get(url);
  // }

  downloadFile(fileId, fileName) {
    const url = API_CONSTANTS.DOWNLOAD_FILE + '?fileId=' + fileId + '&fileName=' + fileName;
    const req = new HttpRequest('GET', url, {
      responseType: 'arraybuffer'
    });
    return this.http.get(url, { responseType: 'arraybuffer' });
  }

  getImage(id) {
    let image
    const url = environment.baseURL + "/file/getById?fileId=" + id;
    this.http.get(url).subscribe(
      data => {
        image = data;
      }
    );
    return image
  }

  toggleProjectAccess(client) {
    const url = API_CONSTANTS.CLIENT_PROJECT_JOB_ACCESS;
    return this._customHttpService.put(url, client);
  }

  toggleJobAccessAccess(client) {
    const url = API_CONSTANTS.CLIENT_PROJECT_JOB_ACCESS;
    return this._customHttpService.put(url, client);
  }

  updateInviteeConfiguration(client) {
    const url = API_CONSTANTS.UPDATE_INVITEE_CONFIGURATION;
    return this._customHttpService.put(url, client);
  }

}
