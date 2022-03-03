import { isNgTemplate } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { SortableColumn } from 'primeng/table';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { concatMap, groupBy, toArray, map } from 'rxjs/operators';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { LineItemService } from 'src/app/service/client-services/post-project/line-item.service';
import { MilestoneService } from 'src/app/service/client-services/post-project/milestone.service';
import { PostProjectService } from 'src/app/service/client-services/post-project/post-project.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { JobsiteDetail } from '../../../Vos/jobsitemodel';
import { PaymentMileStone } from '../../../Vos/paymentMilestoneModel';

@Component({
  selector: 'app-add-milestone',
  templateUrl: './add-milestone.component.html',
  styleUrls: ['./add-milestone.component.css']
})
export class AddMilestoneComponent implements OnInit {

  paymentMileStoneForm: FormGroup;
  loggedInUserId: string;
  lineItemDialog = false;
  submitted = false;
  sourceProducts: any[];
  targetProducts: any[];
  selectedJobsite: JobsiteDetail;
  subscription: Subscription;
  currentRowIndex: number;
  remainingLineItem: any[] = [];
  savedLineItem = false;
  constTarget: any[] = [];

  loading = false;
  offset: Number = 0;
  totalRecords: Number = 0;
  data: PaymentMileStone[] = [];
  datatableParam: DataTableParam;
  filterMap = new Map();
  sortField;
  queryParam;
  sortOrder;
  size;
  globalFilter;
  lineItemToView: any = null;
  isAssigned = false;
  isOpenLineItemViewDialog = false;
  milestone: PaymentMileStone[];
  copyMilestone = false;
  copyMilestoneDetails;

  constructor(private _formBuilder: FormBuilder,
    private _localStorageService: LocalStorageService,
    private postProjectService: PostProjectService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private milestoneService: MilestoneService,
    private lineItemService: LineItemService,
    private confirmDialogService: ConfirmDialogueService,
    private projectJobSelectionService: ProjectJobSelectionService) {

  }

