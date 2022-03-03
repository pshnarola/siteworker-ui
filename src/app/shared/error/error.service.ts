import { Injectable, EventEmitter } from '@angular/core';
import { Alert } from './error';

@Injectable()
export class NotificationService {

    showNotification = new EventEmitter<Alert>();

    showInfo(summary: string): void {
        const errorData = new Alert(2, 'info', summary);
        this.showNotification.emit(errorData);
    }

    showWarn(summary: string): void {
        const errorData = new Alert(3, 'warning', summary);
        this.showNotification.emit(errorData);
    }

    showError(summary: string): void {

        const errorData = new Alert(4, 'danger', summary);

        this.showNotification.emit(errorData);
    }

    showSuccess(summary: string): void {

        const errorData = new Alert(1, 'success', summary);
        this.showNotification.emit(errorData);
    }

}
