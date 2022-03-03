import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
// Reference link
// https://blog.jscrambler.com/how-to-create-angular-toastr-notifications/
export class UINotificationService {

  topRight = 'toast-top-right';
  topLeft = 'toast-top-left';
  bottomRight = 'toast-bottom-right';
  bottomLeft= 'toast-bottom-left';

  constructor(private toastr: ToastrService) { }

  success(message, title){
    if (title === null || title === '') {
      title = 'Success';
    }
    this.toastr.success(message, title,{ positionClass: this.bottomLeft});
}

error(message, title){
  if (title === null || title === '') {
    title = 'Error';
  }
  this.toastr.error(message, title,{ positionClass: this.bottomLeft});
}

warning(message, title){
  if (title === null || title === '') {
    title = 'Warning';
  }
  this.toastr.warning(message, title,{ positionClass: this.bottomLeft});
}

info(message, title){
  if (title === null || title === '') {
    title = 'Information';
  }
  this.toastr.info(message, title,{ positionClass: this.bottomLeft});
}

}