  ngOnInit(): void {
    this.loggedInUserId = this._localStorageService.getLoginUserId();
    this.subscription = this.projectJobSelectionService.selectedJobsiteOfDropdown.subscribe(
      data => {
        let jobsite = this._localStorageService.getItem('selectedJobsiteOfDropdown');
        if (jobsite) {
          if (jobsite.id !== 'jid') {
            this.selectedJobsite = jobsite;
            if (this._localStorageService.getItem('unselectedLineItem')) {
              this._localStorageService.setItem('unselectedLineItem', []);
            }
            this.getUnassignedLineItem(this.selectedJobsite.id);
            for (let i = 0; i < 5; i++) {
              if (this._localStorageService.getItem('Data' + i)) {
                this._localStorageService.removeItem('Data' + i);
              }
            }
            this.initializePaymentMileStone();
            this.setFilter();
          }
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    console.log('in milestone destroy');

    if ((!this._localStorageService.getItem('milestoneScreen')) &&
      (!this._localStorageService.getItem('addJobsiteScreen')) &&
      (!this._localStorageService.getItem('addLineItemScreen')) &&
      (this._localStorageService.getItem('jobsiteScreen'))) {
      this.projectJobSelectionService.addJobsiteSubject.next(null);
    }


    this._localStorageService.removeItem('unselectedLineItem');
    for (let i = 0; i < 5; i++) {
      if (this._localStorageService.getItem('Data' + i)) {
        this._localStorageService.removeItem('Data' + i);
      }
    }

    this._localStorageService.removeItem('milestoneScreen');

    if (this._localStorageService.getItem('hasCopiedMilestone')) {
      this._localStorageService.removeItem('hasCopiedMilestone');
    }

    if (this._localStorageService.getItem('copiedMilestone')) {
      this._localStorageService.removeItem('copiedMilestone');
    }
  }

  getUnassignedLineItem(id) {
    this.lineItemService.getUnassignedLineItem(id).subscribe(
      data => {
        this._localStorageService.setItem('unselectedLineItem', data.data);
        console.log(data.data);
      }
    );
  }

  initializePaymentMileStone() {
    let paymentMileStoneList = new FormArray([]);

    paymentMileStoneList.push(this._formBuilder.group({
      'id': [],
      'createdBy': this.loggedInUserId,
      'updatedBy': this.loggedInUserId,
      'percentage': ['', [Validators.min(0.01), Validators.max(100), Validators.required]],
      'name': ['', [Validators.maxLength(50), Validators.required]],
      'jobsite': this.selectedJobsite,
      'lineItem': [[], Validators.required],
      'hasAdvancePayment': false
    }));

    this.paymentMileStoneForm = this._formBuilder.group({
      paymentMileStoneList: paymentMileStoneList
    });
    this._localStorageService.setItem('Data0',
      (<FormArray>this.paymentMileStoneForm.get('paymentMileStoneList')).controls[0].get('lineItem').value);
  }

  addRow() {
    const lengthOfArray = (<FormArray>this.paymentMileStoneForm.get('paymentMileStoneList')).length;
    if (lengthOfArray < 5) {
      (<FormArray>this.paymentMileStoneForm.get('paymentMileStoneList')).push(this._formBuilder.group({
        'id': [],
        'createdBy': this.loggedInUserId,
        'updatedBy': this.loggedInUserId,
        'percentage': ['', [Validators.min(0.01), Validators.max(100), Validators.required]],
        'name': ['', [Validators.maxLength(50), Validators.required]],
        'jobsite': this.selectedJobsite,
        'lineItem': [[], Validators.required],
        'hasAdvancePayment': false
      }));
      this._localStorageService.setItem('Data' + lengthOfArray,
        (<FormArray>this.paymentMileStoneForm.get('paymentMileStoneList')).controls[lengthOfArray].get('lineItem').value);
    }
  }

  get tableRowArray(): FormArray {
    return this.paymentMileStoneForm.get('paymentMileStoneList') as FormArray;
  }

  deleteRow(rowIndex: number): void {
    console.log(this.remainingLineItem);
    let source = this._localStorageService.getItem('Data' + rowIndex);
    source.forEach(element => {
      if (!this.remainingLineItem.some((item) => item.id === element.id)) {
        this.remainingLineItem.push(element);
      }
    });
    this._localStorageService.setItem('unselectedLineItem', this.remainingLineItem);
    for (let i = rowIndex; i < (<FormArray>this.paymentMileStoneForm.get('paymentMileStoneList')).length - 1; i++) {
      let data = this._localStorageService.getItem('Data' + (rowIndex + 1));
      this._localStorageService.
        setItem('Data' + rowIndex, data);
    }
    this._localStorageService
      .removeItem('Data' + ((<FormArray>this.paymentMileStoneForm.get('paymentMileStoneList')).length - 1));
    this.tableRowArray.removeAt(rowIndex);

    const lengthOfArray = (<FormArray>this.paymentMileStoneForm.get('paymentMileStoneList')).length;
    if (lengthOfArray === 0) {
      this.initializePaymentMileStone();
    }

  }

  openLineItemDialog(rowIndex): void {
    this.currentRowIndex = rowIndex;
    this.remainingLineItem = this._localStorageService.getItem('unselectedLineItem');
    this.sourceProducts = this._localStorageService.getItem('unselectedLineItem');
    let rowData = this._localStorageService.getItem('Data' + this.currentRowIndex);
    if (rowData) {
      this.targetProducts = rowData;
    }
    else {
      this.targetProducts = [];
    }
    this.lineItemDialog = true;
  }

  onSaveLineItem() {
    this.savedLineItem = true;
    this.lineItemDialog = false;
  }

  onCloseDialogEvent(event) {
    if (this.savedLineItem) {
      let row = (<FormArray>this.paymentMileStoneForm.get('paymentMileStoneList')).controls[this.currentRowIndex].get('lineItem');
      row.patchValue(this.targetProducts);
      this._localStorageService.setItem('unselectedLineItem', this.sourceProducts);
      this._localStorageService.setItem('Data' + this.currentRowIndex, this.targetProducts);
      this.savedLineItem = false;
    }
    else {
      this._localStorageService.setItem('unselectedLineItem', this.remainingLineItem);
    }
  }

  hideLineItemDialog(): void {
    this.lineItemDialog = false;
  }

  onSubmitMilestone(): boolean {
    this.submitted = true;
    if (!this.paymentMileStoneForm.valid) {
      CustomValidator.markFormGroupTouched(this.paymentMileStoneForm);
      this.submitted = false;
      this.checkLineItemAssignedOrNot();
      return false;
    }
    else {
      console.log(this.paymentMileStoneForm.value.paymentMileStoneList);
      let count = 0;
      let errorCount = 0;
      let percentage: number = 0.00;
      this.paymentMileStoneForm.value.paymentMileStoneList.forEach(milestone => {
        percentage = (+percentage.toFixed(2)) + (+parseFloat(milestone.percentage).toFixed(2));
        if (!milestone.name.trim()) {
          errorCount = errorCount + 1;
          return false;
        }
      });
      if (errorCount > 0) {
        this.notificationService.error('Payment Milestone Name cannot be empty', '');
        return false;
      }
      if (this.checkMilestoneName(this.paymentMileStoneForm.value.paymentMileStoneList)) {
        if ((+percentage.toFixed(2)) === 100.00) {
          this.paymentMileStoneForm.value.paymentMileStoneList.forEach((milestone) => {
            milestone.lineItem.forEach(element => {
              element.jobsite = this.selectedJobsite;
            });
            if (milestone.id === null) {
              console.log(milestone);
              if (milestone.jobsite.project) {
                milestone.jobsite.project.attachment = [];
              }
              this.milestoneService.addNewMilestone(milestone, '')
                .subscribe(
                  data => {
                    if (data.statusCode === '200' && data.message === 'OK') {
                      this.submitted = false;
                      count++;
                      if (this.paymentMileStoneForm.value.paymentMileStoneList.length === count) {
                        this.notificationService.success(this.translator.instant('milestone.saved'), '');
                      }
                    }
                    else if (data.message === 'Project bidding has already started cannot update further') {
                      // this.notificationService.error(data.message, '');
                      errorCount++;
                    } else {
                      this.notificationService.error(data.message, '');
                    }
                  },
                  error => {
                    if (error.status === '400' && error.name.length > 0) {
                      this.notificationService.error(error.name, '');
                    } else {
                      this.notificationService.error(this.translator.instant('common.error'), '');
                    }
                  });
            }
            else {
              console.log(milestone);
              if (milestone.jobsite.project) {
                milestone.jobsite.project.attachment = [];
              }
              this.milestoneService.updateMilestone(milestone, '').subscribe(
                data => {
                  if (data.statusCode === '200' && data.message === 'OK') {
                    this.submitted = false;
                    count++;
                    if (this.paymentMileStoneForm.value.paymentMileStoneList.length === count) {
                      this.notificationService.success(this.translator.instant('milestone.saved'), '');
                    }
                  }
                  else if (data.message === 'Project bidding has already started cannot update further') {
                    // this.notificationService.error(data.message, '');
                    errorCount++;
                    if (this.paymentMileStoneForm.value.paymentMileStoneList.length === errorCount) {
                      this.notificationService.error('Project bidding has already started cannot update further', '');
                    }
                  } else {
                    this.notificationService.error(data.message, '');
                  }
                },
                error => {
                  this.notificationService.error(this.translator.instant('common.error'), '');
                });
            }
          });

          setTimeout(() => {
            this.setFilter();
          }, 1000);
        }
        else {
          this.notificationService.error(this.translator.instant('percentage.error'), '');
        }
      }
      else {
        this.notificationService.error('Milestone name can not be same', '');
      }
    }
  }

  setFilter() {
    this.filterMap.clear();
    this.filterMap.set('JOBSITE_ID', this.selectedJobsite.id);
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParam = {
      offset: 0,
      size: 10,
      sortField: 'CREATED_DATE',
      sortOrder: 0,
      searchText: this.globalFilter
    };
    this.getMilestoneList();
  }

  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  getMilestoneList() {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    console.log(this.datatableParam);
    this.milestoneService.getAllMilestone(this.queryParam).subscribe(
      data => {
        this.initializePaymentMileStone();
        if (data.data.totalRecords === 0) {
          this.initializePaymentMileStone();
          this.setCopiedMilestone();
        }
        else {
          if (data.data.result) {
            data.data.result.forEach((milestone, index) => {
              (<FormArray>this.paymentMileStoneForm.get('paymentMileStoneList')).push(this._formBuilder.group({
                'id': milestone.id,
                'createdBy': milestone.createdBy,
                'updatedBy': this.loggedInUserId,
                'percentage': [milestone.percentage, [Validators.min(0.01), Validators.max(100), Validators.required]],
                'name': [milestone.name, [Validators.maxLength(50), Validators.required]],
                'jobsite': this.selectedJobsite,
                'lineItem': [milestone.lineItem, Validators.required],
                'hasAdvancePayment': milestone.hasAdvancePayment
              }));
              this._localStorageService.setItem('Data' + index, milestone.lineItem);
            });
            (<FormArray>this.paymentMileStoneForm.get('paymentMileStoneList')).removeAt(0);

            if (this._localStorageService.getItem('hasCopiedMilestone')) {
              if (this._localStorageService.getItem('copiedMilestone')) {
                let copiedMilestone1 = this._localStorageService.getItem('copiedMilestone');
                let jobsite = this._localStorageService.getItem('selectedJobsiteOfDropdown');
                if (copiedMilestone1[0].jobsite.id === jobsite.id) {
                  this.copyMilestone = this._localStorageService.getItem('hasCopiedMilestone');
                  this._localStorageService.setItem('copiedMilestone', data.data.result);
                }
                else {
                  this.copyMilestone = false;
                }
              }
              else {
                this.copyMilestone = this._localStorageService.getItem('hasCopiedMilestone');
                this._localStorageService.setItem('copiedMilestone', data.data.result);
              }
            }
          }
        }
      }
    );
  }


  onCancel() {
    this._localStorageService.removeItem('milestoneScreen');
    this._localStorageService.setItem('jobsiteScreen', 'jobsiteListing', false);
    this.postProjectService.jobsiteScreenChange.next('jobsiteListing');
  }

  onSubmitMilestoneAndNext() {
    this.submitted = true;
    if (!this.paymentMileStoneForm.valid) {
      CustomValidator.markFormGroupTouched(this.paymentMileStoneForm);
      this.submitted = false;
      this.checkLineItemAssignedOrNot();
      return false;
    }
    else {
      let percentage: number = 0.00;
      let errorCount = 0;
      let count = 0;
      this.paymentMileStoneForm.value.paymentMileStoneList.forEach(milestone => {
        percentage = (+percentage.toFixed(2)) + (+parseFloat(milestone.percentage).toFixed(2));
        if (!milestone.name.trim()) {
          errorCount = errorCount + 1;
          return false;
        }

      });
      if (errorCount > 0) {
        this.notificationService.error('Payment Milestone Name cannot be empty', '');
        return false;
      }

      if (this.checkMilestoneName(this.paymentMileStoneForm.value.paymentMileStoneList)) {
        if ((+percentage.toFixed(2)) === 100.00) {
          this.paymentMileStoneForm.value.paymentMileStoneList.forEach((milestone) => {
            milestone.lineItem.forEach(element => {
              element.jobsite = this.selectedJobsite;
            });
            if (milestone.id === null) {
              if (milestone.jobsite.project) {
                milestone.jobsite.project.attachment = [];
              }
              this.milestoneService.addNewMilestone(milestone, '')
                .subscribe(
                  data => {
                    if (data.statusCode === '200' && data.message === 'OK') {
                      this.submitted = false;
                      count++;
                      if (this.paymentMileStoneForm.value.paymentMileStoneList.length === count) {
                        this.notificationService.success(this.translator.instant('milestone.saved'), '');
                      }
                    } else if (data.message === 'Project bidding has already started cannot update further') {
                      // this.notificationService.error(data.message, '');
                      errorCount++;
                      if (this.paymentMileStoneForm.value.paymentMileStoneList.length === errorCount) {
                        this.notificationService.error('Project bidding has already started cannot update further', '');
                      }
                    } else {
                      this.notificationService.error(data.message, '');
                    }
                  },
                  error => {
                    this.notificationService.error(this.translator.instant('common.error'), '');
                  });
            }
            else {
              if (milestone.jobsite.project) {
                milestone.jobsite.project.attachment = [];
              }
              this.milestoneService.updateMilestone(milestone, '').subscribe(
                data => {
                  if (data.statusCode === '200' && data.message === 'OK') {
                    this.submitted = false;
                    count++;
                    if (this.paymentMileStoneForm.value.paymentMileStoneList.length === count) {
                      this.notificationService.success(this.translator.instant('milestone.saved'), '');
                    }
                  }
                  else if (data.message === 'Project bidding has already started cannot update further') {
                    // this.notificationService.error(data.message, '');
                    errorCount++;
                    if (this.paymentMileStoneForm.value.paymentMileStoneList.length === errorCount) {
                      this.notificationService.error('Project bidding has already started cannot update further', '');
                    }
                  } else {
                    this.notificationService.error(data.message, '');
                  }
                },
                error => {
                  this.notificationService.error(this.translator.instant('common.error'), '');
                });
            }
          });

          setTimeout(() => {
            this.setFilter();
          }, 1000);
          this._localStorageService.removeItem('milestoneScreen');
          this._localStorageService.setItem('jobsiteScreen', 'jobsiteListing', false);
          this.postProjectService.jobsiteScreenChange.next('jobsiteListing');
        }
        else {
          this.notificationService.error(this.translator.instant('percentage.error'), '');
        }
      }
      else {
        this.notificationService.error('Milestone name can not be same', '');
      }
    }
  }

  checkMilestoneName(data) {
    let groupByMilestoneName = [];
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
      groupByMilestoneName.push(x);
    });

    records.forEach(x => pipedRecords.next(x));
    pipedRecords.complete();

    groupByMilestoneName.forEach(element => {
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


  openDialog(id, title, index) {
    let options = null;
    options = {
      title: "Warning",
      message: "Are you sure you want to delete?",
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    }
    // const lengthOfArray = (<FormArray>this.paymentMileStoneForm.get('paymentMileStoneList')).length;
    // if(lengthOfArray !== 1){
    //   this.confirmDialogService.open(options);
    // }
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        if (id === null) {
          this.deleteRow(index);
        }
        else {
          this.onDeleteMilestone(id, index);
        }
      }
    });
  }


  onDeleteMilestone(id, index) {
    this.milestoneService.deleteMilestoneById(id,
      this.translator.instant('milestone.deleted')).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.notificationService.success(this.translator.instant('milestone.deleted'), '');
            this._localStorageService.removeItem('Data' + index);
            this.getUnassignedLineItem(this.selectedJobsite.id);
          } else {
            this.notificationService.error(data.message, '');
          }
        }
      );
    setTimeout(() => {
      this.setFilter();
    }, 1000);
  }

  checkLineItemAssignedOrNot() {
    this.paymentMileStoneForm.value.paymentMileStoneList.forEach((milestone, index) => {
      if (milestone.lineItem.length === 0) {
        let row = index + 1;
        this.notificationService.error(this.translator.instant('milestone.error') + row + ' row', '');
      }
    });
  }

  openViewDialog(index) {
    if (this._localStorageService.getItem('Data' + index)) {
      if (this._localStorageService.getItem('Data' + index).length === 0) {
        this.isAssigned = false;
      }
      else {
        this.isAssigned = true;
      }
      this.lineItemToView = this._localStorageService.getItem('Data' + index);
    }
    this.isOpenLineItemViewDialog = true;
  }
  onHide(event) {
    this.isAssigned = false;
    this.isOpenLineItemViewDialog = false;
  }

  onCopyMilestoneChange(event) {
    this._localStorageService.setItem('hasCopiedMilestone', event.checked);
    if (!event.checked) {
      this._localStorageService.removeItem('copiedMilestone');
    }
    if (event.checked) {
      if (this._localStorageService.getItem('copiedMilestone')) {
        this._localStorageService.removeItem('copiedMilestone');
      }
    }
  }

  setCopiedMilestone() {
    if (this._localStorageService.getItem('hasCopiedMilestone')) {
      if (this._localStorageService.getItem('copiedMilestone')) {
        let copiedMilestone1 = this._localStorageService.getItem('copiedMilestone');
        let jobsite = this._localStorageService.getItem('selectedJobsiteOfDropdown');
        if (copiedMilestone1[0].jobsite.id === jobsite.id) {
          this.copyMilestone = this._localStorageService.getItem('hasCopiedMilestone');
        }
        else {
          this.copyMilestone = false;
        }
        this.copyMilestoneDetails = copiedMilestone1;
        this.setCopiedValue();
        (<FormArray>this.paymentMileStoneForm.get('paymentMileStoneList')).removeAt(0);
      }
    }
    else {
      this.copyMilestone = false;
    }
  }

  setCopiedValue() {
    this.copyMilestoneDetails.forEach((milestone, index) => {
      (<FormArray>this.paymentMileStoneForm.get('paymentMileStoneList')).push(this._formBuilder.group({
        'id': [],
        'createdBy': this.loggedInUserId,
        'updatedBy': this.loggedInUserId,
        'percentage': [milestone.percentage, [Validators.min(0.01), Validators.max(100), Validators.required]],
        'name': [milestone.name, [Validators.maxLength(50), Validators.required]],
        'jobsite': this.selectedJobsite,
        'lineItem': [[], Validators.required],
        'hasAdvancePayment': milestone.hasAdvancePayment
      }));
      this._localStorageService.setItem('Data' + index, []);
    });
  }

}
