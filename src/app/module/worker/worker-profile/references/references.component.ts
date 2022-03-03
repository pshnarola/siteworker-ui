import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Reference } from 'src/app/module/subcontractor/subcontractor-profile/vo/reference';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { ReferencesService } from 'src/app/service/subcontractor-services/references/references.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';

@Component({
  selector: 'app-references',
  templateUrl: './references.component.html',
  styleUrls: ['./references.component.css']
})
export class ReferencesComponent implements OnInit {
  loginUserId;
  referenceDialog: boolean = false;
  referenceForm: FormGroup;
  submitted: boolean;
  reference: Reference;
  referenceList: Reference[];
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  offset: Number = 0;
  datatableParam;
  totalRecords: Number = 0;
  queryParam;
  sortField = 'CREATED_DATE';
  sortOrder = 0;
  size = 20;
  globalFilter;

  @Output() goBackToCertificates = new EventEmitter<any>()
  loginUser: any;


  constructor(
    private _localStorageService: LocalStorageService,
    private _notificationService: UINotificationService,
    private _formBuilder: FormBuilder,
    private translator: TranslateService,
    private _referencesService: ReferencesService,
    private router: Router
  ) {
    this.loginUserId = this._localStorageService.getLoginUserId();
    this.loginUser = this._localStorageService.getLoginUserObject();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.onLazyLoad();
  }

  addReference(): any {
    this.referenceDialog = true;
    this.initializeForm();
  }

  hideDialog(): any {
    this.referenceDialog = false;
    this.submitted = false;
    this.initializeForm();
  }

  initializeForm() {
    this.referenceForm = this._formBuilder.group({
      id: [null],
      companyName: ['', [Validators.maxLength(50)]],
      fullName: ['', [CustomValidator.required, Validators.maxLength(50)]],
      jobTitle: ['', [CustomValidator.required, Validators.maxLength(50)]],
      email: ['', [CustomValidator.required, CustomValidator.emailValidator, Validators.maxLength(50)]],
      workPhone: ['', [CustomValidator.required]],
      mobilePhone: [''],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      enable: 1,
    });
  }

  onSubmit() {

    this.submitted = true;
    if (!this.referenceForm.valid) {
      CustomValidator.markFormGroupTouched(this.referenceForm);
      this.submitted = true;
      return false;
    }

    this.submitted = true;
    this.reference = this.referenceForm.value;
    this.reference.user = this.loginUser;

    this._referencesService.addWorkerReference(this.reference).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this._notificationService.success(this.translator.instant('reference.added'), '');
          this.referenceDialog = false;
          this.submitted = false;
          this.loadReferenceList();
        } else {
          this._notificationService.error(data.message, '');
          this.loadReferenceList();
        }
      },
      (error) => {
        this._notificationService.error(this.translator.instant('common.error'), '');
        this.referenceDialog = false;
        this.submitted = false;
        this.loadReferenceList();

      }
    );
  }

  onLazyLoad(): void {
    this.datatableParam = {
      offset: this.offset,
      size: 10000,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter = `{"USER_ID":"${this.loginUserId}"}`
    };
    this.loadReferenceList();
  }

  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  loadReferenceList() {
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this._referencesService.getWorkerReferenceList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.referenceList = data.data.result;
            this.offset = data.data.first;
            this.totalRecords = data.data.totalRecords;
          }
        } else {
        }
      },
      error => {
      }
    );
  }

  previous() {
    this.goBackToCertificates.emit('');
  }

  goToDashboard(): void {
    this.router.navigate([PATH_CONSTANTS.WORKER_DASHBOARD]);
  }

}
