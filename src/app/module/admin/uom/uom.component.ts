import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { UomService } from 'src/app/service/admin-services/uom/uom.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { Uom } from 'src/app/shared/vo/uom/uom';

@Component({
  selector: 'app-uom',
  templateUrl: './uom.component.html',
  styleUrls: ['./uom.component.css']
})
export class UomComponent implements OnInit, OnDestroy {
  tableRowSize = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  tablePaginateDropdown = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  uomData: Uom[];
  uom: Uom;

  rowIndex = 0;
  isAllUomdSelected = true;
  selectedUomArray: any[] = [];
  specificSelectedUomDisable = true;


  uomFilterValue = '';
  loading = false;
  offset: Number = 0;
  datatableParam: DataTableParam;
  totalRecords: Number = 0;
  loginUserId;
  sortField = 'NAME';
  sortOrder = 1;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  globalFilter = null;
  filterMap = new Map();
  queryParam;
  myForm: FormGroup;
  selectedUserId: string;
  submitted = false;

  uomDialog = false;

  message: string;
  status: string;
  showButtons = true;
  masterAccess: any;
  btnDisabled = false;

  uomHeader: string;

  columns = [
    { label: this.translator.instant('unit.of.measure'), value: 'name' },
  ];

  constructor(
    private translator: TranslateService,
    private _localStorageService: LocalStorageService,
    private captionChangeService: HeaderManagementService,
    private _uomService: UomService,
    private _formBuilder: FormBuilder,
    private _notificationService: UINotificationService,
    private confirmDialogueService: ConfirmDialogueService

  ) {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.datatableParam = new DataTableParam();
    this.datatableParam = {
      offset: 0,
      size: 10,
      sortField: 'NAME',
      sortOrder: 1,
      searchText: null
    };
    this.loginUserId = _localStorageService.getLoginUserId();

  }

  ngOnDestroy(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(false);
  }

  ngOnInit(): void {
    this.masterAccess = this._localStorageService.getItem('userAccess');
    this.initializeForm();
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.UOM);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    if (this.masterAccess) {
      this.menuAccess();
    }
  }


  filter(): void {

    this.filterMap.clear();
    if (this.uomFilterValue != '') {
      this.filterMap.set('NAME', this.uomFilterValue);
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

    this.loadUomList();
  }

  clear() {
    this.uomFilterValue = '';
    this.filter();
  }

  onLazyLoad(event): void {
    this.sortOrder = event.sortOrder == -1 ? 0 : 1;
    this.globalFilter = event.globalFilter ? event.globalFilter : this.globalFilter;
    this.sortField = event.sortField ? event.sortField : this.sortField;
    this.offset = event.first / event.rows;
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadUomList();
  }


  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  loadUomList() {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this._uomService.getUOMList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.loading = false;
            this.uomData = data.data.result;

            this.uomData.map(e => {
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

  addUom(): any {
    this.uomDialog = true;
    this.uomHeader = 'Add UOM';
    this.initializeForm();
  }

  hideDialog(): any {
    this.uomDialog = false;
    this.submitted = false;
    this.initializeForm();
  }

  initializeForm() {
    this.myForm = this._formBuilder.group({
      id: [],
      name: ['', [CustomValidator.required]],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      isEnable: 1,
    });
  }

  onSubmit() {
    this.submitted = true;
    if (!this.myForm.valid) {
      let controlName: string;
      for (controlName in this.myForm.controls) {
        this.myForm.controls[controlName].markAsDirty();
        this.myForm.controls[controlName].updateValueAndValidity(); // Validate form field and show the message
      }
      this.submitted = true;
      return false;
    }

    if (this.myForm.controls.id.value != null) {

      this._uomService.updateUOM(JSON.stringify(this.myForm.value)).subscribe(
        data => {

          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('uom.updated'), '');
            this.loadUomList();
            this.uomDialog = false;
            this.submitted = false;
          } else {
            this._notificationService.error(data.message, '');

          }

        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');

          this.uomDialog = false;
          this.submitted = false;
        }
      );
    } else {
      this._uomService.addUOM(JSON.stringify(this.myForm.value)).subscribe(
        data => {

          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('uom.added'), '');
            this.loadUomList();
            this.uomDialog = false;
            this.submitted = false;
          } else {
            this._notificationService.error(data.message, '');

          }

        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');

          this.uomDialog = false;
          this.submitted = false;
        }
      );
    }
  }

  editUom(uom: Uom): void {
    this.uomDialog = true;
    this.uomHeader = 'Edit UOM';

    this.uom = { ...uom };
    this.myForm.controls.id.patchValue(this.uom.id);
    this.myForm.controls.name.patchValue(this.uom.name);

  }

  disableSelectedUom() {
    this.specificSelectedUomDisable = false;
    this.selectedUomArray.forEach(uomData => this.disableUom(uomData.id, true));
    if (this.selectedUomArray?.length) {
      this._notificationService.success(this.translator.instant('uom.disabled'), '');
    }
    this.loadUomList();
    this.selectedUomArray.splice(0, this.selectedUomArray.length);
  }

  enableSelectedUom() {
    this.specificSelectedUomDisable = false;
    this.selectedUomArray.forEach(uomData => this.enableUom(uomData.id));
    this.loadUomList();
    this.selectedUomArray.splice(0, this.selectedUomArray.length);
  }

  // enable Uom
  enableUom(id): void {
    this.submitted = true;
    this._uomService.enableUOM(id).subscribe(
      data => {

        if (data.statusCode === '200' && data.message === 'OK') {
          this._notificationService.success(this.translator.instant('uom.enabled'), '');
          this.loadUomList();
          this.submitted = false;
        } else {
          this._notificationService.error(data.message, '');

        }

      },
      (error) => {
        this._notificationService.error(this.translator.instant('common.error'), '');

        this.submitted = false;
      }
    );
    this.initializeForm();

  }
  // disable Uom
  disableUom(id, selectedUOM?): void {
    this.submitted = true;
    this._uomService.disableUOM(id).subscribe(
      data => {

        if (data.statusCode === '200' && data.message === 'OK') {
          if (!selectedUOM) {
            this._notificationService.success(this.translator.instant('uom.disabled'), '');
          }
          this.loadUomList();
          this.submitted = false;
        } else {
          this._notificationService.error(data.message, '');

        }

      },
      (error) => {
        this._notificationService.error(this.translator.instant('common.error'), '');

        this.submitted = false;
      }
    );
    this.initializeForm();

  }


  openDialog(id, name?, status?): void {

    let options = null;
    const message = this.translator.instant('dialog.message.region');

    if (status) {
      this.status = 'disable';
    } else {
      this.status = 'enable';
    }

    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message} ${this.status} ${name} ?`),
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text'),
    };

    this.confirmDialogueService.open(options);
    this.confirmDialogueService.confirmed().subscribe(confirmed => {

      if (confirmed) {
        if (status) {
          this.disableUom(id);
        }
        else {
          this.enableUom(id);
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
