import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectBidService {

  constructor(private _customHttpService: CustomHttpService, private http: HttpClient) { }

  getAllProjectBidDetail(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_PROJECT_BID_DETAIL + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }

  getAllJobsitetBidDetail(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_JOBSITE_BID_DETAIL + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }

  addProjectBidDetail(projectBidDto) {
    const url = API_CONSTANTS.ADD_PROJECT_BID_DETAIL;
    return this._customHttpService.post(url, projectBidDto);
  }

  updateProjectBidDetail(projectBidDto) {
    const url = API_CONSTANTS.ADD_JOBSITE_BID_DETAIL;
    return this._customHttpService.post(url, projectBidDto);
  }

  getBiddedData(projectId, subcontractorId) {
    const url = API_CONSTANTS.GET_PROJECT_BID_DETAILBY_ID + `?projectDetailId=${projectId}&subContractorId=${subcontractorId}`;
    return this._customHttpService.get(url);
  }

  getBiddedDataOfProjectAndListOfJobsite(projectId, subcontractorId) {
    const url = API_CONSTANTS.GET_PROJECT_BID_DETAIL_BY_ID + `?projectDetailId=${projectId}&subContractorId=${subcontractorId}`;
    return this._customHttpService.get(url);
  }

  getBiddedDataOfJobsite(jobSiteId, subcontractorId) {
    const url = API_CONSTANTS.GET_JOBSITE_BID_DETAIL_BY_ID + `?jobSiteId=${jobSiteId}&subContractorId=${subcontractorId}`;
    return this._customHttpService.get(url);
  }

  submitBid(dto) {
    const url = API_CONSTANTS.SUBMIT_BID_DETAIL;
    return this._customHttpService.put(url, dto);
  }
  acceptProject(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.ACCEPT_PROJECT + '?' + dataTableParam;
    return this._customHttpService.put(url, '');
  }
  rejectProject(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.REJECT_PROJECT + '?' + dataTableParam;
    return this._customHttpService.put(url, '');
  }
  acceptJobsite(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.ACCEPT_JOBSITE + '?' + dataTableParam;
    return this._customHttpService.put(url, '');
  }
  rejectJobsite(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.REJECT_JOBSITE + '?' + dataTableParam;
    return this._customHttpService.put(url, '');
  }
  getCloseout(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_CLOSEOUT + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }
  // tslint:disable-next-line: typedef
  addSubmitCloseoutRequest(closeoutRequestDTO) {
    const url = API_CONSTANTS.ADD_SUBMIT_REQUEST;
    return this._customHttpService.put(url, closeoutRequestDTO);
  }
  // tslint:disable-next-line: typedef
  downloadCloseOutDocuments(id) {
    const url = API_CONSTANTS.DOWNLOAD_CLOSEOUT_DOCUMENTS + id;
    const req = new HttpRequest('GET', url, {
      responseType: 'arraybuffer'
    });
    return this.http.get(url, { responseType: 'arraybuffer' });
  }
  getCloseOutDocuments(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_CLOSEOUT_ATTACHMENT + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }
  // tslint:disable-next-line: typedef
  saveEditCloseoutAttachments(closeoutRequestDTO) {
    const url = API_CONSTANTS.SAVE_EDIT_CLOSEOUT_ATTACHMENTS;
    return this._customHttpService.put(url, closeoutRequestDTO);
  }
  // tslint:disable-next-line: typedef
  deleteAttachment(id) {
    const url = API_CONSTANTS.DELETE_CLOSEOUT_ATTACHMENT + id;
    return this._customHttpService.delete(url);
  }
  // tslint:disable-next-line: typedef
  rejectCloseOutRequest(approveRejectDTO) {
    const url = API_CONSTANTS.REJECT_CLOSEOUT;
    return this._customHttpService.put(url, approveRejectDTO);
  }
  // tslint:disable-next-line: typedef
  approveCloseOutRequest(approveRejectDTO) {
    const url = API_CONSTANTS.APPROVE_CLOSEOUT;
    return this._customHttpService.put(url, approveRejectDTO);
  }
  getRejectCloseOutReason(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_REJECT_CLOSEOUT_REASON + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }
  // tslint:disable-next-line: typedef
  downloadSubContractorInvoice(dataTableParam: URLSearchParams) {
    const url = API_CONSTANTS.DOWNLOAD_SUBCONTRACTOR_INVOICE + '?' + dataTableParam;
    const req = new HttpRequest('GET', url, {
      responseType: 'arraybuffer'
    });
    return this.http.get(url, { responseType: 'arraybuffer' });
  }
  validateProjectOrJobsiteBidded(projectId) {
    const url = API_CONSTANTS.CHECK_PROJECT_BID_OR_JOBSITE_BIDDED + projectId;
    return this._customHttpService.get(url);
  }

  validateProjectOrJobsiteisUptodate(projectId): Observable<any> {
    const url = `${API_CONSTANTS.CHECK_PROJECT_IS_CHANGED}${projectId}`;
    return this._customHttpService.get(url);
  }

}
