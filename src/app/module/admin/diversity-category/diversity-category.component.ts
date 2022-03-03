import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Table } from 'primeng/table';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { DiversityCategoryService } from 'src/app/service/admin-services/diversity-category/diversity-category.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { DiversityCategory } from './diversity-category';

@Component({
  selector: 'app-diversity-category',
  templateUrl: './diversity-category.component.html',
  styleUrls: ['./diversity-category.component.css']
})
export class DiversityCategoryComponent implements OnInit, OnDestroy {
  /*
    @author Vinita Jagwani
  */
  @ViewChild('dt') table: Table;
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  columns = [
    { label: this.translator.instant('diversitycategory.name'), value: 'name' },

  ];
  popupHeader;
  nameFilterValue = '';
  data: DiversityCategory[] = [];
  selectedDiversityArray: any[] = [];
  url;
  loading = false;
  offset = 0;
  datatableParam: DataTableParam;
  totalRecords = 0;
  loginUserId;
  showConfirmDialog = false;
  sortField = 'NAME';
  sortOrder;
  isAllDiversitySelected = false;
  specificSelectedDiversityDisable = false;
  rowIndex = 0;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  status;
  globalFilter = null;
  filterMap = new Map();
  queryParam;
  displayDialog = false;
  myForm: FormGroup;
  selectedUserId: string;
  submitted = false;
  diversity: DiversityCategory;
  diversityDialog = false;
  showButtons = true;
  masterAccess: any;
  btnDisabled = false;

  constructor(@Inject(DOCUMENT) private document: any,
    private diversityService: DiversityCategoryService,
    private router: Router,
    private translator: TranslateService,
    private localStorageService: LocalStorageService,
    private notificationService: UINotificationService,
    private formBuilder: FormBuilder,
    private captionChangeService: HeaderManagementService,
    private confirmDialogService: ConfirmDialogueService
  ) {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);

    this.datatableParam = new DataTableParam();
    this.datatableParam = {
      offset: 0,
      size: 2,
      sortField: 'NAME',
      sortOrder: 1,
      searchText: null
    };

    this.loginUserId = localStorageService.getLoginUserId();
  }
  ngOnDestroy(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(false);
  }

  ngOnInit(): void {
    this.masterAccess = this.localStorageService.getItem('userAccess');

    this.initializeForm();
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.DIVERSITY_CATEGORY);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    if (this.masterAccess) {
      this.menuAccess();
    }
  }

  onLazyLoad(event): void {

    this.sortOrder = event.sortOrder === -1 ? 0 : 1;
    this.globalFilter = event.globalFilter ? event.globalFilter : this.globalFilter;
    this.sortField = event.sortField ? event.sortField : 'NAME';
    this.offset = event.first / event.rows;
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadDiversityCategoryList();
  }

  // tslint:disable-next-line: typedef
  prepareQueryParam(paramObject) {
    // tslint:disable-next-line: new-parens
    const params = new URLSearchParams;
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  loadDiversityCategoryList(): void {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.diversityService.getDiversityList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.loading = false;
            this.data = data.data.result;
            this.data.map(e => {

            });

            this.offset = data.data.first;
            this.totalRecords = data.data.totalRecords;
          }
        } else {
          this.loading = false;
        }
      },
      error => {
        this.loading = false;
      }
    );
  }

  filter(): void {

    this.filterMap.clear();
    if (this.nameFilterValue !== '') {
      this.filterMap.set('NAME', this.nameFilterValue);
    }
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParam = {
      offset: this.offset,
      size: this.size,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadDiversityCategoryList();
  }

  clear() {
    this.nameFilterValue = '';
    this.filter();
  }


  initializeForm(): void {
    this.myForm = this.formBuilder.group({
      id: [],
      name: ['', [CustomValidator.required]],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      isEnable: 1
    });
  }
  addDiversityCategory(): void {
    this.diversityDialog = true;
    this.popupHeader = 'Add Diversity';
    this.initializeForm();
  }

  onSubmit(): boolean {
    this.submitted = true;
    if (!this.myForm.valid) {
      let controlName: string;
      // tslint:disable-next-line: forin
      for (controlName in this.myForm.controls) {
        this.myForm.controls[controlName].markAsDirty();
        this.myForm.controls[controlName].updateValueAndValidity(); // Validate form field and show the message
      }
      this.submitted = true;
      return false;
    }

    if (this.myForm.controls.id.value != null) {
      this.diversityService.updateDiversity(JSON.stringify(this.myForm.value)).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.notificationService.success(this.translator.instant('update.diversity.successMessage'), '');
            this.loadDiversityCategoryList();
            this.diversityDialog = false;
            this.submitted = false;
          }
          else {
            this.notificationService.error(data.message, '');
          }
        },
        error => {
          this.notificationService.error(this.translator.instant('common.error'), '');
          this.diversityDialog = false;
          this.submitted = false;
        }
      );
    } else {
      this.diversityService.addDiversity(JSON.stringify(this.myForm.value)).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.notificationService.success(this.translator.instant('create.diversity.successMessage'), '');
            this.loadDiversityCategoryList();
            this.diversityDialog = false;
            this.submitted = false;
          }
          else {
            this.notificationService.error(data.message, '');
          }
        },
        error => {
          this.notificationService.error(this.translator.instant('common.error'), '');
          this.diversityDialog = false;
          this.submitted = false;
        }
      );
    }
  }
  editDiversity(diversity: DiversityCategory): void {
    this.diversityDialog = true;
    this.popupHeader = 'Edit Diversity';
    this.diversity = { ...diversity };

    this.myForm.controls.id.patchValue(this.diversity.id);
    this.myForm.controls.name.patchValue(this.diversity.name);
  }

  hideDialog(): void {
    this.diversityDialog = false;
    this.submitted = false;
    this.initializeForm();
  }
  enableDiversityCategory(id): void {
    this.diversityService.enableDiversity(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success(this.translator.instant('enable.success.diversity'), '');
          this.loadDiversityCategoryList();
        }
      },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
        this.diversityDialog = false;
        this.submitted = false;
      }
    );
  }
  disableDiversityCategory(id, selectedCategory?): void {
    this.diversityService.disableDiversity(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          if (!selectedCategory) {
            this.notificationService.success(this.translator.instant('disable.success.diversity'), '');
          }
          this.loadDiversityCategoryList();
        }
      },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
        this.diversityDialog = false;
        this.submitted = false;
      }
    );
  }

  disableSelectedDiversityCategory(): void {
    this.specificSelectedDiversityDisable = false;
    this.selectedDiversityArray.forEach(diversityCategoryData => this.disableDiversityCategory(diversityCategoryData.id, true));
    if (this.selectedDiversityArray?.length) {
      this.notificationService.success(this.translator.instant('disable.success'), '');
    }
    this.loadDiversityCategoryList();
    this.selectedDiversityArray.splice(0, this.selectedDiversityArray.length);
  }
  openDialog(id, name, status): void {
    let options = null;
    const message = this.translator.instant('diversity.dialog.message');
    if (status) {
      this.status = 'disable';
    }
    else {
      this.status = 'enable';
    }
    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message} ${this.status} ${name} ?`),
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')

    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        if (status) {
          this.disableDiversityCategory(id);
        }
        else {
          this.enableDiversityCategory(id);
        }
      }
    });
  }
  menuAccess(): void {
    const accessPermission = this.masterAccess.filter(e => e.menuName == 'Masters');
    if (accessPermission[0].canModify) {
      this.showButtons = true;
      this.btnDisabled = false;
    }
    else {
      this.showButtons = false;
      this.btnDisabled = true;
    }
  }
}
