import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Table } from 'primeng/table';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { ExperienceLevelService } from 'src/app/service/admin-services/experience/experience.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { Experience } from 'src/app/shared/vo/experience';

@Component({
  selector: 'app-experience',
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.css']
})
export class ExperienceComponent implements OnInit, OnDestroy {

  @ViewChild('dt') table: Table;
  columns = [
    { label: this.translator.instant('experience'), value: 'LEVEL', name: 'level' },
  ];
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  blockSpecialForExperience: RegExp = COMMON_CONSTANTS.blockSpecialForExperience;
  _selectedColumns: any[];
  selectedExperience: Experience[] = [];
  experienceFilterValue = '';
  experienceLevelDialog = false;
  experienceLevelForm: FormGroup;
  loggedInUserId: string;
  data: Experience[] = [];
  url;
  status;
  loading = false;
  offset: Number = 0;
  datatableParam: DataTableParam;
  totalRecords: Number = 0;
  filterMap = new Map();
  sortField = 'LEVEL';
  queryParam;
  sortOrder;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN
  globalFilter;
  submitted = false;
  experience: Experience;
  dialogHeader: string;
  tableRowSize = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  tablePaginateDropdown = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  expressionType = [
    { value: 'Greater than' },
    { value: 'Less than' },
    { value: 'Between' },
  ];
  filteredExpressionType: any[];
  expression = 'Greater than';
  showButtons: boolean = true;
  clientAccess: any;
  btnDisabled: boolean = false;

  constructor(
    private captionChangeService: HeaderManagementService,
    private _experienceLevelService: ExperienceLevelService,
    private _formBuilder: FormBuilder,
    private _localStorageService: LocalStorageService,
    private translator: TranslateService,
    private confirmDialogService: ConfirmDialogueService,
    private notificationService: UINotificationService
  ) {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.datatableParam = new DataTableParam();
    this.datatableParam = {
      offset: 0,
      size: 2,
      sortField: 'LEVEL',
      sortOrder: 1,
      searchText: null
    };
  }
  ngOnDestroy(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(false);
  }

