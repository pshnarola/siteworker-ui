import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { CustomHttpService } from "../../customHttp.service";
import { API_CONSTANTS } from '../../../shared/ApiConstants';
import { UINotificationService } from "src/app/shared/notification/uinotification.service";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
    providedIn: 'root'
})
export class JobsiteService {

    public jobsiteIdTransfer = new BehaviorSubject('');

    subject = new Subject<any>();

    constructor(private _customHttpService: CustomHttpService,
        private _notificationService: UINotificationService,
        private translator: TranslateService) { }

    addNewJobsiteDetail(jobsite, message) {
        console.log(jobsite);
        const url = API_CONSTANTS.ADD_NEW_JOBSITE;
        return this._customHttpService.post(url, jobsite);
        // .subscribe(
        // e => {
        //     this.subject.next(this._customHttpService.submitResponse(e,message));
        // }, 
        // error => {
        //     this._notificationService.error(this.translator.instant('common.error'), '');
        // });
        // return this.subject.asObservable();
    }

    getAllJobsite(dataTableParam: URLSearchParams): Observable<any> {
        const url = API_CONSTANTS.GET_ALL_JOBSITE + '?' + dataTableParam;
        return this._customHttpService.get(url);
        // .subscribe(e => {
        //   this.subject.next(this._customHttpService.parseResponse(e));
        // }, error => {
        //   this._notificationService.error(this.translator.instant('common.error'), '');
        // });
        // return this.subject.asObservable();
    }

    editJobsiteDetail(jobsite, message) {
        console.log(jobsite);
        const url = API_CONSTANTS.EDIT_JOBSITE;
        console.log(jobsite);
        return this._customHttpService.put(url, jobsite);
        // this._customHttpService.put(url, jobsite).subscribe(
        // e => {
        //     this.subject.next(this._customHttpService.submitResponse(e,message));
        // }, 
        // error => {
        //     this._notificationService.error(this.translator.instant('common.error'), '');
        // });
        // return this.subject.asObservable();
    }

    deleteJobsiteByJobsiteId(jobsiteId, message) {
        const url = API_CONSTANTS.DELETE_JOBSITE_BY_ID + jobsiteId;
        return this._customHttpService.put(url, null);
        // this._customHttpService.put(url, null).subscribe(
        //     e => {
        //         this.subject.next(this._customHttpService.submitResponse(e,message));
        //     }, 
        //     error => {
        //         this._notificationService.error(this.translator.instant('common.error'), '');
        //     });
        //     return this.subject.asObservable();
    }

    updateCostOfJobsite(id) {
        const url = API_CONSTANTS.UPDATE_COST_OF_JOBSITE + id;
        return this._customHttpService.put(url, null);
        // .subscribe(
        // e => {
        //     this.subject.next(this._customHttpService.submitResponse(e,''));
        // }, 
        // error => {
        //     this._notificationService.error(this.translator.instant('common.error'), '');
        // });
        // return this.subject.asObservable();
    }


    deleteJobsiteAttachment(id) {
        const url = API_CONSTANTS.DELETE_JOBSITE_ATTACHEMNT + id;
        return this._customHttpService.delete(url);
    }

    getAllJobsiteList(dataTableParam: URLSearchParams): Observable<any> {
        const url = API_CONSTANTS.GET_ALL_JOBSITE + '?' + dataTableParam;
        return this._customHttpService.get(url);
    }
}