import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class LicenseService {

  constructor(private _customHttpService: CustomHttpService, private http: HttpClient
    , private _formBuilder: FormBuilder,) { }


  getSubcontractorDetail(id: string): Observable<any> {
    const url = API_CONSTANTS.GET_LOGGEDIN_SUBCONTRACTOR_DETAIL + id;
    return this._customHttpService.get(url);
  }

  updateSubcontractorProfile(subcontractor) {
    const url = API_CONSTANTS.UPDATE_SUBCONTRACTOR_PROFILE;
    return this._customHttpService.put(url, subcontractor);
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

  downloadFile(licenseId) {
    const url = API_CONSTANTS.DOWNLOAD_ZIP_FILE + licenseId;
    // const url = API_CONSTANTS.DOWNLOAD_FILE + '?fileId=' + fileId + '&fileName=' + fileName;
    const req = new HttpRequest('GET', url, {
      responseType: 'arraybuffer'
    });
    return this.http.get(url, { responseType: 'arraybuffer' });
  }

  getLIcenseList(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_LICENSE + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }

  addLicense(license) {
    const url = API_CONSTANTS.ADD_LICENSE;
    return this._customHttpService.post(url, license);
  }

  updateLicense(license) {
    const url = API_CONSTANTS.UPDATE_LICENSE;
    return this._customHttpService.put(url, license);
  }

  deleteLicense(licenseId) {
    const url = API_CONSTANTS.DELETE_LICENSE + licenseId;
    return this._customHttpService.delete(url);
  }

  deleteDocument(documentId,licenseId) {
    const url = API_CONSTANTS.DELETE_DOCUMENTS + '?fileId=' + documentId + '&id=' + licenseId;
    return this._customHttpService.delete(url);
  }

}
