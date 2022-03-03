import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { CustomHttpService } from "../../customHttp.service";
import { API_CONSTANTS } from '../../../shared/ApiConstants';
import { UINotificationService } from "src/app/shared/notification/uinotification.service";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
    providedIn: 'root'
})
export class LineItemService {

    public lineItemIdTransfer = new BehaviorSubject(null);

    subject = new Subject<any>();

    constructor(private _customHttpService: CustomHttpService,
        private _notificationService: UINotificationService,
        private translator: TranslateService) { }

    addNewLineItem(lineItem, message) {
        const url = API_CONSTANTS.ADD_NEW_LINE_ITEM;
        return this._customHttpService.post(url, lineItem);
        // .subscribe(
        // e => {
        //     this.subject.next(this._customHttpService.submitResponse(e,message));
        // }, 
        // error => {
        //     this._notificationService.error(this.translator.instant('common.error'), '');
        // });
        // return this.subject.asObservable();
    }

    getUnassignedLineItem(jobsiteId): Observable<any> {
        const url = API_CONSTANTS.GET_UNASSIGNED_LINE_ITEM + jobsiteId;
        return this._customHttpService.get(url);
        // .subscribe(e => {
        //   this.subject.next(this._customHttpService.parseResponse(e));
        // }, error => {
        //   this._notificationService.error(this.translator.instant('common.error'), '');
        // });
        // return this.subject.asObservable();
    }

    getLineItem(dataTableParam: URLSearchParams): Observable<any> {
        const url = API_CONSTANTS.GET_LINE_ITEM + '?' + dataTableParam;
        this._customHttpService.get(url).subscribe(e => {
            this.subject.next(this._customHttpService.parseResponse(e));
        }, error => {
            this._notificationService.error(this.translator.instant('common.error'), '');
        });
        return this.subject.asObservable();
    }

    deleteLineItemById(id, message) {
        const url = API_CONSTANTS.DELETE_LINE_ITEM + id;
        return this._customHttpService.put(url, null);
        //   e => {
        //       this.subject.next(this._customHttpService.submitResponse(e,message));
        //   },
        //   error => {
        //       this._notificationService.error(this.translator.instant('common.error'), '');
        //   });
        //   return this.subject.asObservable();
    }

    updateItem(lineItem, message) {
        const url = API_CONSTANTS.UPDATE_LINE_ITEM;
        return this._customHttpService.put(url, lineItem);
        // .subscribe(
        // e => {
        //     this.subject.next(this._customHttpService.submitResponse(e,message));
        // },
        // error => {
        //     this._notificationService.error(this.translator.instant('common.error'), '');
        // });
        // return this.subject.asObservable();
    }
}
