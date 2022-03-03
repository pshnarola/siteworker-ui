import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class WorkerCertificateService {

  constructor(private _customHttpService: CustomHttpService, private http: HttpClient
    , private _formBuilder: FormBuilder,) { }


  // getSubcontractorDetail(id: string): Observable<any> {
  //   const url = API_CONSTANTS.GET_LOGGEDIN_SUBCONTRACTOR_DETAIL + id;
  //   return this._customHttpService.get(url);
  // }

  // updateSubcontractorProfile(subcontractor) {
  //   const url = API_CONSTANTS.UPDATE_SUBCONTRACTOR_PROFILE;
  //   return this._customHttpService.put(url, subcontractor);
  // }

  uploadFile(logo) {
    const url = API_CONSTANTS.UPLOAD_INDUSTRY_LOGO;
    const req = new HttpRequest('PUT', url, logo, {
      reportProgress: true,
      responseType: 'json'
    });
    return this.http.request(req);
  }

  // getFile(fileId: URLSearchParams) {
  //   const url = API_CONSTANTS.GET_INDUSTRY_LOGO + '?' + fileId;
  //   const req = new HttpRequest('GET', url, {
  //     responseType: 'blob'
  //   });
  //   return this.http.request(req);
  // }

  downloadFile(Id) {
    const url = API_CONSTANTS.DOWNLOAD_ZIP_FILE_OF_WORKER_CERTIFICATE + Id;
    // const url = API_CONSTANTS.DOWNLOAD_FILE + '?fileId=' + fileId + '&fileName=' + fileName;
    const req = new HttpRequest('GET', url, {
      responseType: 'arraybuffer'
    });
    return this.http.get(url, { responseType: 'arraybuffer' });
  }

  getCertificateList(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_WORKER_CERTIFICATE_LIST + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }

  addCertificate(certificate) {
    const url = API_CONSTANTS.ADD_WORKER_CERTIFICATE;
    return this._customHttpService.post(url, certificate);
  }

  updateCertificate(certificate) {
    const url = API_CONSTANTS.UPDATE_WORKER_CERTIFICATE;
    return this._customHttpService.put(url, certificate);
  }

  deleteCertificate(certificateId) {
    const url = API_CONSTANTS.DELETE_WORKER_CERTIFICATE + certificateId;
    return this._customHttpService.delete(url);
  }

  deleteDocument(documentId,certificateId) {
    const url = API_CONSTANTS.DELETE_DOCUMENTS_OF_WORKER_CERTIFICATE + '?fileId=' + documentId + '&id=' + certificateId;
    return this._customHttpService.delete(url);
  }
  // tslint:disable-next-line: typedef
  rejectCertificates(approveRejectCertificateDTO){
    const url = API_CONSTANTS.REJECT_WORKER_CERTIFICATE;
    return this._customHttpService.put(url, approveRejectCertificateDTO);
  }
  // tslint:disable-next-line: typedef
  approveCertificates(approveRejectCertificateDTO){
    const url = API_CONSTANTS.APPROVE_WORKER_CERTIFICATE;
    return this._customHttpService.put(url, approveRejectCertificateDTO);
  }
}
