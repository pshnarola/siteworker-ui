import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { NotificationService } from './error.service';
import { Subscription } from 'rxjs/Subscription';
import { Alert } from './error';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';

@Component({
    selector: 'custom-error',
    templateUrl: `./error.component.html`,
    styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit, OnDestroy {
    @Input()
    public alerts: Alert[] = [];
    msgs: Message[] = [];
    staticAlertClosed = false;
    notificationSubscription: Subscription;
    constructor(private _errorService: NotificationService) { }

    ngOnInit() {

        this.notificationSubscription = this._errorService.showNotification.subscribe(
            errorData => {
                this.staticAlertClosed = false;
                this.alerts = [];
                this.alerts.push(errorData);
                setTimeout(() => this.staticAlertClosed = true, 5000);
            }
        );
    }

    public closeAlert(alert: Alert) {
        const index: number = this.alerts.indexOf(alert);
        this.alerts.splice(index, 1);
    }

    ngOnDestroy() {
        this.notificationSubscription.unsubscribe();
    }

}
