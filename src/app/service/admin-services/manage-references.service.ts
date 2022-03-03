import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class ManageReferencesService {

  constructor(private customHttpService: CustomHttpService, private http: HttpClient) { }


  getWorkerReferences(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_REFERENCES_FOR_WORKER + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }
  // tslint:disable-next-line: typedef
  rejectReferences(approveRejectReferenceDTO){
    const url = API_CONSTANTS.REJECT_REFERENCE;
    return this.customHttpService.put(url, approveRejectReferenceDTO);
  }
  // tslint:disable-next-line: typedef
  approveReferences(approveRejectReferenceDTO){
    const url = API_CONSTANTS.APPROVE_REFERENCE;
    return this.customHttpService.put(url, approveRejectReferenceDTO);
  }


  getSubcontractorReferences(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_REFERENCES_FOR_SUBCONTRACOR + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }
  // tslint:disable-next-line: typedef
  rejectSubcontractorReferences(approveRejectReferenceDTO){
    const url = API_CONSTANTS.REJECT_SUBCONTRACTOR_REFERENCE;
    return this.customHttpService.put(url, approveRejectReferenceDTO);
  }
  // tslint:disable-next-line: typedef
  approveSubcontractorReferences(approveRejectReferenceDTO){
    const url = API_CONSTANTS.APPROVE_SUBCONTRACTOR_REFERENCE;
    return this.customHttpService.put(url, approveRejectReferenceDTO);
  }

  updateCommentOfSubcontractor(referenceDTO){
    const url = API_CONSTANTS.UPDATE_COMMENT_SUBCONTRACTOR;
    console.log(url);
    return this.customHttpService.putWithoutAuthorization(url, referenceDTO);
  }

  updateCommentOfWorker(referenceDTO){
    const url = API_CONSTANTS.UPDATE_COMMENT_WORKER;
    return this.customHttpService.putWithoutAuthorization(url, referenceDTO);
  }

  getSubcontractorReferenceDetailById(id){
    const url = API_CONSTANTS.GET_SUBCONTRACTOR_REFERENCE_DETAIL + id;
    return this.customHttpService.getWithoutAuthorization(url);
  }

  getWorkerReferenceDetailById(id){
    const url = API_CONSTANTS.GET_WORKER_REFERENCE_DETAIL + id;
    return this.customHttpService.getWithoutAuthorization(url);
  }



}
