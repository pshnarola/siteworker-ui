import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ErrorMessageBindingStrategy, ReactiveFormConfig } from '@rxweb/reactive-form-validators';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { Subscription } from 'rxjs';
import { LocalStorageService } from './service/localstorage.service';
import { ThemeService } from './service/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'iconic-worker-ui';

  subscription = new Subscription();

  public config: PerfectScrollbarConfigInterface = {};

  constructor(
    public translate: TranslateService, private localStorageService: LocalStorageService,
    @Inject(DOCUMENT) private document: Document, private renderer: Renderer2, private themeService: ThemeService
  ) {
    translate.addLangs(['de', 'en']);
    translate.setDefaultLang('en');

    const browserLang = translate.getBrowserLang();
    translate.use(browserLang.match(/en|de/) ? browserLang : 'en');
  }
  ngOnInit(): void {
    this.subscription.add(this.themeService.themechangerSubject.subscribe(res => {
      if (this.localStorageService.getheme()) {
        this.renderer.setAttribute(this.document.body, 'class', this.localStorageService.getheme());
      } else {
        this.renderer.setAttribute(this.document.body, 'class', res);
      }
    }));

    ReactiveFormConfig.set({
      internationalization: {
        dateFormat: 'dmy',
        seperator: '/'
      },
      reactiveForm: {
        errorMessageBindingStrategy: ErrorMessageBindingStrategy.OnDirtyOrTouched,
      },
      validationMessage: {
        alpha: 'Only alphabelts are allowed.',
        alphaNumeric: 'Only alphabet and numbers are allowed.',
        compare: 'inputs are not matched.',
        contains: 'value is not contains in the input',
        creditcard: 'creditcard number is not correct',
        digit: 'Only digit are allowed',
        email: 'email is not valid',
        greaterThanEqualTo: 'please enter greater than or equal to the joining age',
        greaterThan: 'please enter greater than to the joining age',
        hexColor: 'please enter hex code',
        json: 'please enter valid json',
        lessThanEqualTo: 'please enter less than or equal to the current experience',
        lessThan: 'please enter less than or equal to the current experience',
        lowerCase: 'Only lowercase is allowed',
        maxLength: 'maximum length is 10 digit',
        maxNumber: 'enter value less than equal to 3',
        minNumber: 'enter value greater than equal to 1',
        password: 'please enter valid password',
        pattern: 'please enter valid zipcode',
        range: 'please enter age between 18 to 60',
        required: 'this field is required',
        time: 'Only time format is allowed',
        upperCase: 'Only uppercase is allowed',
        url: 'Only url format is allowed',
        zipCode: 'enter valid zip code',
        minLength: 'minimum length is 10 digit'
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
