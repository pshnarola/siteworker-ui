import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, ReplaySubject, Subject } from "rxjs";
import { CustomHttpService } from "../../customHttp.service";
import { API_CONSTANTS } from '../../../shared/ApiConstants';
import { UINotificationService } from "src/app/shared/notification/uinotification.service";
import { TranslateService } from "@ngx-translate/core";
import { HttpClient, HttpRequest } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class PostProjectService {

    public currentPostProjectStep = new BehaviorSubject(1);
    public addNewProject = new BehaviorSubject(null);
    public jobsiteScreenChange = new BehaviorSubject('jobsiteListing');
    public editProject = new BehaviorSubject(null);

    public getSubcontractorSelectionList = new ReplaySubject(1);



    subject = new Subject<any>();

    constructor(
        private _customHttpService: CustomHttpService,
        private http: HttpClient,
        private _notificationService: UINotificationService,
        private translator: TranslateService
    ) { }

    addNewProjectDetail(addNewProject, message) {
        const url = API_CONSTANTS.ADD_NEW_PROJECT;
        return this._customHttpService.post(url, addNewProject);
        // .subscribe(
        //     e => {
        //         this.subject.next(this._customHttpService.submitResponse(e,message));
        //     }, 
        //     error => {
        //         this._notificationService.error(this.translator.instant('common.error'), '');
        //     });
        //     return this.subject.asObservable();
    }

    updateProjectDetail(projectDetails, message) {
        console.log(projectDetails);
        const url = API_CONSTANTS.UPDATE_PROJECT;
        return this._customHttpService.put(url, projectDetails);
        // .subscribe(
        // e => {
        //     console.log(e);
        //     this.subject.next(this._customHttpService.postProjectResponse(e,message));
        // }, 
        // error => {
        //     this._notificationService.error(this.translator.instant('common.error'), '');
        // });
        // return this.subject.asObservable();
    }

    projectInvitee(projectInviteeDetail) {
        const url = API_CONSTANTS.PROJECT_INVITEE;
        return this._customHttpService.post(url, projectInviteeDetail);
    }

    getAttachment(dataTableParam: URLSearchParams): Observable<any> {
        const url = API_CONSTANTS.GET_ATTACHMENT_OF_PROJECT + '?' + dataTableParam;
        return this._customHttpService.get(url);
        // .subscribe(e => {
        //   this.subject.next(this._customHttpService.parseResponse(e));
        // }, error => {
        //   this._notificationService.error(this.translator.instant('common.error'), '');
        // });
        // return this.subject.asObservable();
    }

    deleteAttachment(id) {
        const url = API_CONSTANTS.DELETE_ATTACHMENT_OF_PROJECT + id;
        this._customHttpService.delete(url).subscribe(e => {
            this.subject.next(this._customHttpService.parseResponse(e));
        }, error => {
            this._notificationService.error(this.translator.instant('common.error'), '');
        });
        return this.subject.asObservable();
    }


    cloneProject(id) {
        const url = API_CONSTANTS.CLONE_PROJECT + id;
        return this._customHttpService.put(url, null);
    }


    getProjectById(id) {
        const url = API_CONSTANTS.GET_PROJECT_DETAIL_BY_ID + id;
        return this._customHttpService.get(url);
    }

    checkClientAccess(id) {
        const url = API_CONSTANTS.VALIDATE_CLIENT_PROFILE + id;
        return this._customHttpService.get(url);
    }

    uploadExcel(excel, userId) {
        const url = API_CONSTANTS.IMPORT_FROM_EXCEL + '?userId=' + userId;
        const req = new HttpRequest('PUT', url, excel, {
            reportProgress: true
        });
        return this.http.request(req);
    }

}
