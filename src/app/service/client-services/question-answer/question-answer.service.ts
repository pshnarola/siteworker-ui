import { Injectable } from "@angular/core";
import { CustomHttpService } from "../../customHttp.service";
import { UINotificationService } from "src/app/shared/notification/uinotification.service";
import { TranslateService } from "@ngx-translate/core";
import { Observable } from "rxjs";
import { API_CONSTANTS } from "src/app/shared/ApiConstants";
import { HttpClient, HttpRequest } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class QuestionAnswerService {

    constructor(private _customHttpService: CustomHttpService,
        private _notificationService: UINotificationService,
        private translator: TranslateService,
        private http: HttpClient){}


        getQuestionAnswerList(dataTableParam: URLSearchParams): Observable<any> {
            const url = API_CONSTANTS.GET_QUESTION_ANSWER_LIST + '?' + dataTableParam;
            return this._customHttpService.get(url);
        }


        submitAnswerOfQuestion(questionAnswerList){
            const url = API_CONSTANTS.SUBMIT_ANSWER;
            return this._customHttpService.put(url,questionAnswerList);
        }

        submitQuestion(questionAnswerList){
            const url = API_CONSTANTS.SUBMIT_QUESTION;
            return this._customHttpService.post(url,questionAnswerList);
        }

        getAttachmentList(dataTableParam: URLSearchParams): Observable<any>{
            const url = API_CONSTANTS.GET_ANSWER_ATTACHMENT_LIST + '?' + dataTableParam;
            return this._customHttpService.get(url);
        }

        uploadAttachmentList(attachmentList){
            const url = API_CONSTANTS.POST_QUESTION_ANSWER_ATTACHMENT;
            return this._customHttpService.post(url,attachmentList);
        }

        deleteAttachemnt(id){
            const url = API_CONSTANTS.DELETE_ATTACHMENT + id;
            return this._customHttpService.delete(url);
        }

        exportToExcel(dataTableParam: URLSearchParams): Observable<any>{
            const url = API_CONSTANTS.EXPORT_TO_EXCEL + '?' + dataTableParam;
            const req = new HttpRequest('GET', url, {
                responseType: 'arraybuffer'
            });
            return  this.http.get(url,{ responseType: 'arraybuffer' });
        }

        downloadDocument(id){
            const url = API_CONSTANTS.DOWLOAD_DOCUMENT + id;
            const req = new HttpRequest('GET', url, {
                responseType: 'arraybuffer'
            });
            return  this.http.get(url,{ responseType: 'arraybuffer' });
        }

        uploadExcel(excel,userId){
            const url = API_CONSTANTS.UPLOAD_EXCEL + userId;
            const req = new HttpRequest('PUT', url, excel, {
                reportProgress: true
              });
            return this.http.request(req);
        }

}