import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Table } from 'primeng/table';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { UomService } from 'src/app/service/admin-services/uom/uom.service';
import { LineItemTemplateService } from 'src/app/service/client-services/line-item-template/line-item-template.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { Uom } from 'src/app/shared/vo/uom/uom';
import { LineItem } from '../Vos/lineItemModel';

@Component({
  selector: 'app-line-item-template',
  templateUrl: './line-item-template.component.html',
  styleUrls: ['./line-item-template.component.css']
})
export class LineItemTemplateComponent implements OnInit {
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  data: LineItem[] = [];
  lineItemDialog = false;
  loggedInUserId: string;
  loading = false;
  offset: Number = 0;
  totalRecords: Number = 0;
  datatableParam: DataTableParam;
  filterMap = new Map();
  sortField = 'ITEM_NAME';
  queryParam;
  sortOrder;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  globalFilter;
  lineItemTemplateForm: FormGroup;
  submitted = false;
  dialogHeader: string;
  isEditWorkType = false;
  uom: Uom[];
  filteredUom: any[];
  user: any;
  template: LineItem;

  @ViewChild('dt') table: Table;
  columns = [
    { label: this.translator.instant('line.item.id'), value: 'ITEM_ID' },
    { label: this.translator.instant('line.item.name'), value: 'ITEM_NAME' },
    { label: this.translator.instant('quantity'), value: 'quantity' },
    { label: this.translator.instant('unit'), value: 'unit' },
    { label: this.translator.instant('cost'), value: 'cost' }
  ];

  constructor(
    private translator: TranslateService,
    private _localStorageService: LocalStorageService,
    private captionChangeService: HeaderManagementService,
    private _formBuilder: FormBuilder,
    private _uomService: UomService,
    private uiNotificationService: UINotificationService,
    private confirmDialogService: ConfirmDialogueService,
    private LineItemTemplateService: LineItemTemplateService) { }

  ngOnInit(): void {
    this.loadUomList();
    this.dialogHeader = this.translator.instant('add.line.item');
    this.captionChangeService.hideHeaderSubject.next(true);
    this.loggedInUserId = this._localStorageService.getLoginUserId();
    this.user = this._localStorageService.getLoginUserObject();
    this.initializeLineItemform();
  }

  private initializeLineItemform() {
    this.lineItemTemplateForm = this._formBuilder.group({
      id: [],
      createdBy: this.loggedInUserId,
      updatedBy: this.loggedInUserId,
      description: ['', [Validators.required]],
      dynamicLabel1: ['', Validators.maxLength(200)],
      dynamicLabel2: ['', Validators.maxLength(200)],
      dynamicLabel3: ['', Validators.maxLength(200)],
      exclusions: [''],
      inclusions: [''],
      lineItemId: ['', [Validators.required, Validators.maxLength(20)]],
      lineItemName: ['', [Validators.required, Validators.maxLength(100)]],
      cost: [null, [Validators.required, Validators.min(0.01)]],
      quantity: [null, [Validators.required, Validators.min(1)]],
      unit: ['', [Validators.required, Validators.maxLength(10)]],
      user: this.user
    });
  }

  openDialog(): void {
    this.lineItemDialog = true;
    this.dialogHeader = this.translator.instant('add.line.item');
    this.submitted = false;
    this.initializeLineItemform();
  }

  hideDialog(): void {
    this.lineItemDialog = false;
    this.submitted = false;
    this.lineItemTemplateForm.reset();
  }

  onWorkTypeChange(value) {
    this.lineItemTemplateForm.controls.workType.setValue(value);
    this.isEditWorkType = !this.isEditWorkType;
  }

  onEditWorkType() {
    this.isEditWorkType = !this.isEditWorkType;
  }

  setFilterToGetByClient() {
    this.filterMap.clear();
    this.filterMap.set('USER_ID', this.loggedInUserId);
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    let globalFilter = JSON.stringify(jsonObject);
    return globalFilter;
  }

  onLazyLoad(event) {
    this.sortOrder = event.sortOrder === -1 ? 0 : 1;
    this.globalFilter = event.globalFilter ? event.globalFilter : this.setFilterToGetByClient();
    this.sortField = event.sortField ? event.sortField : 'ITEM_NAME';
    this.offset = event.first / event.rows;
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadLineItemList();
  }

  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  loadLineItemList() {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.LineItemTemplateService.getTemplateList(this.queryParam).subscribe(
      data => {
        this.loading = false;
        this.data = data.data.result;
        this.offset = data.data.first;
        this.totalRecords = data.data.totalRecords;
      }
    );
  }

