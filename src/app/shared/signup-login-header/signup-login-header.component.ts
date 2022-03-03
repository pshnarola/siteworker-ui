import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonUtil } from '../CommonUtil';
import { PATH_CONSTANTS } from '../PathConstants';

@Component({
  selector: 'app-signup-login-header',
  templateUrl: './signup-login-header.component.html',
  styleUrls: ['./signup-login-header.component.css']
})
export class SignupLoginHeaderComponent implements OnInit, OnDestroy {
  url: string;
  loginLink = false;
  signupLink = false;
  constructor(private router: Router) { }

  ngOnDestroy(): void {
    this.loginLink = false;
    this.signupLink = false;
  }

  ngOnInit(): void {
    this.url = this.router.url;
    if (this.url === '/login') {
      this.loginLink = false;
      this.signupLink = true;
    } else if (this.url.indexOf(('/signup/'.split('/')[1])) > -1) {
      this.loginLink = true;
      this.signupLink = false;
    }
  }
  redirectToWordpressWebsite() {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.WORDPRESS_WEBSITE);
  }
}
