import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { API_CONSTANTS } from '../shared/ApiConstants';
import { CustomHttpService } from './customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class FilterLeftPanelDataService {
  

  constructor(private _customHttpService: CustomHttpService) { }

  jobListFilter = new Subject<any>();
  projectListFilter = new Subject<any>();
  jobSiteListFilter = new Subject<any>();
  // Observable to refresh side panel list for project/Job
  private deleteJobOrProject = new BehaviorSubject('default message');
  currentDeleteStatus = this.deleteJobOrProject.asObservable();

  updateDeleteSatus(status: string): any {
    this.deleteJobOrProject.next(status);
  }

  getWorkerByName(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_WORKER + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }
  getWorkerByNameForPendingCertificatesForAdmin(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_WORKER_FOR_PENDING_CERTIFICATE_BY_ADMIN + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }
  getWorkerByNameForDueInvoicesForAdmin(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_WORKER_NAME_FOR_DUE_INVOICES_FOR_ADMIN + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }

  getClientByContactName(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_CLIENT_BY_CONTACT_NAME + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }
  getClientByContactNameForApprovalPendingAdmin(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_CONTACT_NAME_FOR_PENDING_APPROVAL_BY_ADMIN + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }

  getSubcontractorByName(dataTableParam: URLSearchParams){
    const url = API_CONSTANTS.GET_SUBCONTRACTOR + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }

  getSubcontractorByNameVirtualScroll(dataTableParam: URLSearchParams){
    const url = API_CONSTANTS.GET_SUBCONTRACTOR_VIRTUAL_SCROLL + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getSubcontractorByNameForPendingCertificatesForAdmin(dataTableParam: URLSearchParams){
    const url = API_CONSTANTS.GET_SUBCONTRACTOR_NAME_FOR_PENDING_CERTIFICATES_FOR_ADMIN + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getSubcontractorByNameForDueInvoicesForAdmin(dataTableParam: URLSearchParams){
    const url = API_CONSTANTS.GET_SUBCONTRACTOR_NAME_FOR_DUE_INVOICES_FOR_ADMIN + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getClientByName(dataTableParam: URLSearchParams){
    const url = API_CONSTANTS.GET_CLIENT + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }
  getCityForJob(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_JOB_CITY + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getStateForJob(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_JOB_STATE + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }

  getStateForPostProject(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_POST_PROJECT_STATE + '?' + dataTableParam;
    return this._customHttpService.get(url);
  }
  getRegionForJob(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_JOB_REGION + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getJobTitleForClient(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_JOB_TITLE_FOR_CLIENT + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getJobTitleForClientWithoutCancelledAndCompleted(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_JOB_TITLE_FOR_CLIENT_WITHOUT_CANCELLED_COMPLETED + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getJobTitleForClientWithoutCancelledAndCompletedAndDraft(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_JOB_TITLE_FOR_CLIENT_WITHOUT_CANCEL_AND_COMPLETED_AND_DRAFT + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getJobTitleForClientWithoutCancelled(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_JOB_TITLE_FOR_CLIENT_WITHOUT_CANCELLED + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getJobTitleForAdminForSetMargin(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_JOB_TITLES_FOR_ADMIN_FOR_SET_MARGIN + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getJobTitleForAdminForTimesheet(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_JOB_TITLES_FOR_ADMIN_FOR_TIMESHEET + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getChangeRequestTitleForClient(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_CHANGE_REQUEST_TITLE_FOR_CLIENT + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }

  getChangeRequestTitleForSupervisor(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_CHANGE_REQUEST_TITLE_FOR_SUPERVISOR + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }

  getProjectTitleForClient(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_PROJECT_TITLE_FOR_CLIENT + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getProjectTitleForClientWithoutCompletedAndCancelled(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_PROJECT_TITLE_FOR_CLIENT_WITHOUT_COMPLETED_CANCELLED + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getProjectTitleForClientWithoutCompletedAndCancelledAndDraft(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_PROJECT_TITLE_FOR_CLIENT_WITHOUT_COMPLETED_CANCELLED_DRAFT + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }

  getProjectTitleForSubcontractor(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_PROJECT_TITLE_FOR_SUBCONTRACTOR + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getProjectTitleForAdminForSetMargin(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_PROJECT_TITLES_FOR_ADMIN_FOR_SET_MARGIN + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getProjectTitlesForSubcontractorForBidedFavAndGotInvitations(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_PROJECT_TITLES_FOR_SUBCONTRACTOR_FOR_BIDED_FAV_AND_GOT_INVITATIONS + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getProjectTitlesForSubcontractorForAcceptReject(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_PROJECT_TITLES_FOR_SUBCONTRACTOR_FOR_ACCEPT_REJECT + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getProjectTitlesForSubcontractorForOfferedAccepted(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_PROJECT_TITLES_FOR_SUBCONTRACTOR_FOR_OFFERED_ACCEPTED + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getProjectTitlesForSubcontractorForOfferedAcceptedApplied(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_PROJECT_TITLES_FOR_SUBCONTRACTOR_FOR_OFFERED_ACCEPTED_APPLIED + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getProjectTitlesForSubcontractorForCompletedCancelled(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_PROJECT_TITLES_FOR_SUBCONTRACTOR_FOR_COMPLETED_CANCELLED + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }

  getClientForProject(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_COMPANY_FOR_PROJECT + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }

  getClientForProjectBySubcontractor(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_COMPANY_FOR_PROJECT_BY_SUBCONTRACTOR + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }

  getStateForProject(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_STATE_FOR_PROJECT + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }

  getCityForProject(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_CITY_FOR_PROJECT + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }

  getIndustryForProject(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_INDUSTRY_FOR_PROJECT + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }

  getIndustryForProjectBySubcontractor(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_INDUSTRY_FOR_PROJECT_BY_SUBCONTRACTOR + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }

  getUserDetailByName(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_USER_DETAIL_BY_USER_NAME + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }

  getRegionForProject(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_REGION_FOR_PROJECT + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }

  getJobsiteTitleForClient(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_JOBSITE_TITLE_FOR_CLIENT + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getJobsiteTitleForClientWithoutCompletedCancelled(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_JOBSITE_TITLE_FOR_CLIENT_WITHOUT_CANCELLED_COMPLETED + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }

  getJobsiteTitleForSubcontractor(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_JOBSITE_TITLE_FOR_SUBCONTRACTOR + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }

  getStateForJobsite(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_STATE_FOR_JOBSITE + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }

  getCityForJobsite(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_CITY_FOR_JOBSITE + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getJobTitleForWorker(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_JOB_TITLE_FOR_WORKER + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getMasterJobTitleOfWorker(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_MASTER_JOB_TITLE_OF_WORKER + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }

  getpostedByForProject(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_POSTED_BY_FORpROJECT + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }

  getAcceptedJobTitleForWorker(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_ACCEPTED_JOB_TITLE_FOR_WORKER + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getOfferedJobTitleForWorker(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_OFFERED_JOB_TITLE_FOR_WORKER + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getCompletedCancelledAcceptedJobTitleForWorker(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_COMPLETED_CANCELLED_ACCEPTED_JOB_TITLE_FOR_WORKER + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getApplyJobTitleForWorker(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_APPLY_JOB_TITLE_FOR_WORKER + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getAllSubContractorReferenceName(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_ALL_SUB_CONTRACTOR_REFERENCE_NAME + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getAllWorkerReferenceName(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_ALL_WORKER_REFERENCE_NAME + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }

  getClientAndCompanyName(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_ALL_CLIENT_AND_COMPANY_NAME + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }

  getClientByNameForClientListForAdmin(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_COMPANY_NAME_FOR_CLIENT_LIST_FOR_ADMIN + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getAllIndustryForClientByName(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_ALL_INDUSTRY_FOR_CLIENT + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getAllCompanyNameForClient(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_ALL_COMPANY_NAME_FOR_CLIENT + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getWorkerByNameVirtualScroll(dataTableParam: URLSearchParams){
    const url = API_CONSTANTS.GET_WORKER_VIRTUAL_SCROLL + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getCity(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_CITY_FOR_PROJECT_JOB + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getCityForPostProject(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.GET_CITY_FOR_POST_PROJECT + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }

  getSubcontractorByNameForAdminProjectInvoice(dataTableParam: URLSearchParams){
    const url = API_CONSTANTS.GET_SUBCONTRACTOR_FOR_ADMIN_PROJECT_INVOICE + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getWorkerByNameForAdminJobInvoice(dataTableParam: URLSearchParams){
    const url = API_CONSTANTS.GET_WORKER_FOR_ADMIN_JOB_INVOICE + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
  getSubcontractorByNameForAdminCloseout(dataTableParam: URLSearchParams){
    const url = API_CONSTANTS.GET_SUBCONTRACTOR_FOR_ADMIN_CLOSE_OUT_PACKAGE + '?' + dataTableParam ;
    return this._customHttpService.get(url);
  }
}
