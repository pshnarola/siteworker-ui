import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { CityService } from 'src/app/service/admin-services/city/city.service';
import { FileDownloadService } from 'src/app/service/admin-services/fileDownload/file-download.service';
import { StateService } from 'src/app/service/admin-services/state/state.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { CommonService } from 'src/app/shared/common-services/common.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { City } from 'src/app/shared/vo/city/city';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { State } from 'src/app/shared/vo/state/state';
import { CityDTO } from './CityDTO';

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.css']
})
export class CityComponent implements OnInit, OnDestroy {
  city: City;
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  cityNameFilterValue = '';
  stateNameFilter = { id: 'all', name: 'All' } as State;
  selectedValue;
  cityData: City[];
  stated: State;
  stateData: State[];
  queryParam: URLSearchParams;
  loading: boolean;
  totalRecords: any;
  filterMap = new Map(); message: any;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  globalFilter: string = null;
  offset: Number = 0;
  sortField: any = 'NAME';
  sortOrder: any = 1;
  loginUserId: any;
  datatableParam: DataTableParam;
  displayDialog = false;
  cityDialog = false;
  submitted = false;
  myForm: FormGroup;
  currentFile: File;
  selectedFiles: FileList;
  isAllCitySelected = true;
  selectedCityArray: any[] = [];
  specificSelectedCityDisable = true;
  fileName = 'City_Sample.xlsx';
  selectedState: string;
  status: string;
  showButtons = true;
  clientAccess: any;
  btnDisabled = false;
  selectedLevel: State;
  cityName: any;
  cityValidator: boolean;
  stateValidator: boolean;

  f: NgForm;
  id: any;
  stateSubscription = new Subscription();

  cityForm: FormGroup;

  cityHeader: string;

  columns = [
    { label: this.translator.instant('city'), value: 'name', sortable: true },
    { label: this.translator.instant('state'), value: 'stateName', sortable: false },
  ];
  stateNameList: any;
  filteredState: any[];


  constructor(
    private translator: TranslateService,
    private _cityService: CityService,
    private _stateService: StateService,
    private _formBuilder: FormBuilder,
    private _localStorageService: LocalStorageService,
    private _notificationService: UINotificationService,
    private _fileService: FileDownloadService,
    private captionChangeService: HeaderManagementService,
    private confirmDialogueService: ConfirmDialogueService,
    private commonServices: CommonService

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
    this.loginUserId = _localStorageService.getLoginUserId();

  }

