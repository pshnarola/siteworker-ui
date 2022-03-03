import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ExperienceLevelService } from 'src/app/service/admin-services/experience/experience.service';
import { FileDownloadService } from 'src/app/service/admin-services/fileDownload/file-download.service';
import { JobRateCardService } from 'src/app/service/admin-services/job-rate-card.service';
import { JobTitleService } from 'src/app/service/admin-services/job-title/job-title.service';
import { StateService } from 'src/app/service/admin-services/state/state.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { UserService } from 'src/app/service/User.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { User } from 'src/app/shared/vo/User';
import { CreateJobRateCardDTO } from '../vos/CreateJobRateCardDTO';
import { JobRateCardConfigurationDTO } from '../vos/JobRateCardConfigurationDTO';
import { JobRateCardDTO } from '../vos/JobRateCardDTO';

@Component({
  selector: 'app-manage-job-rate-card',
  templateUrl: './manage-job-rate-card.component.html',
  styleUrls: ['./manage-job-rate-card.component.css']
})
export class ManageJobRateCardComponent implements OnInit {
  myForm: FormGroup;
  calculateForm: FormGroup;
  myClientAndStateForm: FormGroup;
  myMarkupForm: FormGroup;
  queryParam;
  dataTableParam: DataTableParam;
  chooseFileFlagDisabled = true;
  columns = [
    { label: 'Worker Job Title', value: 'title', sortable: true, isHidden: false, field: 'title' },
    { label: 'Experience', value: 'experience', sortable: true, isHidden: false, field: 'experience' },
    { label: 'Min Pay Rate', value: 'minPay', sortable: true, isHidden: false, field: 'minPay' },
    { label: 'Max Pay Rate', value: 'maxPay', sortable: true, isHidden: false, field: 'maxPay' },
    { label: 'Min Bill Rate', value: 'minBill', sortable: true, isHidden: false, field: 'minBill' },
    { label: 'Max Bill Rate', value: 'maxBill', sortable: true, isHidden: false, field: 'maxBill' },
    { label: 'Min Spread/Profit', value: 'minSpread', sortable: true, isHidden: false, field: 'minSpread' },
    { label: 'Max Spread/Profit', value: 'maxSpread', sortable: true, isHidden: false, field: 'maxSpread' },
    { label: 'Profit Margin', value: 'profitMargin', sortable: true, isHidden: false, field: 'profitMargin' },
  ];
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  totalRecords;
  selectedFiles: FileList;
  currentFile: File;
  message: any;
  isFilterOpened: boolean;
  loginUserId: any;
  jobTitleData = [];
  jobTitleList = [];
  filteredJobTitle: any[] = [];
  experienceData = [];
  experienceList = [];
  filteredExperience: any[] = [];
  jobRateCardJson = [];
  myjobRateCardForm: FormGroup;
  minBillRate;
  maxBillRate;
  minProfit;
  maxProfit;
  isDisabled = true;
  users = [];
  datatableParamForUser: DataTableParam;
  filteredUser: any[];
  filteredState: any[];
  state = [];
  stateList = [];
  submitted: boolean;
  submittedMarkup: boolean;
  fileName = 'Job_Rate_Card_Sample.xlsx';
  fileParams: { clientId: any; stateId: any; type: any; amount: any; adminId: any; isAllowToCreate: boolean; };
  globalFilter: string;
  editJobRateCardData = [];
  errorFlag: boolean;
  isEditMode = false;
  constructor(
    private captionChangeService: HeaderManagementService,
    private formBuilder: FormBuilder,
    private fileService: FileDownloadService,
    private jobTitleService: JobTitleService,
    private experienceService: ExperienceLevelService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private userService: UserService,
    private stateService: StateService,
    private jobRateCardService: JobRateCardService,
    private localStorageService: LocalStorageService,
    private router: Router
  ) {
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.MANAGE_JOB_RATE_CARD);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(false);
    this.datatableParamForUser = new DataTableParam();
    this.datatableParamForUser = {
      offset: 0,
      size: 100000,
      sortField: 'FIRST_NAME',
      sortOrder: 1,
      searchText: '{"ROLE_NAME": "CLIENT"}'
    };
  }

  ngOnInit(): void {
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.MANAGE_JOB_RATE_CARD);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.initializeForm();
    const data = [];
    this.initializeJobRateCardForm(data);
    this.initializeMarkUpForm();
    this.initializeClientStateForm();
    this.getExperienceList();
    this.getJobTitleList();
    this.enableChooseFile();
    // this.getEditJobRateCardData();
    this.getStateList();
    this.getUserList();
  }
  enableChooseFile() {
    this.myMarkupForm.get('amount').valueChanges.subscribe(amountData => {
      if ((amountData > 0) && this.myClientAndStateForm.get('client').value && this.myClientAndStateForm.get('state').value) {
        this.chooseFileFlagDisabled = false;
      }
      else {
        this.chooseFileFlagDisabled = true;
      }
    });
    this.myMarkupForm.get('percentage').valueChanges.subscribe(percentData => {
      if ((percentData > 0) && this.myClientAndStateForm.get('client').value && this.myClientAndStateForm.get('state').value) {
        this.chooseFileFlagDisabled = false;
      }
      else {
        this.chooseFileFlagDisabled = true;
      }
    });
    this.myClientAndStateForm.get('client').valueChanges.subscribe(clientData => {
      if (clientData && (this.myMarkupForm.get('percentage').value > 0 || this.myMarkupForm.get('amount').value > 0)
        && this.myClientAndStateForm.get('state').value) {
        this.chooseFileFlagDisabled = false;
      }
      else {
        this.chooseFileFlagDisabled = true;
      }
    });
    this.myClientAndStateForm.get('state').valueChanges.subscribe(stateData => {
      if (stateData && (this.myMarkupForm.get('percentage').value > 0 || this.myMarkupForm.get('amount').value > 0)
        && this.myClientAndStateForm.get('client').value) {
        this.chooseFileFlagDisabled = false;
      }
      else {
        this.chooseFileFlagDisabled = true;
      }
    });
    if (this.localStorageService.getItem('manageEditJobrateCardData')) {
      this.chooseFileFlagDisabled = false;

    }
  }
  getEditJobRateCardData(): void {
    if (this.localStorageService.getItem('manageEditJobrateCardData')) {

      const editData = this.localStorageService.getItem('manageEditJobrateCardData');
      this.myClientAndStateForm.get('client').setValue(editData.client);
      this.myClientAndStateForm.get('state').setValue(editData.state);
      if (editData.markUpType === 'PERCENTAGE') {
        this.myMarkupForm.get('markup').setValue(true);
        this.myMarkupForm.get('percentage').setValue(editData.amount);
      }
      else {
        this.myMarkupForm.get('markup').setValue(false);
        this.myMarkupForm.get('amount').setValue(editData.amount);
      }
      // this.getEditJobRateCardConfiguartionData(editData.id);
    }
  }
  getEditJobRateCardConfiguartionData(id) {
    const filterMap = new Map();
    filterMap.set('JOB_RATE_CARD_ID', id);
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });

    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: 0,
      size: 10000,
      sortField: '',
      sortOrder: 1,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.jobRateCardService.getJobRateCardConfiguration(this.queryParam).subscribe(data => {

      this.editJobRateCardData = data.data.result;



    });
  }
  getJobTitleExperienceData() {
    this.jobRateCardJson.length = 0;


    this.jobTitleData.forEach(element => {
      this.experienceData.forEach(experience => {
        this.jobRateCardJson.push({
          title: element,
          experience,
        });
      });
    });

    if (this.localStorageService.getItem('manageEditJobrateCardData')) {
      this.isEditMode = true;
      this.getEditJobRateCardData();
      const filterMap = new Map();
      filterMap.set('JOB_RATE_CARD_ID', this.localStorageService.getItem('manageEditJobrateCardData').id);
      const jsonObject = {};
      filterMap.forEach((value, key) => {
        jsonObject[key] = value;
      });

      this.globalFilter = JSON.stringify(jsonObject);
      this.dataTableParam = {
        offset: 0,
        size: 10000,
        sortField: '',
        sortOrder: 1,
        searchText: this.globalFilter
      };
      this.queryParam = this.prepareQueryParam(this.dataTableParam);
      this.jobRateCardService.getJobRateCardConfiguration(this.queryParam).subscribe(data => {

        this.editJobRateCardData = data.data.result;

        this.initializeJobRateCardForm(this.jobRateCardJson, this.editJobRateCardData);
      });
    }
    else {
      this.initializeJobRateCardForm(this.jobRateCardJson);
    }

  }
  initializeForm(): void {
    this.myForm = this.formBuilder.group({
      title: [],
      experience: [],

    });
  }
  initializeJobRateCardForm(data, editData?): void {
    const jobRateCardList = new FormArray([]);
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < data.length; i++) {
      jobRateCardList.push(this.formBuilder.group({
        jobTitle: data[i].title,
        experience: data[i].experience,
        minPayRate: [0, Validators.maxLength(5)],
        maxPayRate: [0],
        minBillRate: [0],
        maxBillRate: [0],
        minProfit: [0],
        maxProfit: [0],
        profitMargin: [0]
      }));
    }
    this.myjobRateCardForm = this.formBuilder.group({
      jobRateCardList

    });
    if (this.localStorageService.getItem('manageEditJobrateCardData')) {
      let tempList = [];
      let tempList1 = [];
      let tempList2 = [];
      this.isDisabled = false;
      let jobRateCardList = new FormArray([]);
      if (editData) {
        for (let i = 0; i < data.length; i++) {
          if (!editData.some(item => item.experience.id === data[i].experience.id && item.jobTitle.id === data[i].title.id)) {
            tempList1.push(data[i]);
            tempList2.push(data[i]);
            jobRateCardList.push(this.formBuilder.group({
              jobTitle: data[i].title,
              experience: data[i].experience,
              minPayRate: [0, Validators.maxLength(5)],
              maxPayRate: [0],
              minBillRate: [0],
              maxBillRate: [0],
              minProfit: [0],
              maxProfit: [0],
              profitMargin: [0]
            }));
          }
          else {
            editData.forEach(editData1 => {
              if (editData1.experience.id === data[i].experience.id && editData1.jobTitle.id === data[i].title.id) {
                tempList.push(editData1);
                tempList2.push(editData1);
                jobRateCardList.push(this.formBuilder.group({
                  jobTitle: editData1.jobTitle,
                  experience: editData1.experience,
                  minPayRate: editData1.minPayRate,
                  maxPayRate: editData1.maxPayRate,
                  minBillRate: editData1.minBillRate,
                  maxBillRate: editData1.maxBillRate,
                  minProfit: editData1.minProfit,
                  maxProfit: editData1.maxProfit,
                  profitMargin: editData1.profitMargin,
                }));
              }
            });
          }
        }




        this.myjobRateCardForm = this.formBuilder.group({
          jobRateCardList
        });
      }
    }
  }
  initializeClientStateForm(): void {
    this.myClientAndStateForm = this.formBuilder.group({
      state: [, CustomValidator.required],
      client: [, CustomValidator.required],
    });
  }
  initializeMarkUpForm(): void {
    this.myMarkupForm = this.formBuilder.group({
      markup: [true],
      percentage: [, CustomValidator.required],
      amount: [, CustomValidator.required]
    });
    this.myMarkupForm.get('markup').valueChanges.subscribe(response => {
      if (!response) {
        this.myMarkupForm.addControl('amount', new FormControl());
        this.myMarkupForm.removeControl('percentage');
      }
      if (response) {
        this.myMarkupForm.addControl('percentage', new FormControl());
        this.myMarkupForm.removeControl('amount');
      }
    });
  }
  ngOnDestroy() {
    this.localStorageService.removeItem('manageEditJobrateCardData');
  }
  filter(): void {
    this.jobRateCardJson.length = 0;
    this.myForm.value.title.forEach(element => {
      this.myForm.value.experience.forEach(experience => {
        this.jobRateCardJson.push({
          title: element,
          experience: experience,
        });
      });
    });


    this.initializeJobRateCardForm(this.jobRateCardJson, this.editJobRateCardData);

  }
  clear() {
    this.myForm.reset();
    this.getJobTitleExperienceData();
  }
  download(fileName): void {
    this.fileService
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
  selectFile(event): void {
    this.selectedFiles = event.addedFiles;
    if (event.rejectedFiles.length > 0) {
      if (event.rejectedFiles[0].reason === 'size') {
        this.notificationService.error(this.translator.instant('max.file.size.5.mb'), '');
      } else {
        this.notificationService.error(this.translator.instant('image.only.excel.upload'), '');
      }
      event.rejectedFiles = [];
    }
  }


  uploadBulk(): void {
    this.currentFile = this.selectedFiles[0];

    const adminId = this.localStorageService.getLoginUserId();
    let type;
    let amount;
    const stateId = this.myClientAndStateForm.value.state.id;
    const clientId = this.myClientAndStateForm.value.client.id;
    if (this.myMarkupForm.value.markup === true) {
      type = 'PERCENTAGE';
      amount = this.myMarkupForm.value.percentage;
    } else {
      type = 'AMOUNT';
      amount = this.myMarkupForm.value.amount;
    }
    this.fileParams = {
      clientId,
      stateId,
      type,
      amount,
      adminId,
      isAllowToCreate: false
    };
    this.queryParam = this.prepareQueryParam(this.fileParams);
    this.jobRateCardService.bulkUpload(this.currentFile, this.queryParam).subscribe(
      event => {


        if (event.type === HttpEventType.UploadProgress) {

        } else if (event instanceof HttpResponse) {
          this.message = event.body.message;
          if (event.body.statusCode === '200' && event.body.message === 'OK') {
            this.notificationService.success(this.translator.instant('upload.successful'), '');
            this.router.navigate(['/admin/job-ratecard']);
          }
          else {
            this.notificationService.error(event.body.message, '');
          }

        }
      },
      err => {

        this.message = 'Could not upload the file!';
        this.currentFile = undefined;
      });
    this.selectedFiles = undefined;
  }
  onFilterOpen(): void {
    this.isFilterOpened = !this.isFilterOpened;
  }
  getJobTitleList() {
    this.dataTableParam = {
      offset: 0,
      size: 20000,
      sortField: 'TITLE',
      sortOrder: 1,
      searchText: null
    };
    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.jobTitleService.getJobTitleList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.jobTitleData = data.data.result;
            this.getJobTitleExperienceData();
            // tslint:disable-next-line: no-shadowed-variable
            this.jobTitleData.forEach(data => {
              this.jobTitleList.push(data.title);
            });
          }
        } else {
        }
      },
      error => {
      }
    );
  }
  prepareQueryParam(paramObject): Params {
    // tslint:disable-next-line: new-parens
    const params = new URLSearchParams;
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }
  filterJobTitle(event): void {
    const filtered: any[] = [];
    const query = event.query;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.jobTitleData.length; i++) {
      const jobTitle = this.jobTitleData[i];
      if (jobTitle.title.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(jobTitle);
      }
    }
    this.filteredJobTitle = filtered;
  }
  getExperienceList(): void {

    this.dataTableParam = {
      offset: 0,
      size: 20000,
      sortField: 'LEVEL',
      sortOrder: 1,
      searchText: null
    };
    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.experienceService.getExperienceLevelList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.experienceData = data.data.result;
            // tslint:disable-next-line: no-shadowed-variable
            this.experienceData.forEach(data => {
              this.experienceList.push(data.level);
            });

          }
        } else {
        }
      },
      error => {
      }
    );
  }
  filterExperience(event): void {
    const filtered: any[] = [];
    const query = event.query;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.experienceData.length; i++) {
      const client = this.experienceData[i];
      if (client.level.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(client);
      }
    }
    this.filteredExperience = filtered;
  }

  calculateMinBillRate(rate, percentage, i, data): any {
    const minBillRate = ((rate * percentage) / 100) + rate;
    // 
    this.jobRateCardJson.push({
      title: data.title,
      experience: data.level,
      minBillRate
    });

  }
  onEnterMinPayRate(event, i): void {
    // this.errorFlag = false;
    // let minPayRate = event.value;
    // let maxPayRate = this.myjobRateCardForm.value.maxPayRate;
    // // tslint:disable-next-line: radix
    // if (parseFloat(minPayRate) !== 0) {
    //   // tslint:disable-next-line: radix
    //   if (parseFloat(maxPayRate) <= parseFloat(minPayRate)) {
    //     this.errorFlag = true;
    //   }
    //   else {
    //     this.errorFlag = false;
    //   }
    // }
    if (this.myMarkupForm.value.percentage) {
      let minBillRate = ((event.value * this.myMarkupForm.value.percentage) / 100) + event.value;
      minBillRate = (+parseFloat(minBillRate).toFixed(2));
      // tslint:disable-next-line: no-angle-bracket-type-assertion
      (<FormArray>this.myjobRateCardForm.get('jobRateCardList')).controls[i].get('minBillRate').setValue(minBillRate);
      const minProfit = minBillRate - (+parseFloat(event.value).toFixed(2));
      (this.myjobRateCardForm.get('jobRateCardList') as FormArray).controls[i].get('minProfit').setValue(minProfit);
      const profitMargin = (minProfit * 100) / minBillRate;

      (this.myjobRateCardForm.get('jobRateCardList') as FormArray).controls[i].get('profitMargin').setValue(profitMargin.toPrecision(4));
    }
    else if (this.myMarkupForm.value.amount) {
      const minBillRate = (event.value + this.myMarkupForm.value.amount);
      this.minBillRate = minBillRate;
      // tslint:disable-next-line: no-angle-bracket-type-assertion
      (<FormArray>this.myjobRateCardForm.get('jobRateCardList')).controls[i].get('minBillRate').setValue(minBillRate);
      const minProfit = minBillRate - event.value;
      (this.myjobRateCardForm.get('jobRateCardList') as FormArray).controls[i].get('minProfit').setValue(minProfit);
      const profitMargin = (minProfit * 100) / minBillRate;

      (this.myjobRateCardForm.get('jobRateCardList') as FormArray).controls[i].get('profitMargin').setValue(profitMargin.toPrecision(4));
    }
  }
  onEnterMaxPayRate(event, i): void {
    // this.errorFlag = false;
    // let minPayRate = event.value;
    // let maxPayRate = this.myjobRateCardForm.value.maxPayRate;
    // // tslint:disable-next-line: radix
    // if (parseFloat(minPayRate) !== 0) {
    //   // tslint:disable-next-line: radix
    //   if (parseFloat(maxPayRate) <= parseFloat(minPayRate)) {
    //     this.errorFlag = true;
    //   }
    //   else {
    //     this.errorFlag = false;
    //   }
    // }
    if (this.myMarkupForm.value.percentage) {
      const maxBillRate = ((event.value * this.myMarkupForm.value.percentage) / 100) + event.value;
      // tslint:disable-next-line: no-angle-bracket-type-assertion
      (<FormArray>this.myjobRateCardForm.get('jobRateCardList')).controls[i].get('maxBillRate').setValue(maxBillRate);
      const maxProfit = maxBillRate - event.value;
      (this.myjobRateCardForm.get('jobRateCardList') as FormArray).controls[i].get('maxProfit').setValue(maxProfit);
    }
    else if (this.myMarkupForm.value.amount) {
      const maxBillRate = (event.value) + this.myMarkupForm.value.amount;
      // tslint:disable-next-line: no-angle-bracket-type-assertion
      (<FormArray>this.myjobRateCardForm.get('jobRateCardList')).controls[i].get('maxBillRate').setValue(maxBillRate);
      const maxProfit = maxBillRate - event.value;
      (this.myjobRateCardForm.get('jobRateCardList') as FormArray).controls[i].get('maxProfit').setValue(maxProfit);
    }
  }
  OnEnterAmount(event): void {

    const temp = this.myjobRateCardForm.get('jobRateCardList').value;

    temp.forEach((element, index) => {
      if (element.minPayRate > 0) {
        if (this.myMarkupForm.value.markup === true && event.value > 0) {
          const minBillRate = ((element.minPayRate * event.value) / 100) + element.minPayRate;

          // tslint:disable-next-line: no-angle-bracket-type-assertion
          (<FormArray>this.myjobRateCardForm.get('jobRateCardList')).controls[index].get('minBillRate').setValue(minBillRate.toPrecision(4));
          const minProfit = minBillRate - (+parseFloat(element.minPayRate).toFixed(2));
          (this.myjobRateCardForm.get('jobRateCardList') as FormArray).controls[index].get('minProfit').setValue(minProfit);
          const profitMargin = ((minProfit) * 100) / minBillRate;

          (this.myjobRateCardForm.get('jobRateCardList') as FormArray).controls[index].get('profitMargin')
            .setValue(profitMargin.toPrecision(4));
        }
        else if (this.myMarkupForm.value.markup === false && event.value > 0) {
          const minBillRate = (element.minPayRate + event.value);
          // tslint:disable-next-line: no-angle-bracket-type-assertion
          (<FormArray>this.myjobRateCardForm.get('jobRateCardList')).controls[index].get('minBillRate').setValue(minBillRate);
          const minProfit = minBillRate - element.minPayRate;
          (this.myjobRateCardForm.get('jobRateCardList') as FormArray).controls[index].get('minProfit').setValue(minProfit);
          const profitMargin = ((minProfit) * 100) / minBillRate;

          (this.myjobRateCardForm.get('jobRateCardList') as FormArray).controls[index].get('profitMargin').setValue(profitMargin.toPrecision(4));
        }
      }
      if (element.maxPayRate > 0) {
        if (this.myMarkupForm.value.markup === true && event.value > 0) {
          const maxBillRate = ((element.maxPayRate * event.value) / 100) + element.maxPayRate;
          // tslint:disable-next-line: no-angle-bracket-type-assertion
          (<FormArray>this.myjobRateCardForm.get('jobRateCardList')).controls[index].get('maxBillRate').setValue(maxBillRate);
          const maxProfit = maxBillRate - element.maxPayRate;
          (this.myjobRateCardForm.get('jobRateCardList') as FormArray).controls[index].get('maxProfit').setValue(maxProfit);
        }
        else if (this.myMarkupForm.value.markup === false && event.value > 0) {
          const maxBillRate = element.maxPayRate + event.value;
          // tslint:disable-next-line: no-angle-bracket-type-assertion
          (<FormArray>this.myjobRateCardForm.get('jobRateCardList')).controls[index].get('maxBillRate').setValue(maxBillRate);
          const maxProfit = maxBillRate - element.maxPayRate;
          (this.myjobRateCardForm.get('jobRateCardList') as FormArray).controls[index].get('maxProfit').setValue(maxProfit);
        }
      }
    });
    if (event.value > 0) {
      this.isDisabled = false;
    }
    else {
      this.isDisabled = true;
    }
  }
  getUserList(): void {
    this.queryParam = this.prepareQueryParam(this.datatableParamForUser);
    this.userService.getUserList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.users = data.data.result;
          }
        } else {
          this.notificationService.error(data.errorCode, '');
        }
      },
      error => {

      }
    );
  }
  filterUser(event): void {
    const filtered: any[] = [];
    const query = event.query;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.users.length; i++) {
      const users = this.users[i];
      if (users.firstName.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(users);
      }
    }
    this.filteredUser = filtered;
  }
  getStateList(): void {
    this.dataTableParam = {
      offset: 0,
      size: 20000,
      sortField: 'NAME',
      sortOrder: 1,
      searchText: null
    };
    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.stateService.getStateList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.state = data.data.result;
            // tslint:disable-next-line: no-shadowed-variable
            this.state.forEach(data => {
              this.stateList.push(data);
            });
          }
        } else {
        }
      },
      error => {
      }
    );
  }
  filterState(event): void {
    const filtered: any[] = [];
    const query = event.query;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.state.length; i++) {
      const client = this.state[i];
      if (client.name.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(client);
      }
    }
    this.filteredState = filtered;

  }
  generateJobRateCard() {
    this.submitted = true;
    if (!this.myClientAndStateForm.valid) {
      let controlName: string;
      // tslint:disable-next-line: forin
      for (controlName in this.myClientAndStateForm.controls) {
        this.myClientAndStateForm.controls[controlName].markAsDirty();
        this.myClientAndStateForm.controls[controlName].updateValueAndValidity();
      }
      this.submitted = true;
      return false;
    }
    this.submittedMarkup = true;
    if (!this.myMarkupForm.valid) {
      let controlName: string;
      // tslint:disable-next-line: forin
      for (controlName in this.myMarkupForm.controls) {
        this.myMarkupForm.controls[controlName].markAsDirty();
        this.myMarkupForm.controls[controlName].updateValueAndValidity();
      }
      this.submittedMarkup = true;
      return false;
    }
    if (this.myjobRateCardForm.value.minPayRate > this.myjobRateCardForm.value.maxPayRate) {
      this.notificationService.error(this.translator.instant('min.pay.rate.cannot.be.greater.than.max.pay.rate'), '');
    }
    else {

    }
    const createJobRateCard = new CreateJobRateCardDTO();
    // const jobRateCardConfiguration = new JobRateCardConfigurationDTO();
    const jobRateCard = new JobRateCardDTO();

    const temp = this.myjobRateCardForm.get('jobRateCardList').value;

    const tempList = [];
    temp.forEach(element => {
      if (element.minPayRate > 0 && element.maxPayRate > 0) {
        let jobRateCardConfiguration = new JobRateCardConfigurationDTO(element.jobTitle, element.experience, element.minPayRate,
          element.maxPayRate, element.minBillRate, element.maxBillRate, element.minProfit, element.maxProfit, element.profitMargin);
        // jobRateCardConfiguration.experience = element.experience;
        // jobRateCardConfiguration.minPayRate = element.minPayRate;
        // jobRateCardConfiguration.maxPayRate = element.maxPayRate;
        // jobRateCardConfiguration.minBillRate = element.minBillRate;
        // jobRateCardConfiguration.maxBillRate = element.maxBillRate;
        // jobRateCardConfiguration.minProfit = element.minProfit;
        // jobRateCardConfiguration.maxProfit = element.maxProfit;
        // jobRateCardConfiguration.profitMargin = element.profitMargin;
        tempList.push(jobRateCardConfiguration);

      }
    });
    if (tempList.length > 0) {
      createJobRateCard.jobRateCardConfiguration = tempList;
      jobRateCard.state = this.myClientAndStateForm.value.state;
      jobRateCard.client = this.myClientAndStateForm.value.client;
      jobRateCard.isEnable = true;
      if (this.myMarkupForm.value.markup === true) {
        jobRateCard.markUpType = 'PERCENTAGE';
        jobRateCard.amount = this.myMarkupForm.value.percentage;
      } else {
        jobRateCard.markUpType = 'AMOUNT';
        jobRateCard.amount = this.myMarkupForm.value.amount;
      }
      createJobRateCard.jobRateCard = jobRateCard;
      if (this.localStorageService.getItem('manageEditJobrateCardData')) {
        createJobRateCard.isAllowToCreate = false;
      }
      else {
        createJobRateCard.isAllowToCreate = true;
      }

      this.jobRateCardService.generateJobRateCard(createJobRateCard).subscribe(data => {

        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success(this.translator.instant('job.rate.card.created.successfully'), '');
          this.router.navigate(['/admin/job-ratecard']);
        }
      });
    }
    else {
      this.notificationService.error(this.translator.instant('Please enter atleast one minPay Rate'), '');
    }
  }
  getFullName(data: User) {
    // 
    return data.firstName + ' ' + data.lastName;
  }
}
