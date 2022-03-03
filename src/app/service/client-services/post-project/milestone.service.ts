import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { CustomHttpService } from "../../customHttp.service";
import { API_CONSTANTS } from '../../../shared/ApiConstants';
import { UINotificationService } from "src/app/shared/notification/uinotification.service";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
    providedIn: 'root'
})
export class MilestoneService {

    subject = new Subject<any>();

    constructor(private _customHttpService: CustomHttpService,
        private _notificationService: UINotificationService,
        private translator: TranslateService) { }

    addNewMilestone(milestone, message) {
        const url = API_CONSTANTS.ADD_NEW_MILESTONE;
        console.log(milestone);
        return this._customHttpService.post(url, milestone);
        // .subscribe(
        // e => {
        //     this.subject.next(this._customHttpService.submitResponse(e,message));
        // }, 
        // error => {
        //     this._notificationService.error(this.translator.instant('common.error'), '');
        // });
        // return this.subject.asObservable();
    }

    updateMilestone(milestone, message) {
        const url = API_CONSTANTS.UPDATE_PAYMENT_MILESTONE;
        return this._customHttpService.put(url, milestone);
        // .subscribe(
        // e => {
        //     this.subject.next(this._customHttpService.submitResponse(e,message));
        // }, 
        // error => {
        //     this._notificationService.error(this.translator.instant('common.error'), '');
        // });
        // return this.subject.asObservable();
    }


    deleteMilestoneById(milestoneId, message) {
        const url = API_CONSTANTS.DELETE_MILESTONE_BY_ID + milestoneId;
        return this._customHttpService.put(url, null);
        // e => {
        //     this.subject.next(this._customHttpService.submitResponse(e,message));
        // }, 
        // error => {
        //     this._notificationService.error(this.translator.instant('common.error'), '');
        // });
        // return this.subject.asObservable();
    }

    getAllMilestone(dataTableParam: URLSearchParams): Observable<any> {
        const url = API_CONSTANTS.GET_MILESTONE + '?' + dataTableParam;
        return this._customHttpService.get(url);
        //     this.subject.next(this._customHttpService.parseResponse(e));
        // }, error => {
        //     this._notificationService.error(this.translator.instant('common.error'), '');
        // });
        // return this.subject.asObservable();
    }
}