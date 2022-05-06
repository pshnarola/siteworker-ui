import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
    providedIn: 'root'
})
export class JobDetailService {

    subject = new Subject<any>();
    editJobSubject = new BehaviorSubject<any>(null);

    constructor(private customHttpService: CustomHttpService) { }

    getJobDetailList(dataTableParam: URLSearchParams): Observable<any> {
        const url = API_CONSTANTS.GET_JOB_LIST + '?' + dataTableParam;
        return this.customHttpService.get(url);
    }

    getJobDetailListForSidebar(dataTableParam: URLSearchParams): Observable<any> {
        const url = API_CONSTANTS.GET_JOB_LIST_FOR_SIDE_BAR + '?' + dataTableParam;
        return this.customHttpService.get(url);
    }

    getJobDetailCustom(dataTableParam: URLSearchParams): Observable<any> {
        const url = API_CONSTANTS.GET_JOB_DETAIL_CUSTOM + '?' + dataTableParam;
        return this.customHttpService.get(url);
    }

    getJobById(jobId: string): Observable<any> {
        const url = API_CONSTANTS.GET_JOB_BY_ID + jobId;
        this.customHttpService.get(url).subscribe(e => {
            this.subject.next(this.customHttpService.parseResponse(e));
        });
        return this.subject.asObservable();
    }
    getJobId(jobId: string): Observable<any> {
        const url = API_CONSTANTS.GET_JOB_BY_ID + jobId;
        return this.customHttpService.get(url);
    }

    cloneJob(id: string): Observable<any> {
        const url = API_CONSTANTS.JOBID + id;
        return this.customHttpService.put(url, '');
    }

    checkIfJobDetailsChanged(jobId: string): Observable<any> {
        const url = API_CONSTANTS.CHECK_IF_JOB_DETAILS_CHANGED + jobId;
        return this.customHttpService.get(url);
    }
    findDetailsByIdPublic(jobId: string): Observable<any> {
        const url = API_CONSTANTS.GET_DETAIL_BY_ID_PUBLIC + jobId;
        return this.customHttpService.getWithoutAuthorization(url);
    }
    getJobs(dataTableParam: URLSearchParams): Observable<any> {
        const url = API_CONSTANTS.GET_JOB + '?' + dataTableParam;
        this.customHttpService.get(url).subscribe(e => {
            this.subject.next(this.customHttpService.parseResponse(e));
        });
        return this.subject.asObservable();
    }
    setStatus(dataTableParam: URLSearchParams): Observable<any> {
        const url = API_CONSTANTS.SET_STATUS + '?' + dataTableParam;
        return this.customHttpService.put(url, '');
    }
    assignSupervisor(dataTableParam: URLSearchParams): Observable<any> {
        const url = API_CONSTANTS.ASSIGN_JOB_SUPERVISOR + '?' + dataTableParam;
        return this.customHttpService.put(url, '');
    }
    // tslint:disable-next-line: typedef
    getDataForJobMargin(jobId) {
        const url = API_CONSTANTS.GET_DATA_FOR_JOB_MARGIN + jobId;
        return this.customHttpService.get(url);
    }
    updatePayRate(jobDetailDTO) {
        const url = API_CONSTANTS.UPDATE_DATA_FOR_JOB_MARGIN;
        return this.customHttpService.put(url, jobDetailDTO);

    }
    checkIsJobBided(jobId) {
        const url = API_CONSTANTS.CHECK_IS_JOB_BIDED + jobId;
        return this.customHttpService.get(url);
    }

    setUpdatedDateForJob(id: string): Observable<any> {
        const url = API_CONSTANTS.UPDATE_JOB_UPDATED_DATE + '?id=' + id;
        return this.customHttpService.put(url, '');
    }

    deleteJob(jobId: string): Observable<any> {
        const url = API_CONSTANTS.DELETE_JOB + jobId;
        return this.customHttpService.delete(url);
    }

}