  filterUom(event) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.uom.length; i++) {
      let uom = this.uom[i];
      if (uom.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(uom);
      }
    }
    this.filteredUom = filtered;
    this.filteredUom = this.filteredUom.sort();
  }

  loadUomList() {
    let datatableParam = {
      offset: 0,
      size: 100000,
      sortField: 'NAME',
      sortOrder: 0,
      searchText: '{"IS_ENABLE" : true}'
    };
    this.queryParam = this.prepareQueryParam(datatableParam);
    this._uomService.getUOMList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.uom = data.data.result;
          }
        } else {
        }
      },
      error => {
      }
    );
  }

  editTemplate(template) {
    this.dialogHeader = this.translator.instant('edit.line.item');
    this.template = { ...template };
    this.initializeLineItemform();
    this.lineItemTemplateForm.controls.id.patchValue(this.template.id);
    this.lineItemTemplateForm.controls.lineItemId.patchValue(this.template.lineItemId);
    this.lineItemTemplateForm.controls.updatedBy.patchValue(this.loggedInUserId);
    this.lineItemTemplateForm.controls.lineItemName.patchValue(this.template.lineItemName);
    this.lineItemTemplateForm.controls.quantity.patchValue(this.template.quantity);
    this.lineItemTemplateForm.controls.cost.patchValue(this.template.cost);
    this.lineItemTemplateForm.controls.unit.patchValue(this.template.unit);
    this.lineItemTemplateForm.controls.dynamicLabel1.patchValue(this.template.dynamicLabel1);
    this.lineItemTemplateForm.controls.dynamicLabel2.patchValue(this.template.dynamicLabel2);
    this.lineItemTemplateForm.controls.dynamicLabel3.patchValue(this.template.dynamicLabel3);
    this.lineItemTemplateForm.controls.description.patchValue(this.template.description);
    this.lineItemTemplateForm.controls.inclusions.patchValue(this.template.inclusions);
    this.lineItemTemplateForm.controls.exclusions.patchValue(this.template.exclusions);

    this.lineItemDialog = true;
  }


  onLineItemSubmit() {
    this.submitted = true;
    if (!this.lineItemTemplateForm.valid) {
      CustomValidator.markFormGroupTouched(this.lineItemTemplateForm);
      this.submitted = false;
      return false;
    }
    else {
      if (this.validateLengthForSingleWorkType(this.lineItemTemplateForm.value.description, this.lineItemTemplateForm.value.inclusions, this.lineItemTemplateForm.value.exclusions)) {
        if (this.lineItemTemplateForm.value.id === null) {
          this.LineItemTemplateService.addNewTemplate(this.lineItemTemplateForm.value).subscribe(
            data => {
              if (data.statusCode === '200' && data.message === 'OK') {
                this.submitted = false;
                this.lineItemTemplateForm.reset();
                this.lineItemDialog = false;
                this.loadLineItemList();
                this.uiNotificationService.success(this.translator.instant('lineItem.added.successfully'), '');
              }
              else {
                this.uiNotificationService.error(data.message, '');
              }
            }
            , error => {
              this.uiNotificationService.error(this.translator.instant('common.error'), '');
            }
          );
        }
        else {
          this.LineItemTemplateService.updateItem(this.lineItemTemplateForm.value).subscribe(
            data => {
              if (data.statusCode === '200' && data.message === 'OK') {
                this.submitted = false;
                this.lineItemTemplateForm.reset();
                this.lineItemDialog = false;
                this.loadLineItemList();
                this.uiNotificationService.success(this.translator.instant('lineItem.updated.successfully'), '');
              }
              else {
                this.uiNotificationService.error(data.message, '');
              }
            }
            , error => {
              this.uiNotificationService.error(this.translator.instant('common.error'), '');
            }
          );
        }
      }
    }
  }

  ondeleteItem(id) {
    this.LineItemTemplateService.deleteItem(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.loadLineItemList();
          this.uiNotificationService.success(this.translator.instant('lineItem.deleted.successfully'), '');
        }
        else {
          this.uiNotificationService.error(data.message, '');
        }
      }
      , error => {
        this.uiNotificationService.error(this.translator.instant('common.error'), '');
      }
    );
  }

  openDialogForDelete(id, lineItemName) {
    let options = null;
    let message = this.translator.instant('dialog.message');
    let status = this.translator.instant('delete');
    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message} ${status} ${lineItemName}?`),
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    }
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.ondeleteItem(id);
      }
    });
  }



  validateLengthForSingleWorkType(description, inclusion, exclusion) {
    if (this.returnLengthOfDescription(description) > 1000) {
      return false;
    }
    else if (this.returnLengthOfInclusion(inclusion) > 200) {
      return false;
    }
    else if (this.returnLengthOfExclusion(exclusion) > 200) {
      return false;
    }

    return true;
  }

  returnLengthOfDescription(description) {
    if (description) {
      var plainText = description.replace(/<[^>]*>/g, '');
      return plainText.length;
    }
    else {
      return 0;
    }
  }

  returnLengthOfInclusion(inclusion) {
    if (inclusion) {
      var plainText = inclusion.replace(/<[^>]*>/g, '');
      return plainText.length;
    }
    else {
      return 0;
    }
  }

  returnLengthOfExclusion(exclusion) {
    if (exclusion) {
      var plainText = exclusion.replace(/<[^>]*>/g, '');
      return plainText.length;
    }
    else {
      return 0;
    }
  }

}
