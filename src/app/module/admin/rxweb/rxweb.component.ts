import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { LogIn } from 'src/app/shared/vo/Login';

@Component({
  selector: 'app-rxweb',
  templateUrl: './rxweb.component.html',
  styleUrls: ['./rxweb.component.css']
})
export class RxwebComponent implements OnInit {

  constructor(private formBuilder: RxFormBuilder) { }

  userRegistrationFormGroup: FormGroup;

  ngOnInit(): void {
    // const user = new LogIn();
    // this.userRegistrationFormGroup = this.formBuilder.formGroup(user);

    //For Edit you have a filled DTO like
    const user = new LogIn();
    user.email='baldevkushal@gmail.com';
    this.userRegistrationFormGroup = this.formBuilder.formGroup(user);
  }

  // tslint:disable-next-line: typedef
  public login(){
    console.log("hello");
  }

}
