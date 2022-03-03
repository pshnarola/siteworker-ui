import { RequestMethod, ResponseContentType } from '@angular/http';

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { ResponseVO } from '../shared/vo/ResponseVO';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { NotificationService } from '../shared/error/error.service';
import { LocalStorageService } from './localstorage.service';
import { ErrorComponent } from '../shared/error/error.component';
import { UINotificationService } from '../shared/notification/uinotification.service';
import { JobsiteStatus } from '../module/client/enums/jobsiteStatus';
import { TranslateService } from '@ngx-translate/core';




@Injectable()
export class CustomHttpService {
    constructor(private httpClient: HttpClient, private router: Router,private translator: TranslateService,
        private errorService: NotificationService, private localStorageService: LocalStorageService, private uiNotificationService: UINotificationService
    ) { }


    post(url: string, body: string): Observable<any> {
        const requestOptions = this.getRequestOptions();

        return this.httpClient.post(url, body, requestOptions)
            .map((res: Response) => {
                return res;
            })
            .catch((error: any) => {
                this.errorService.showError('Something went wrong.Please retry after sometime or contact Administrator.');
                return Observable.throw(error);
            });
    }

    get(url: string): Observable<any> {

        const requestOptions = this.getRequestOptions();

        return this.httpClient.get(url, requestOptions)
            .map((res: Response) => {
                return res;
            })
            .catch((error: any) => {
                this.errorService.showError('Something went wrong.Please retry after sometime or contact Administrator.');
                return Observable.throw(error);
            });
    }

    put(url: string, body: string): Observable<any> {
        const requestOptions = this.getRequestOptions();

        return this.httpClient.put(url, body, requestOptions)
            .map((res: Response) => {
                return res;
            })
            .catch((error: any) => {
                console.log(error);
                this.errorService.showError('Something went wrong.Please retry after sometime or contact Administrator.');
                return Observable.throw(error);
            });
    }


    delete(url: string): Observable<any> {
        const requestOptions = this.getRequestOptions();

        return this.httpClient.delete(url, requestOptions)
            .map((res: Response) => {
                return res;
            })
            .catch((error: any) => {
                console.log(error);
                this.errorService.showError('Something went wrong.Please retry after sometime or contact Administrator.');
                return Observable.throw(error);
            });
    }

    postBlob(url: string, body: string): Observable<any> {
        // const requestOptions = this.getRequestOptionsBlob();
        const requestOptions = this.getRequestOptionsPostBlob();

        return this.httpClient.post(url, body, requestOptions)
            .map((res: Response) => {
                return res;
            })
            .catch((error: any) => {
                this.errorService.showError('Something went wrong.Please retry after sometime or contact Administrator.');
                return Observable.throw(error);
            });
    }

    putBlob(url: string, body: string): Observable<any> {
        const requestOptions = this.getRequestOptionsPutBlob();
        return this.httpClient.put(url, body, requestOptions)
            .map((res: Response) => {
                return res;
            })
            .catch((error: any) => {
                this.errorService.showError('Something went wrong.Please retry after sometime or contact Administrator.');
                return Observable.throw(error);
            });
    }

    getBlob(url: string, body: string): Observable<any> {
        const requestOptions = this.getRequestOptionsBlob();
        return this.httpClient.get(url, {
            responseType: 'blob'
        })
            .map((res: Blob) => {
                return res;
            })
            .catch((error: any) => {
                this.errorService.showError('Something went wrong.Please retry after sometime or contact Administrator.');
                return Observable.throw(error);
            });
    }


    getRequestOptions() {
        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json; charset=UTF-8')
            .set('Authorization', this.localStorageService.getItem('Authorization'));
        const requestOptions = {
            headers: headers
        };
        return requestOptions;
    }


    getRequestOptionsBlob() {
        const headers = new HttpHeaders()
            .set('Accept', 'application/json')
            .set('Authorization', this.localStorageService.getItem('Authorization'));

        const requestOptions = {
            headers: headers,
            method: RequestMethod.Get,
            ResponseType: ResponseContentType.Blob
        };
        return requestOptions;
    }


    getRequestOptionsPutBlob() {
        const headers = new HttpHeaders()
            .set('Accept', 'application/vnd.brickfit.api.v1+json')
            .set('Authorization', this.localStorageService.getItem('Authorization'));
        const requestOptions = {
            headers: headers,
            method: RequestMethod.Put,
            ResponseType: ResponseContentType.Blob
        };
        return requestOptions;
    }