  ngOnInit(): void {
    this.clientAccess = this._localStorageService.getItem("userAccess");
    this._selectedColumns = this.columns;
    this.dialogHeader = 'Add Experience';
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.EXPERIENCE);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.loggedInUserId = this._localStorageService.getLoginUserId();
    this.initializeForm();
    if (this.clientAccess) {
      this.menuAccess();
    }
  }
  filterExpressionType(event): void {
    const filtered: any[] = [];
    const query = event.query;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.expressionType.length; i++) {
      const expressionType = this.expressionType[i];
      if (expressionType.value.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(expressionType.value);
      }
    }
    this.filteredExpressionType = filtered;
    this.filteredExpressionType = this.filteredExpressionType.sort();
  }
  onLazyLoad(event) {
    this.sortOrder = event.sortOrder === -1 ? 0 : 1;
    this.globalFilter = event.globalFilter ? event.globalFilter : null;
    this.sortField = event.sortField ? event.sortField : 'LEVEL';
    this.offset = event.first / event.rows;
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadExperienceList();
  }

  disableSelectedExperienceLevel() {
    this.selectedExperience.forEach(experience => this.disableExperience(experience.id, true));
    if (this.selectedExperience?.length) {
      this.notificationService.success(this.translator.instant('experience.level.disabled.successfully'), '');
    }
    this.selectedExperience.splice(0, this.selectedExperience.length);
    this.loadExperienceList();
  }

  addExperienceLevel(): void {
    this.dialogHeader = 'Add Experience';
    this.submitted = false;
    this.experienceLevelDialog = true;
    this.expression = 'Greater than';
    this.initializeForm();
  }

  hideDialog(): void {
    this.experienceLevelDialog = false;
    this.submitted = false;
    this.initializeForm();
  }

  filter() {
    this.filterMap.clear();
    if (this.experienceFilterValue !== '') {
      this.filterMap.set('LEVEL', this.experienceFilterValue);
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
    this.loadExperienceList();
  }


  clear() {
    this.experienceFilterValue = '';
    this.filter();
  }

  onSubmitExperienceLevelForm() {
    this.submitted = true;
    if (!this.experienceLevelForm.valid) {
      CustomValidator.markFormGroupTouched(this.experienceLevelForm);
      this.submitted = true;
      return false;
    }
    let experience = new Experience();
    if (this.experienceLevelForm.value.expression === 'Greater than') {
      experience.expression = 'GREATER_THAN';
      experience.fromYear = this.experienceLevelForm.value.fromYear;
    }
    else if (this.experienceLevelForm.value.expression === 'Less than') {
      experience.expression = 'LESS_THAN';
      experience.fromYear = this.experienceLevelForm.value.fromYear;
    }
    else {
      experience.expression = 'BETWEEN';
      experience.fromYear = this.experienceLevelForm.value.fromYear;
      experience.toYear = this.experienceLevelForm.value.toYear;
    }
    experience.createdBy = this.loggedInUserId;
    experience.updatedBy = this.loggedInUserId;
    experience.isEnable = true;
    if (this.experienceLevelForm.controls.id.value != null) {
      experience.id = this.experienceLevelForm.controls.id.value;
      if (this.experienceLevelForm.valid) {
        this._experienceLevelService.updateExperienceLevel(experience).subscribe(
          data => {
            if (data.statusCode === '200' && data.message === 'OK') {
              this.notificationService.success(this.translator.instant('experience.level.updated.successfully'), '');
              this.loadExperienceList();
              this.experienceLevelDialog = false;
              this.submitted = false;
            }
            else {
              this.notificationService.error(data.message, '');
              this.experienceLevelDialog = false;
              this.submitted = false;
            }
          },
          error => {
            this.notificationService.error(this.translator.instant('common.error'), '');
            this.experienceLevelDialog = false;
            this.submitted = false;
          }
        );
      }
    }
    else {
      if (this.experienceLevelForm.valid) {
        this._experienceLevelService.addExperienceLevel(experience).subscribe(
          data => {
            if (data.statusCode === '200' && data.message === 'OK') {
              this.notificationService.success(this.translator.instant('experience.level.added.successfully'), '');
              this.loadExperienceList();
              this.experienceLevelDialog = false;
              this.submitted = false;
            }
            else {
              this.notificationService.error(data.message, '');
              this.experienceLevelDialog = false;
              this.submitted = false;
            }
          },
          error => {
            this.notificationService.error(this.translator.instant('common.error'), '');
            this.experienceLevelDialog = false;
            this.submitted = false;
          }
        );
      }
    }
  }

  editExperience(experience: Experience): void {
    this.dialogHeader = 'Edit Experience';
    this.experience = { ...experience };
    if (this.experience.expression === 'GREATER_THAN') {
      this.expression = 'Greater than';
      this.experienceLevelForm.controls.expression.patchValue('Greater than');
    }
    else if (this.experience.expression === 'LESS_THAN') {
      this.expression = 'Less than';
      this.experienceLevelForm.controls.expression.patchValue('Less than');
    }
    else {
      this.expression = 'Between';
      this.experienceLevelForm.controls.expression.patchValue('Between');
    }
    this.initializeForm();
    this.experienceLevelForm.controls.id.patchValue(this.experience.id);
    this.experienceLevelForm.controls.fromYear.patchValue(this.experience.fromYear);
    if (this.experience.toYear) {
      this.experienceLevelForm.controls.toYear.patchValue(this.experience.toYear);
    }
    this.experienceLevelForm.controls.updatedBy.patchValue(this.loggedInUserId);

    this.experienceLevelDialog = true;
  }

  openDialog(id, level, status) {
    let options = null;
    let message = this.translator.instant('dialog.message');
    if (status) {
      this.status = 'disable';
    }
    else {
      this.status = 'enable';
    }
    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message} ${this.status} ${level}` + ' ?'),
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    }
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        if (status) {
          this.disableExperience(id);
        }
        else {
          this.enableExperience(id);
        }
      }
    });
  }

  private disableExperience(id: string, selectedExp?) {
    this._experienceLevelService.disableExperienceLevel(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          if (!selectedExp) {
            this.notificationService.success(this.translator.instant('experience.level.disabled.successfully'), '');
          }
          this.loadExperienceList();
        }
        else {
          this.notificationService.error(data.message, '');
        }
      },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      }
    );
  }

  private initializeForm() {
    if (this.expression === 'Greater than' || this.expression === 'Less than') {

      this.experienceLevelForm = this._formBuilder.group({
        id: [],
        level: [''],
        createdBy: this.loggedInUserId,
        updatedBy: this.loggedInUserId,
        isEnable: true,
        fromYear: ['', [CustomValidator.required]],
        expression: [this.expression, [CustomValidator.required]]
      });
    }
    else {
      this.experienceLevelForm = this._formBuilder.group({
        id: [],
        level: [''],
        createdBy: this.loggedInUserId,
        updatedBy: this.loggedInUserId,
        isEnable: true,

        fromYear: ['', [CustomValidator.required, Validators.min(0)]],
        toYear: ['', [CustomValidator.required, Validators.min(0)]],
        expression: [this.expression, [CustomValidator.required]]
      });
    }
  }

  private enableExperience(id: string) {
    const index = this.selectedExperience.findIndex(x => x.id === id);
    this.selectedExperience.splice(index, 1);
    this._experienceLevelService.enableExperienceLevel(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success(this.translator.instant('experience.level.enabled.successfully'), '');
          this.loadExperienceList();
        }
        else {
          this.notificationService.error(data.message, '');
        }
      },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      }
    );
  }

  private prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  private loadExperienceList() {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this._experienceLevelService.getExperienceLevelList(this.queryParam).subscribe(
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

  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    //restore original order
    this._selectedColumns = this.columns.filter(col => val.includes(col));
  }
  onExpressionTypeChange(event): void {
    this.expression = event;
    this.submitted = false;
    this.initializeForm();
  }
  menuAccess(): void {
    let accessPermission = this.clientAccess.filter(e => e.menuName == 'Masters');
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
