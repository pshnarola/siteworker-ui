import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { CustomHttpService } from '../../customHttp.service';

@Injectable({
    providedIn: 'root'
})
export class LineItemTemplateService {

    subject = new Subject<any>();

    constructor(private _customHttpService: CustomHttpService,
        private _notificationService: UINotificationService,
        private translator: TranslateService){}

    getTemplateList(dataTableParam: URLSearchParams): Observable<any> {
        const url = API_CONSTANTS.GET_TEMPLATE_LIST + '?' + dataTableParam;
        return this._customHttpService.get(url);
    }

    addNewTemplate(lineItem){
        const url = API_CONSTANTS.ADD_TEMPLATE;
        return this._customHttpService.post(url, lineItem);
    }

    updateItem(lineItem){
        const url = API_CONSTANTS.UPDATE_TEMPLATE;
        return this._customHttpService.put(url, lineItem);
    }

    deleteItem(id){
        const url = API_CONSTANTS.DELETE_TEMPLATE + id;
        return this._customHttpService.delete(url);
    }

}