  ngOnInit(): void {
    this.clientAccess = this._localStorageService.getItem('userAccess');
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.CITY);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.initializeForm();
    this.stateSubscription.add(this.commonServices.getAllStateList().subscribe(
      data => {
        this.stateData = data;
      }));
    if (this.clientAccess) {
      this.menuAccess();
    }
  }
  ngOnDestroy(): void {
    this.stateSubscription.unsubscribe();
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
    this.loadCityList();
  }

  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  filter(): void {

    this.filterMap.clear();
    if (this.cityNameFilterValue) {
      this.filterMap.set('NAME', this.cityNameFilterValue);
    }
    if (this.stateNameFilter) {
      if (this.stateNameFilter.name !== 'All') {
        this.filterMap.set('STATE_NAME', this.stateNameFilter.name);
      }
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
    this.loadCityList();
  }

  clear() {
    this.stateNameFilter = { id: 'all', name: 'All' } as State;
    this.cityNameFilterValue = null;
    this.filter();
  }

  loadCityList() {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this._cityService.getCityListForMaster(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.loading = false;
            this.cityData = data.data.result;
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


  addCity() {
    this.cityDialog = true;
    this.cityHeader = 'Add City';
    this.initializeForm();
  }

  hideDialog(): any {
    this.cityDialog = false;
    this.submitted = false;
    this.initializeForm();
  }

  initializeForm() {
    this.cityForm = this._formBuilder.group({
      id: [],
      name: ['', [CustomValidator.required]],
      state: ['', [CustomValidator.required]],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      isEnable: 1
    });
  }

  onSubmit() {
    this.submitted = true;

    if (!this.cityForm.valid) {
      let controlName: string;
      for (controlName in this.cityForm.controls) {
        this.cityForm.controls[controlName].markAsDirty();
        this.cityForm.controls[controlName].updateValueAndValidity(); // Validate form field and show the message
      }
      this.submitted = true;
      return false;
    }

    if (this.cityForm.controls.id.value != null || this.id != null) {
      let cityDto = new CityDTO();
      cityDto = this.cityForm.value;
      this._cityService.updateCity(JSON.stringify(this.cityForm.value)).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('city.updated'), '');
            this.loadCityList();
            this.cityDialog = false;
            this.submitted = false;
            this.cityName = '';
            this.selectedLevel = null;
            this.id = null;
          } else {
            this._notificationService.error(data.message, '');
          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.cityDialog = false;
          this.submitted = false;
        }
      );
    } else {
      let cityDto = new CityDTO();
      cityDto = this.cityForm.value;
      this._cityService.addCity(JSON.stringify(this.cityForm.value)).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('city.added'), '');
            this.loadCityList();
            this.cityDialog = false;
            this.submitted = false;
            this.cityName = '';
            this.selectedLevel = null;
            this.id = null;
          } else {
            this._notificationService.error(data.message, '');
          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.cityDialog = false;
          this.submitted = false;
        }
      );
    }

  }

  editCity(city: City): void {
    this.cityDialog = true;
    this.cityHeader = 'Edit City';

    this.city = { ...city };
    this.cityForm.controls.id.patchValue(this.city.id);
    this.cityForm.controls.name.patchValue(this.city.name);
    this.cityForm.controls.state.patchValue(this.city.state);
    this.cityForm.controls.updatedBy.patchValue(this.city.updatedBy);
    this.cityForm.controls.createdBy.patchValue(this.city.createdBy);
  }

  disableSelectedCity() {
    this.specificSelectedCityDisable = false;
    this.selectedCityArray.forEach(cityData => this.disableCity(cityData.id, true));
    if (this.selectedCityArray?.length) {
      this._notificationService.success(this.translator.instant('city.disabled'), '');
    }
    this.loadCityList();
    this.selectedCityArray.splice(0, this.selectedCityArray.length);
  }

  enableSelectedCity() {
    this.specificSelectedCityDisable = false;
    this.selectedCityArray.forEach(cityData => this.enableCity(cityData.id));
    this.loadCityList();
  }

  enableCity(id): void {
    this.submitted = true;
    this._cityService.enableCity(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this._notificationService.success(this.translator.instant('city.enabled'), '');
          this.loadCityList();
          this.submitted = false;
        } else {
          this._notificationService.error(data.message, '');
          this.submitted = false;
        }
      },
      (error) => {
        this._notificationService.error(this.translator.instant('common.error'), '');
        this.submitted = false;
      }
    );
    this.initializeForm();
  }

  // disable City
  disableCity(id, selectedcity?): void {
    this.submitted = true;
    this._cityService.disableCity(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          if (!selectedcity) {
            this._notificationService.success(this.translator.instant('city.disabled'), '');
          }
          this.loadCityList();
          this.submitted = false;
        } else {
          this.submitted = false;
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

  // select file
  selectFile(event) {
    this.selectedFiles = event.addedFiles;
    if (event.rejectedFiles.length > 0) {
      if (event.rejectedFiles[0].reason === 'size') {
        this._notificationService.error(this.translator.instant('max.file.size.5.mb'), '');
      } else {
        this._notificationService.error(this.translator.instant('image.only.excel.upload'), '');
      }
      event.rejectedFiles = [];
    }
  }

  // upload file
  uploadBulk() {
    this.currentFile = this.selectedFiles[0];
    this._cityService.bulkUpload(this.currentFile, this.loginUserId).subscribe(
      event => {
        if (event.type === HttpEventType.UploadProgress) {
        } else if (event instanceof HttpResponse) {
          this.message = event.body.message;
          this.currentFile = undefined;
          this.selectedFiles = undefined;
          if (event.body.statusCode === '200' && event.body.message === 'OK') {
            this._notificationService.success(this.translator.instant('city.added'), '');
            this.loadCityList();
          } else {
            this._notificationService.error(event.body.message, '');
            this.loadCityList();
          }
        }
      },
      err => {
        this.message = 'Could not upload the file!';
        this.currentFile = undefined;
        this.selectedFiles = undefined;
        this.loadCityList();
        this._notificationService.error(this.message, '');
      });
    this.selectedFiles = undefined;
  }

  download(fileName): void {
    this._fileService
      .downloadFile(fileName)
      .subscribe(blob => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = this.fileName;
        a.click();
        URL.revokeObjectURL(objectUrl);
      });
  }

  openDialog(id, name, status): void {

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
          this.disableCity(id);
        }
        else {
          this.enableCity(id);
        }
      }
    });
  }

  menuAccess(): void {
    const accessPermission = this.clientAccess.filter(e => e.menuName == 'Masters');
    if (accessPermission[0].canModify) {
      this.showButtons = true;
      this.btnDisabled = false;
    }
    else {
      this.showButtons = false;
      this.btnDisabled = true;
    }
  }

  filterState(event) {
    const filtered: any[] = [];
    const query = event.query;
    for (let i = 0; i < this.stateData.length; i++) {
      const state = this.stateData[i];
      if (state.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(state);
      }
    }
    this.filteredState = filtered;
    const state = { id: 'all', name: 'All' } as State;
    this.filteredState.splice(0, 0, state);
  }

  formFilterState(event) {
    const filtered: any[] = [];
    const query = event.query;
    for (let i = 0; i < this.stateData.length; i++) {
      const state = this.stateData[i];
      if (state.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(state);
      }
    }
    this.filteredState = filtered;
  }

}
