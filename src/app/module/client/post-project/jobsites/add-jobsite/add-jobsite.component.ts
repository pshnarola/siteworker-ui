import { MapsAPILoader } from '@agm/core';
import { HttpResponse } from '@angular/common/http';
import { stringify } from '@angular/compiler/src/util';
import { Component, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { element } from 'protractor';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { concatMap, groupBy, toArray, map } from 'rxjs/operators';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { CityService } from 'src/app/service/admin-services/city/city.service';
import { FileDownloadService } from 'src/app/service/admin-services/fileDownload/file-download.service';
import { IndustryTypeService } from 'src/app/service/admin-services/industry-type/industry-type.service';
import { StateService } from 'src/app/service/admin-services/state/state.service';
import { JobsiteService } from 'src/app/service/client-services/post-project/jobsite.service';
import { PostProjectService } from 'src/app/service/client-services/post-project/post-project.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { City } from 'src/app/shared/vo/city/city';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { State } from 'src/app/shared/vo/state/state';
import { JobsiteStatus } from '../../../enums/jobsiteStatus';
import { JobsiteDetail } from '../../../Vos/jobsitemodel';
import { ProjectDetail } from '../../../Vos/projectDetailmodel';

@Component({
  selector: 'app-add-jobsite',
  templateUrl: './add-jobsite.component.html',
  styleUrls: ['./add-jobsite.component.css']
})
export class AddJobsiteComponent implements OnInit {
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  fileLabel = 'Choose File';
  addJobsiteForm: FormGroup;
  queryParam;
  datatableParam: DataTableParam = null;
  city: City[] = [];
  state: State[] = [];
  locationState;
  locationCity;
  locationZipCode;
  latitude;
  longitude;
  address;
  filteredState = [];
  filteredCity = [];
  submitted = false;
  isStatePresentInAdmin = false;
  isCityPresentInAdmin = false;
  isStateUndefined = false;
  isCityUndefined = false;
  zoom: number;
  loginUserId: string;
  jobsiteData = new JobsiteDetail();
  project: ProjectDetail;
  private geoCoder;
  filterMap = new Map();
  @Input() editJobsite;
  @Input() isDialogOpen;
  editedJobsite: JobsiteDetail;
  @Output() cancelDialog = new EventEmitter<boolean>();
  selectedFile: File[] = [];
  files: File[] = [];
  uploadedFile: any[] = [];
  uploadableFile: any[] = [];
  logoData;
  logoBody;
  isCancel = false;
  @Output()
  screenChange = new EventEmitter<string>();

  @ViewChild('search')
  public searchElementRef: ElementRef;
  cityParams: { name: any; };

  stateParams: { name: any; };

  constructor(
    // tslint:disable-next-line: variable-name
    private _formBuilder: FormBuilder,
    private stateService: StateService,
    private cityService: CityService,
    private notificationService1: UINotificationService,
    private translator: TranslateService,
    // tslint:disable-next-line: variable-name
    private _localStorageService: LocalStorageService,
    private postProjectService: PostProjectService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private jobsiteService: JobsiteService,
    private mapsAPILoader: MapsAPILoader,
    private industryTypeService: IndustryTypeService,
    private confirmDialogService: ConfirmDialogueService,
    // tslint:disable-next-line: variable-name
    private _fileService: FileDownloadService,
    private ngZone: NgZone,
    private filterLeftPanelService: FilterLeftPanelDataService) { }

  ngOnInit(): void {
    this.loginUserId = this._localStorageService.getLoginUserId();
    if (this._localStorageService.getItem('addProjectDetail')) {
      this.project = this._localStorageService.getItem('addProjectDetail');
    }
    this.getLocation();
    this.initializeAddJobsiteForm();
  }

  ngOnChanges() {
    if (this._localStorageService.getItem('addProjectDetail')) {
      this.project = this._localStorageService.getItem('addProjectDetail');
    }
    console.log(this.editJobsite);
    if (this.editJobsite) {
      this.editedJobsite = this.editJobsite;
      this.uploadedFile = this.editJobsite.attachment;
      this.setEditValueToForm(this.editJobsite);
    }
  }

  ngOnDestroy() {
    console.log('in jobsite destroy');
    if ((!this._localStorageService.getItem('milestoneScreen')) &&
      (!this._localStorageService.getItem('addJobsiteScreen')) &&
      (!this._localStorageService.getItem('addLineItemScreen')) &&
      (this._localStorageService.getItem('jobsiteScreen'))) {
      this.projectJobSelectionService.addJobsiteSubject.next(null);
    }


  }

  setEditValueToForm(jobsite) {
    this.addJobsiteForm.controls.id.setValue(jobsite.id);
    this.addJobsiteForm.controls.createdBy.setValue(jobsite.createdBy);
    this.addJobsiteForm.controls.updatedBy.setValue(this.loginUserId);
    this.addJobsiteForm.controls.title.setValue(jobsite.title);
    this.addJobsiteForm.controls.description.setValue(jobsite.description);
    this.addJobsiteForm.controls.jobCode.setValue(jobsite.jobCode);
    this.addJobsiteForm.controls.location.setValue(jobsite.location);
    this.addJobsiteForm.controls.zipCode.setValue(jobsite.zipCode);
    let city = {
      name: jobsite.city,
      id: 'staticCityId'
    }
    let state = {
      name: jobsite.state,
      id: 'staticStateId'
    }
    this.addJobsiteForm.controls.city.setValue(city);
    this.addJobsiteForm.controls.state.setValue(state);
    this.addJobsiteForm.controls.latitude.setValue(jobsite.latitude);
    this.addJobsiteForm.controls.longitude.setValue(jobsite.longitude);
    this.addJobsiteForm.controls.attachmentLink.setValue(jobsite.attachmentLink);
  }

  selectFile(event) {
    console.log(event);
    this.fileLabel = event.target.files[0].name;
  }

  getAddressFromAutocompleteMapsApi(event): void {
    console.log(event);
    this.isStatePresentInAdmin = false;
    this.isCityPresentInAdmin = false;
    this.locationState = event.get('STATE');
    this.locationCity = event.get('LOCALITY');
    this.locationZipCode = event.get('ZIPCODE');
    this.latitude = event.get('LATITUDE');
    this.longitude = event.get('LONGITUDE');
    this.address = event.get('ADDRESS');
    if (this.locationZipCode) {
      this.addJobsiteForm.controls.zipCode.setValue(this.locationZipCode);
    }
    this.addJobsiteForm.controls.latitude.setValue(this.latitude);
    this.addJobsiteForm.controls.longitude.setValue(this.longitude);
    this.addJobsiteForm.controls.location.setValue(this.address);
    if (this.locationCity) {
      this.filteredCity.forEach(city => {
        if (city.name.toLowerCase() === this.locationCity.toLowerCase()) {
          this.isCityPresentInAdmin = true;
          this.isCityUndefined = false;
          this.addJobsiteForm.controls.city.setValue(city);
        }
      });
    }
    else {
      this.isCityPresentInAdmin = true;
      this.isCityUndefined = false;
      this.addJobsiteForm.controls.city.setValue(null);
    }
    if (this.locationState) {
      this.filteredState.forEach(state => {
        if (state.name.toLowerCase() === this.locationState.toLowerCase()) {
          this.isStatePresentInAdmin = true;
          this.isStateUndefined = false;
          this.addJobsiteForm.controls.state.setValue(state);
        }
      });
    }
    else {
      this.isStatePresentInAdmin = true;
      this.isStateUndefined = false;
      this.addJobsiteForm.controls.state.setValue(null);
    }

    if (!this.isStatePresentInAdmin) {
      this.isStateUndefined = false;
      let state = { name: this.locationState, id: 'staticStateId' };
      this.addJobsiteForm.controls.state.setValue(state);
    }
    if (!this.isCityPresentInAdmin) {
      this.isCityUndefined = false;
      let city = { name: this.locationCity, id: 'staticCityId' };
      this.addJobsiteForm.controls.city.setValue(city);
    }
  }

  filterState(event): void {
    this.stateParams = {
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.stateParams);
    this.filterLeftPanelService.getStateForPostProject(this.queryParam).subscribe(data => {
      console.log(data);
      this.filteredState = data.data;
    });
  }

  filterCity(event): void {
    this.cityParams = {
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.cityParams);
    this.filterLeftPanelService.getCityForPostProject(this.queryParam).subscribe(data => {
      console.log(data);
      this.filteredCity = data.data;
    });
  }
  cancelAddJobsiteForm() {
    this.isCancel = true;
    this._localStorageService.removeItem('addJobsiteScreen');
    this.screenChange.emit('jobsiteListing');
  }

  onSaveAndAddJobsite() {
    this.submitted = true;
    if (!this.addJobsiteForm.valid) {
      CustomValidator.markFormGroupTouched(this.addJobsiteForm);
      this.submitted = false;
      return false;
    }
    if (this.addJobsiteForm.valid) {
      this.setAddJobsiteForm();

      if (this.selectedFile.length !== 0) {
        if (this.checkFileName()) {
          this.uploadFile('onSave');
        }
        else {
          this.notificationService1.error('You have selected same name files', '');
        }
      }
      else {
        this.onSave();
      }
    }
  }

  onSave() {
    if (this.uploadableFile.length !== 0) {
      this.jobsiteData.attachment = this.uploadedFile;
      this.uploadableFile.forEach((file) => {
        this.jobsiteData.attachment.push(file);
      });
    }
    else {
      this.jobsiteData.attachment = this.uploadedFile;
    }
    console.log(this.jobsiteData);
    this.jobsiteService.addNewJobsiteDetail(this.jobsiteData,
      this.translator.instant('jobsite.added.successfully')).subscribe(data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService1.success(this.translator.instant('jobsite.added.successfully'), '');
          console.log(data);
          if (!this.isCancel) {
            this._localStorageService.setItem('addJobsiteScreen', 'addJobsite');
            this.postProjectService.jobsiteScreenChange.next('addJobsite');
          }
          this.projectJobSelectionService.addJobsiteSubject.next(data);
          this.addJobsiteForm.reset();
          this.submitted = false;
          this.selectedFile.length = 0;
          this.uploadableFile.length = 0;
          this.uploadedFile.length = 0;
        }
        else {
          this.notificationService1.error(data.message, '');
        }
      },
        error => {
          this.notificationService1.error(this.translator.instant('common.error'), '');
        });
  }


  onSaveAndNext() {
    this.submitted = true;
    if (!this.addJobsiteForm.valid) {
      CustomValidator.markFormGroupTouched(this.addJobsiteForm);
      this.submitted = false;
      return false;
    }
    if (this.addJobsiteForm.valid) {
      this.setAddJobsiteForm();
      if (this.selectedFile.length !== 0) {
        if (this.checkFileName()) {
          this.uploadFile('onNext');
        }
        else {
          this.notificationService1.error('You have selected same name files', '');
        }
      }
      else {
        this.onNext();
      }
    }
  }

  onNext() {
    if (this.uploadableFile.length !== 0) {
      this.jobsiteData.attachment = this.uploadedFile;
      this.uploadableFile.forEach((file) => {
        this.jobsiteData.attachment.push(file);
      });
    }
    else {
      this.jobsiteData.attachment = this.uploadedFile;
    }
    this.jobsiteService.addNewJobsiteDetail(this.jobsiteData,
      this.translator.instant('jobsite.added.successfully')).subscribe(data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService1.success(this.translator.instant('jobsite.added.successfully'), '');
          this.submitted = false;
          this.selectedFile.length = 0;
          this.uploadableFile.length = 0;
          this.uploadedFile.length = 0;
          this._localStorageService.removeItem('addJobsiteScreen');
          this._localStorageService.setItem('jobsiteScreen', 'jobsiteListing', false);
          this.postProjectService.jobsiteScreenChange.next('jobsiteListing');
        }
        else {
          this.notificationService1.error(data.message, '');
        }
      },
        error => {
          this.notificationService1.error(this.translator.instant('common.error'), '');
        });
  }

  onUpdateJobsite() {
    this.submitted = true;
    if (!this.addJobsiteForm.valid) {
      CustomValidator.markFormGroupTouched(this.addJobsiteForm);
      this.submitted = false;
      return false;
    }
    if (this.addJobsiteForm.valid) {
      this.setEditJobsiteForm();
      console.log(this.editedJobsite);

      if (this.addJobsiteForm.valid) {
        this.setAddJobsiteForm();
        if (this.selectedFile.length !== 0) {
          if (this.checkFileName()) {
            this.uploadFile('onUpdate');
          }
          else {
            this.notificationService1.error('You have selected same name files', '');
          }
        }
        else {
          this.onUpdate();
        }
      }

    }
  }


  onUpdate() {
    if (this.uploadableFile.length !== 0) {
      this.editedJobsite.attachment = this.uploadedFile;
      this.uploadableFile.forEach((file) => {
        this.editedJobsite.attachment.push(file);
      });
    }
    else {
      this.editedJobsite.attachment = this.uploadedFile;
    }
    console.log(this.editedJobsite);
    this.jobsiteService.editJobsiteDetail(this.editedJobsite,
      this.translator.instant('jobsite.edited.successfully')).subscribe(data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService1.success(this.translator.instant('jobsite.edited.successfully'), '');
          let jobsite = this._localStorageService.getItem('selectedJobsiteOfDropdown');
          if (jobsite) {
            if (jobsite.id === data.data.id) {
              console.log(data);
              this._localStorageService.setItem('selectedJobsiteOfDropdown', data.data);
              this.projectJobSelectionService.selectedJobsiteOfDropdown.next(data.data);
            }
          }
          this.selectedFile.length = 0;
          this.uploadableFile.length = 0;
          this.uploadedFile.length = 0;
          this.projectJobSelectionService.addJobsiteSubject.next(data.data);
          this.cancelDialog.emit(false);
          this.submitted = false;
        } else {
          this.notificationService1.error(data.message, '');
          console.log(data);
        }
      });
  }

  onCancelDialog() {
    this.cancelDialog.emit(false);
  }

  private setAddJobsiteForm() {
    this.jobsiteData.id = this.addJobsiteForm.value.id;
    this.jobsiteData.createdBy = this.loginUserId;
    this.jobsiteData.updatedBy = this.loginUserId;
    this.jobsiteData.title = this.addJobsiteForm.value.title;
    this.jobsiteData.description = this.addJobsiteForm.value.description;
    this.jobsiteData.jobCode = this.addJobsiteForm.value.jobCode;
    this.jobsiteData.location = this.addJobsiteForm.value.location;
    this.jobsiteData.zipCode = this.addJobsiteForm.value.zipCode;
    this.jobsiteData.city = this.addJobsiteForm.value.city.name;
    this.jobsiteData.state = this.addJobsiteForm.value.state.name;
    this.jobsiteData.latitude = this.addJobsiteForm.value.latitude;
    this.jobsiteData.longitude = this.addJobsiteForm.value.longitude;
    this.jobsiteData.attachmentLink = this.addJobsiteForm.value.attachmentLink;
    this.jobsiteData.status = JobsiteStatus.DRAFT;
    if (this.project.id !== 'pid') {
      this.project.attachment = [];
      this.jobsiteData.project = this.project;
    }
    else {
      this.notificationService1.error(this.translator.instant('please.select.project'), '');
    }

    let loggedInUserObject = this._localStorageService.getLoginUserObject();

    if (loggedInUserObject.roles[0].roleName === 'SUPERVISOR') {
      this.jobsiteData.supervisor = this._localStorageService.getLoginUserObject();
      this.jobsiteData.user = this._localStorageService.getItem('clientOfLoggedInSupervisor');
    }
    else {
      this.jobsiteData.user = this._localStorageService.getLoginUserObject();
    }
  }

  private setEditJobsiteForm() {
    this.editedJobsite.id = this.addJobsiteForm.value.id;
    this.editedJobsite.createdBy = this.loginUserId;
    this.editedJobsite.updatedBy = this.loginUserId;
    this.editedJobsite.title = this.addJobsiteForm.value.title;
    this.editedJobsite.description = this.addJobsiteForm.value.description;
    this.editedJobsite.jobCode = this.addJobsiteForm.value.jobCode;
    this.editedJobsite.location = this.addJobsiteForm.value.location;
    this.editedJobsite.zipCode = this.addJobsiteForm.value.zipCode;
    this.editedJobsite.city = this.addJobsiteForm.value.city.name;
    this.editedJobsite.state = this.addJobsiteForm.value.state.name;
    this.editedJobsite.latitude = this.addJobsiteForm.value.latitude;
    this.editedJobsite.longitude = this.addJobsiteForm.value.longitude;
    this.editedJobsite.attachmentLink = this.addJobsiteForm.value.attachmentLink;
    console.log('this.addJobsiteForm.value.attachmentLink =>', this.addJobsiteForm.value.attachmentLink);

    this.editedJobsite.project.attachment = [];
  }

  private prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  private initializeAddJobsiteForm() {
    this.addJobsiteForm = this._formBuilder.group({
      id: [],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      title: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.maxLength(200)]],
      location: ['', [Validators.required, Validators.maxLength(100)]],
      jobCode: ['', [Validators.required, Validators.maxLength(30)]],
      latitude: [],
      longitude: [],
      state: [null, [Validators.required, Validators.maxLength(30)]],
      city: [null, [Validators.required, Validators.maxLength(30)]],
      zipCode: ['', [Validators.required, Validators.maxLength(5)]],
      attachmentLink: ['', Validators.pattern(COMMON_CONSTANTS.ATTECHMENT_LINK)]
    });
  }


  getLocation() {
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder();

      const autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          const place: google.maps.places.PlaceResult = autocomplete.getPlace();
          this.filterMap.clear();
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          const info = place.address_components;
          info.forEach(e => {
            console.log(e.types[0]);
            switch (e.types[0]) {
              case 'sublocality_level_1':
                this.filterMap.set('REGION', e.long_name);
                break;
              case 'administrative_area_level_1':
                this.filterMap.set('STATE', e.long_name);
                break;
              case 'country':
                this.filterMap.set('COUNTRY', e.long_name);
                break;
              case 'postal_code':
                this.filterMap.set('ZIPCODE', e.long_name);
                break;
              case 'locality':
                this.filterMap.set('LOCALITY', e.long_name);
                break;
              default:
                console.log('No such day exists!');
                break;
            }
          });
          this.filterMap.set('LATITUDE', place.geometry.location.lat());
          this.filterMap.set('LONGITUDE', place.geometry.location.lng());
          this.filterMap.set('ADDRESS', place.formatted_address);
          this.zoom = 12;
          const jsonObject = {};
          this.getAddressFromAutocompleteMapsApi(this.filterMap);

          this.filterMap.forEach((value, key) => {
            jsonObject[key] = value;
          });
          console.log(JSON.stringify(jsonObject));
        });
      });
    });
  }

  onFileSelect(event) {
    if (event.rejectedFiles.length > 0) {
      if (event.rejectedFiles[0].reason === 'size') {
        this.notificationService1.error(this.translator.instant('Max file size is 100 MB'), '');
      } else {
        this.notificationService1.error(this.translator.instant('image.pdf.doc.upload'), '');
      }
      event.rejectedFiles = [];
    }

    let validFiles: File[] = [];
    this.files.push(...event.addedFiles);
    let chekcLength = this.uploadedFile.length + this.files.length + this.selectedFile.length;

    if (chekcLength <= 10) {
      this.files.forEach((file) => {
        if (file.size > 100000000) {
          this.notificationService1.error('Size of ' + file.name + ' cannot be more than 100MB.', '');
        }
        else {
          validFiles.push(file);
        }
      });
      this.files = [];
      if (this.selectedFile.length === 0) {
        this.selectedFile = validFiles;
      }
      else {
        validFiles.forEach(file => {
          this.selectedFile.push(file);
        });
      }


      let fileNameChecking = [];
      if (this.uploadedFile.length > 0) {
        this.selectedFile.forEach(element1 => {
          fileNameChecking.push(element1);
        });
        this.uploadedFile.forEach(element => {
          let file = {
            createdBy: element.createdBy,
            createdDate: element.createdDate,
            name: element.filename,
            id: element.id,
            path: element.path,
            updatedBy: element.updatedBy,
            updatedDate: element.updatedDate,
          }
          fileNameChecking.push(file);
        });
      }
      else {
        this.selectedFile.forEach(element1 => {
          fileNameChecking.push(element1);
        });
      }
      console.log(fileNameChecking);
      if (!this.groupByFileName(fileNameChecking)) {
        this.notificationService1.error('You have selected same name files', '');
      }
    }
    else {
      this.notificationService1.error('Maximum number of file should be 10.', '');
      this.files.splice(0, this.files.length);
    }
    console.log(this.selectedFile);
  }

  checkFileName() {
    let fileNameChecking = [];
    if (this.uploadedFile.length > 0) {
      this.selectedFile.forEach(element1 => {
        fileNameChecking.push(element1);
      });
      this.uploadedFile.forEach(element => {
        let file = {
          createdBy: element.createdBy,
          createdDate: element.createdDate,
          name: element.filename,
          id: element.id,
          path: element.path,
          updatedBy: element.updatedBy,
          updatedDate: element.updatedDate,
        }
        fileNameChecking.push(file);
      });
    }
    else {
      this.selectedFile.forEach(element1 => {
        fileNameChecking.push(element1);
      });
    }

    return this.groupByFileName(fileNameChecking);
  }

  groupByFileName(data) {
    let groupByStatusProject = [];
    let count = 0;
    const records = data;
    const pipedRecords = new Subject();
    const result = pipedRecords.pipe(
      groupBy(
        (x: any) => x.name,
        null,
        null,
        () => new ReplaySubject()
      ),
      concatMap(
        object => object.pipe(
          toArray(),
          map(obj =>
            ({ key: object.key, value: obj })
          ))
      )
    );

    result.subscribe(x => {
      groupByStatusProject.push(x);
    });

    records.forEach(x => pipedRecords.next(x));
    pipedRecords.complete();

    groupByStatusProject.forEach(element => {
      if (element.value.length > 1) {
        count++;
      }
    });

    if (count > 0) {
      return false;
    }
    else {
      return true;
    }
  }

  uploadFile(methodName) {
    this.uploadableFile.length = 0;
    console.log(this.selectedFile);

    const uploadFileData = new FormData();
    this.selectedFile.forEach((file) => {
      uploadFileData.append('file', file);
    });

    this._fileService.uploadMultipleFile(uploadFileData).subscribe(
      event => {
        if (event instanceof HttpResponse) {
          this.logoBody = event.body;
          this.logoData = this.logoBody.data;
          if (this.logoData.length === this.selectedFile.length) {
            this.selectedFile.forEach((element, i) => {
              let myFile = {
                id: '',
                createdBy: this.loginUserId,
                updatedBy: this.loginUserId,
                filename: element.name,
                path: this.logoData[i]
              }
              this.uploadableFile.push(myFile);
            });
          }
          if ('onSave' === methodName) {
            this.onSave();
          }
          if ('onNext' === methodName) {
            this.onNext();
          }
          if ('onUpdate' === methodName) {
            this.onUpdate();
          }
        }
      },
      (error) => {
        this.notificationService1.error(this.translator.instant('common.error'), '');
        console.log(error);
      });
  }

  openWarnigDialog(name, index1, file) {
    let options = null;
    options = {
      title: 'Warning',
      message: 'Are you sure you want to delete?',
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    }
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        let remainingFile: File[] = [];
        this.selectedFile.forEach((file, index) => {
          if (index !== index1) {
            remainingFile.push(file);
          }
        });
        this.selectedFile.length = 0;
        this.selectedFile = remainingFile;
      }
    });
  }

  openWarnigDialogForUploaded(name, id) {
    let options = null;
    options = {
      title: 'Warning',
      message: 'Are you sure you want to delete ' + name + '?',
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    }
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.deleteAttachment(id);
      }
    });
  }

  deleteAttachment(id) {
    this.jobsiteService.deleteJobsiteAttachment(id).subscribe(
      data => {
        if (data) {
          let remainingAttachment: any[] = [];
          this.uploadedFile.forEach((attachment, index) => {
            if (attachment.id !== id) {
              remainingAttachment.push(attachment);
            }
          });
          this.uploadedFile = remainingAttachment;
          console.log(this.uploadedFile);
        }
      }
    );
  }
}