    getRequestOptionsPostBlob() {
        const headers = new HttpHeaders()
            .set('Accept', 'application/vnd.brickfit.api.v1+json')
            .set('Authorization', this.localStorageService.getItem('Authorization'));
        const requestOptions = {
            headers: headers,
            method: RequestMethod.Post,
            ResponseType: ResponseContentType.Blob
        };
        return requestOptions;
    }

    postLoginRequest(url, body) {
        const headers = new HttpHeaders()
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .set('Accept', 'application/json')
            .set('Authorization', this.localStorageService.getItem('Authorization'));

        const requestOptions = {
            headers: headers
        };

        return this.httpClient.post(url, body, requestOptions)
            .map((res: Response) => {

                return res;
            })
            .catch((error: any) => {
              this.localStorageService.removeItem('Authorization');
                console.log(error.error);
                console.log(error);
                if(error.status === 400){
                  this.uiNotificationService.error(error.error.message, '');
                }else{
                  this.uiNotificationService.error(this.translator.instant("common.error"), '');
                }
                // return Observable.throw(error.error);
                return Observable.throw(null);
            });
    }

    getRequestOptionsWithoutAuthorization() {
        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json; charset=UTF-8')
            .set('Accept', 'application/vnd.brickfit.api.v1+json');

        const requestOptions = {
            headers: headers
        };
        return requestOptions;
    }

    getWithoutAuthorization(url: string): Observable<any> {
        const requestOptions = this.getRequestOptionsWithoutAuthorization();

        return this.httpClient.get(url, requestOptions)
            .map((res: Response) => {
                return res;
            })
            .catch((error: any) => {
                this.errorService.showError('Something went wrong.Please retry after sometime or contact Administrator.');
                return Observable.throw(error);
            });
    }

    putWithoutAuthorization(url: string, body: string): Observable<any> {
        const requestOptions = this.getRequestOptionsWithoutAuthorization();

        return this.httpClient.put(url, body, requestOptions)
            .map((res: Response) => {
                return res;
            })
            .catch((error: any) => {
                this.errorService.showError('Something went wrong.Please retry after sometime or contact Administrator.');
                return Observable.throw(error);
            });
    }
    postWithoutAuthorization(url: string, body: string): Observable<any> {
        const requestOptions = this.getRequestOptionsWithoutAuthorization();

        return this.httpClient.post(url, body, requestOptions)
            .map((res: Response) => {
                return res;
            })
            .catch((error: any) => {
                this.errorService.showError('Something went wrong.Please retry after sometime or contact Administrator.');
                return Observable.throw(error);
            });
    }


    /////////////////

    getrequestOptionsBlob() {
        const headers = new HttpHeaders()
            .set('Accept', 'application/json');

        const requestOptions = {
            headers: headers,
            method: RequestMethod.Post,
            ResponseType: ResponseContentType.Blob
        };
        return requestOptions;
    }

    getblob(url: string, body: string): Observable<any> {

        const requestOptions = this.getrequestOptionsBlob();
        return this.httpClient.get(url, {
            responseType: 'blob'
        })
            .map((res: Blob) => {
                return res;
            })
            .catch((error: any) => {
                this.errorService.showError('Something went wrong.Please retry after sometime or contact Administrator.');
                return Observable.throw(error);
            });
    }

    // tslint:disable-next-line: typedef
    parseResponse(e: any) {
        if (e.statusCode === '200' && e.message === 'OK') {
            return e.data;
        } else {
            this.uiNotificationService.error(e.message, '');
        }
    }

    submitResponse(e: any, message: string) {
        if (e.statusCode === '200' && e.message === 'OK') {
            if (message !== '') {
                this.uiNotificationService.success(message, '');
            }
            return e.data;
        } else {
            this.uiNotificationService.error(e.message, '');
        }
    }

    postProjectResponse(e: any, message: string) {
        if (e.statusCode === '200' && e.message === 'OK') {
            if (message !== '') {
                this.uiNotificationService.success(message, '');
            }
            return e.data;
        } else {
            this.uiNotificationService.error(e.errorCode, '');
        }
    }
}
