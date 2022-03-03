import {
    HttpEvent, HttpHandler, HttpInterceptor,
    HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { environment } from 'src/environments/environment';


@Injectable()
// tslint:disable-next-line: class-name
export class httpInterceptor implements HttpInterceptor {

    count = 0;
    endPoint: any = environment.apiEndPoint;
    reqList = [
        // environment.apiEndPoint+'user/signUp',
        environment.apiEndPoint + 'oauth/token',
    ];

    sidebarUrls = [environment.apiEndPoint + 'JobDetail/getJobDetailForSidebar',
    environment.apiEndPoint + 'ProjectDetail/getProjectForSidebar'
    ];

    constructor(
        private spinner: NgxSpinnerService,
        private localStorageService: LocalStorageService,
        private router: Router) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let interceptorUrl = req.url;
        let originalurl = interceptorUrl.substring(0, interceptorUrl.indexOf('?'));
        if (this.regexForFilterData(req.url) || this.reqList.includes(req.url) || this.sidebarUrls.includes(originalurl)) {
            return next.handle(req);
        }
        // else if (this.router.url === '/'){

        // }
        else {
            this.spinner.show();
            this.count++;
            return next.handle(req)
                .pipe(tap(
                    event => { },
                    error => console.log(error)
                ), finalize(() => {
                    this.count--;
                    if (this.router.url === '/') {
                        // tslint:disable-next-line: curly
                        if (this.count === 0) setTimeout(() => {
                            if (this) {
                                // if(!this.localStorageService.getItem('isFromLogin')){
                                this.spinner.hide();
                                // }
                            }
                        }, 0);
                    } else {
                        // tslint:disable-next-line: curly
                        if (this.count === 0) setTimeout(() => {
                            if (this) {
                                // if(!this.localStorageService.getItem('isFromLogin')){
                                this.spinner.hide();
                                // }
                            }
                        }, 500);
                    }
                })
                );
        }
    }
    regexForFilterData(urlString): boolean {
        if (urlString.indexOf('/filterData') > -1 || urlString.indexOf('unreadCount/') > -1) {
            return true;
        }
        else {
            return false;
        }
    }
}
