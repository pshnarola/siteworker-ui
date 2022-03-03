import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { API_CONSTANTS } from '../shared/ApiConstants';
import { CustomHttpService } from './customHttp.service';
import { LocalStorageService } from './localstorage.service';


@Injectable({
    providedIn: 'root'
})
export class LoginService {

    constructor(
        private _customHttpService: CustomHttpService,
        private _localStorageService: LocalStorageService,
        private router: Router,
    ) { }

    login(loginForm: FormGroup): Observable<any> {

        const body = new HttpParams().set('username', loginForm.controls['email'].value)
            .set('password', loginForm.controls['password'].value)
            .set('client_secret', 'secret')
            .set('client_id', 'my-trusted-client')
            .set('grant_type', 'password');
        this._localStorageService.setItem('Authorization', 'Basic ' + btoa('my-trusted-client:secret'));
        const url = API_CONSTANTS.TOKEN_API;
        return this._customHttpService.postLoginRequest(url, body.toString());
    }

    getUserByEmail(email: string): Observable<any> {
        const url = API_CONSTANTS.GET_USER_BY_EMAIL + "/" + email + "/";
        return this._customHttpService.get(url);
    }

    // autoLogout(timeout: number): any {
    //     setTimeout(() => {
    //         this.tokenExpiedAndLogout();
    //     }, timeout);
    // }

    async autoLogout(): Promise<any> {
        await this.tokenExpiedAndLogout();
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }

    // openDialog(): void {
    //     let options = null;
    //     const message = 'Token expired..!!';
    //     options = {
    //         title: 'warning',
    //         message: `${message}?`,
    //         confirmText: 'ok',
    //     };
    //     this.confirmDialogueService.open(options);
    //     this.confirmDialogueService.confirmed().subscribe(confirmed => {
    //         if (confirmed) {
    //             this.tokenExpiedAndLogout();
    //         }
    //     });
    // }

    private tokenExpiedAndLogout() {
        this._localStorageService.logout();
        this.router.navigate(['/signup/session-timeout']);
        // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        //     this.router.navigate(['/signup/session-timeout']);
        // });
    }


}
