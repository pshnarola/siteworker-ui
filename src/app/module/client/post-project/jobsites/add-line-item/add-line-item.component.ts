import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { UomService } from 'src/app/service/admin-services/uom/uom.service';
import { JobsiteDetailService } from 'src/app/service/client-services/jobsite-details/jobsite-detail.service';
import { LineItemTemplateService } from 'src/app/service/client-services/line-item-template/line-item-template.service';
import { JobsiteService } from 'src/app/service/client-services/post-project/jobsite.service';
import { LineItemService } from 'src/app/service/client-services/post-project/line-item.service';
import { PostProjectService } from 'src/app/service/client-services/post-project/post-project.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { Uom } from 'src/app/shared/vo/uom/uom';
import { LineItemTemplateComponent } from '../../../line-item-template/line-item-template.component';
import { JobsiteDetail } from '../../../Vos/jobsitemodel';
import { LineItem } from '../../../Vos/lineItemModel';

@Component({
  selector: 'app-add-line-item',
  templateUrl: './add-line-item.component.html',
  styleUrls: ['./add-line-item.component.css']
})
export class AddLineItemComponent implements OnInit {

  products = []; 
  defaultLineItem = { 
    'id': 'bankId',
    'lineItemName' : 'Blank Template',
    'description': 'Define your own template'
  };
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  responsiveOptions;
  lineItemForm: FormGroup;
  loggedInUserId: string;
  submitted = false;
  submittedSingleWorkType= false;
  uom: Uom[];
  filteredUom: any[];
  editableLineItem: any = null;
  queryParam;
  datatableParam: DataTableParam = null;
  dataTableParamForTemplate: DataTableParam;
  queryParamTemplate;
  offset: Number = 0;
  totalRecords: Number = 0;
  filterMap = new Map();
  sortField = 'ITEM_NAME';
  sortOrder;
  selectedTemplate;
  selectedFormIndex = 0;
  selectedJobsite: JobsiteDetail;
  isEditWorkType: { edit: boolean}[] = [{'edit' : false}];
  @Output()
  screenChange1 = new EventEmitter<string>();
  isCancel = false;

  subscription: Subscription;
  subscription1: Subscription;


  constructor(private _formBuilder: FormBuilder,
          private localStorageService: LocalStorageService,
          private _uomService: UomService,
          private postProjectService: PostProjectService,
          private projectJobSelectionService: ProjectJobSelectionService,
          private lineItemService: LineItemService,
          private translator: TranslateService,
          private jobsiteService: JobsiteService,
          private notificationService: UINotificationService,
          private lineItemTemplateService: LineItemTemplateService) { 
    this.responsiveOptions = [
      {
          breakpoint: '1024px',
          numVisible: 3,
          numScroll: 3
      },
      {
          breakpoint: '768px',
          numVisible: 2,
          numScroll: 2
      },
      {
          breakpoint: '560px',
          numVisible: 1,
          numScroll: 1
      }
  ];
  }

  ngOnInit(): void {
    this.isCancel = false;
    this.submitted= false;
    this.loggedInUserId = this.localStorageService.getLoginUserId();
    this.loadUomList();
    this.loadLineItemList();
    this.subscription = this.projectJobSelectionService.selectedJobsiteOfDropdown.subscribe(
      data => {
        let jobsite = this.localStorageService.getItem('selectedJobsiteOfDropdown');
        if(jobsite){
          if(jobsite.id !== 'jid'){
            this.selectedJobsite = jobsite;
          }
        }
        this.selectedTemplate = this.defaultLineItem;
        this.initializeLineItemform();
      }
    );
    console.log(this.loggedInUserId);

    this.subscription1 = this.lineItemService.lineItemIdTransfer.subscribe(data => {
      if(this.localStorageService.getItem('lineItem')){
          this.editableLineItem = this.localStorageService.getItem('lineItem');
      }
      else{
        this.editableLineItem = null;
      }
    });

    if(this.editableLineItem !== null){
      this.setFormValue(this.editableLineItem)
    }
  }

  ngOnDestroy(): void{
    this.subscription.unsubscribe();
    this.subscription1.unsubscribe();
    console.log('in line item destroy');
    if((!this.localStorageService.getItem('milestoneScreen')) && 
        (!this.localStorageService.getItem('addJobsiteScreen')) &&
        (!this.localStorageService.getItem('addLineItemScreen')) &&
        (this.localStorageService.getItem('jobsiteScreen'))){
            this.projectJobSelectionService.addJobsiteSubject.next(null);
    }
  }

  onSelectTemplate(item){
    this.selectedTemplate = item;
    this.setTemplateValue();
  }

  onSelectForm(index){
    this.selectedFormIndex = index;
  }

  setTemplateValue(){
    if(this.selectedTemplate.id !== 'bankId'){
    (<FormArray>this.lineItemForm.get('lineItem')).controls[this.selectedFormIndex].get('lineItemId').patchValue(this.selectedTemplate.lineItemId);
    (<FormArray>this.lineItemForm.get('lineItem')).controls[this.selectedFormIndex].get('lineItemName').patchValue(this.selectedTemplate.lineItemName);
    (<FormArray>this.lineItemForm.get('lineItem')).controls[this.selectedFormIndex].get('description').patchValue(this.selectedTemplate.description);
    (<FormArray>this.lineItemForm.get('lineItem')).controls[this.selectedFormIndex].get('quantity').patchValue(this.selectedTemplate.quantity);
    (<FormArray>this.lineItemForm.get('lineItem')).controls[this.selectedFormIndex].get('unit').patchValue(this.selectedTemplate.unit);
    (<FormArray>this.lineItemForm.get('lineItem')).controls[this.selectedFormIndex].get('cost').patchValue(this.selectedTemplate.cost);
    (<FormArray>this.lineItemForm.get('lineItem')).controls[this.selectedFormIndex].get('inclusions').patchValue(this.selectedTemplate.inclusions);
    (<FormArray>this.lineItemForm.get('lineItem')).controls[this.selectedFormIndex].get('exclusions').patchValue(this.selectedTemplate.exclusions);
    (<FormArray>this.lineItemForm.get('lineItem')).controls[this.selectedFormIndex].get('dynamicLabel1').patchValue(this.selectedTemplate.dynamicLabel1);
    (<FormArray>this.lineItemForm.get('lineItem')).controls[this.selectedFormIndex].get('dynamicLabel2').patchValue(this.selectedTemplate.dynamicLabel2);
    (<FormArray>this.lineItemForm.get('lineItem')).controls[this.selectedFormIndex].get('dynamicLabel3').patchValue(this.selectedTemplate.dynamicLabel3);
    }
    else{
      this.resetSingleWorkType(this.selectedFormIndex);
    }
  }

  private setFormValue(lineitem){
    let lineItemList = new FormArray([]);
    lineItemList.push(this._formBuilder.group({
      'id': lineitem.id,
      'createdBy':lineitem.createdBy,
      'updatedBy':lineitem.updatedBy,
      'description': [lineitem.description,[Validators.required]],
      'dynamicLabel1': [lineitem.dynamicLabel1,Validators.maxLength(200)],
      'dynamicLabel2': [lineitem.dynamicLabel2,Validators.maxLength(200)],
      'dynamicLabel3': [lineitem.dynamicLabel3,Validators.maxLength(200)],
      'exclusions': [lineitem.exclusions],
      'inclusions': [lineitem.inclusions],
      'lineItemId': [lineitem.lineItemId,[Validators.required,Validators.maxLength(20)]],
      'lineItemName': [lineitem.lineItemName,[Validators.required,Validators.maxLength(100)]],
      'cost': [lineitem.cost, [Validators.required,Validators.min(0.01)]],
      'quantity': [lineitem.quantity,[Validators.required,Validators.min(1)]],
      'unit': [lineitem.unit,[Validators.required,Validators.maxLength(10)]],
      'jobsite': lineitem.jobsite,
      'workType': lineitem.workType
    }));

    this.lineItemForm = this._formBuilder.group({
      lineItem: lineItemList
    });

    (<FormArray>this.lineItemForm.get('lineItemList')).removeAt(0);
  }


  private initializeLineItemform(){
    let lineItemList = new FormArray([]);
    lineItemList.push(this._formBuilder.group({
      'id': [],
      'createdBy':this.loggedInUserId,
      'updatedBy':this.loggedInUserId,
      'description': ['',[Validators.required]],
      'dynamicLabel1': ['',Validators.maxLength(200)],
      'dynamicLabel2': ['',Validators.maxLength(200)],
      'dynamicLabel3': ['',Validators.maxLength(200)],
      'exclusions': [''],
      'inclusions': [''],
      'lineItemId': ['',[Validators.required,Validators.maxLength(20)]],
      'lineItemName': ['',[Validators.required,Validators.maxLength(100)]],
      'cost': [null, [Validators.required,Validators.min(0.01)]],
      'quantity': [null,[Validators.required,Validators.min(1)]],
      'unit': ['',[Validators.required,Validators.maxLength(10)]],
      'jobsite': this.selectedJobsite,
      'workType': 'Work Type 1'
    }));

    this.lineItemForm = this._formBuilder.group({
      lineItem: lineItemList
    });
  }

  addWorkType(){
    this.isEditWorkType.push({'edit': false});
    const lengthOfArray = (<FormArray>this.lineItemForm.get('lineItem')).length;
    let workTypeIndex = lengthOfArray+1;
    if(lengthOfArray < 20){
      (<FormArray>this.lineItemForm.get('lineItem')).push(this._formBuilder.group({
      'id': [],
      'createdBy':this.loggedInUserId,
      'updatedBy':this.loggedInUserId,
      'description': ['',[Validators.required]],
      'dynamicLabel1': ['',Validators.maxLength(200)],
      'dynamicLabel2': ['',Validators.maxLength(200)],
      'dynamicLabel3': ['',Validators.maxLength(200)],
      'exclusions': [''],
      'inclusions': [''],
      'lineItemId': ['',[Validators.required,Validators.maxLength(20)]],
      'lineItemName': ['',[Validators.required,Validators.maxLength(100)]],
      'cost': [null, [Validators.required,Validators.min(0.01)]],
      'quantity': [null,[Validators.required,Validators.min(1)]],
      'unit': ['',[Validators.required,Validators.maxLength(10)]],
      'jobsite': this.selectedJobsite,
      'workType': 'Work Type '+workTypeIndex
      }));
    }  
    this.selectedTemplate = this.defaultLineItem;
  }

  removeWorkType(index:number){
    const lengthOfArray = (<FormArray>this.lineItemForm.get('lineItem')).length;
    if(lengthOfArray > 1){
      this.isEditWorkType.splice(index,1);
      (<FormArray>this.lineItemForm.get('lineItem')).removeAt(index);
    }
  }

  onWorkTypeChange(value,index){
    (<FormArray>this.lineItemForm.get('lineItem')).controls[index].get('workType').patchValue(value);
    this.isEditWorkType[index].edit = !this.isEditWorkType[index].edit;
  }

  onEditWorkType(index){
    this.isEditWorkType[index].edit = !this.isEditWorkType[index].edit;
  }


  onSubmitSingleWorkType(lineItem:FormGroup,index){
    let form = <FormGroup>(<FormArray>this.lineItemForm.get('lineItem')).controls[index];
    if(!(<FormArray>this.lineItemForm.get('lineItem')).controls[index].valid){
      CustomValidator.markFormGroupTouched(form);
      return false;
    }
    else{
      console.log(lineItem.value);
      if(this.validateLengthForSingleWorkType(lineItem.value.description,lineItem.value.inclusions,lineItem.value.exclusions)){
      if(lineItem.value.jobsite.project){
        lineItem.value.jobsite.project.attachment = [];
      }
      this.lineItemService.addNewLineItem(lineItem.value,
        this.translator.instant('lineItem.added.successfully')).subscribe(
          data => {
            if (data.statusCode === '200' && data.message === 'OK') {
              this.notificationService.success(this.translator.instant('lineItem.added.successfully'), '');
              this.resetSingleWorkType(index);
              this.selectedTemplate = this.defaultLineItem;
              this.localStorageService.setItem('addLineItemScreen','addLineItem',false);
              this.postProjectService.jobsiteScreenChange.next('addLineItem');
              this.jobsiteService.updateCostOfJobsite(lineItem.value.jobsite.id).subscribe(
              data => {
                if(!this.isCancel){
                  this.localStorageService.setItem('addLineItemScreen','addLineItem',false);
                  this.postProjectService.jobsiteScreenChange.next('addLineItem');
                }
              }
              );
            this.localStorageService.setItem('addLineItemScreen','addLineItem',false);
            this.postProjectService.jobsiteScreenChange.next('addLineItem');
            this.projectJobSelectionService.addJobsiteSubject.next(data);
            }
            else{
              this.notificationService.error(data.message, '');
            }
          },
          error => {
            this.notificationService.error(this.translator.instant('common.error'), '');
          }
        );
      }
    }
  }

  onSubmitAllWorkType(){
    console.log(this.lineItemForm.value);
    this.submitted = true;
    if(!this.lineItemForm.valid){
      CustomValidator.markFormGroupTouched(this.lineItemForm);
      this.submitted = false;
      return false;
    }
    else{
      if(this.validateLengthForAllWorkType()){
      if(this.editableLineItem === null){
        this.lineItemForm.value.lineItem.forEach(lineItem => {
          if(lineItem.jobsite.project){
            lineItem.jobsite.project.attachment = [];
          }
          this.lineItemService.addNewLineItem(lineItem,
            this.translator.instant('lineItem.added.successfully')).subscribe(
              data => {
                if (data.statusCode === '200' && data.message === 'OK') {
                  this.notificationService.success(this.translator.instant('lineItem.added.successfully'), '');
                  this.submitted =false;
                  this.jobsiteService.updateCostOfJobsite(lineItem.jobsite.id).subscribe(
                  data => {
                  });
                  setTimeout(()=>{
                    this.localStorageService.removeItem('addLineItemScreen');
                      this.localStorageService.setItem('jobsiteScreen','jobsiteListing',false);
                      this.postProjectService.jobsiteScreenChange.next('jobsiteListing');
                  },1000);
                }
                else{
                  this.notificationService.error(data.message, '');
                }
              },
              error => {
                this.notificationService.error(this.translator.instant('common.error'), '');
              }
            );
        });
      }
      else{
        this.lineItemForm.value.lineItem.forEach(lineItem => {
          if(lineItem.jobsite.project){
            lineItem.jobsite.project.attachment = [];
          }
          this.lineItemService.updateItem(lineItem,
            this.translator.instant('lineItem.updated.successfully')).subscribe(
              data => {
                if (data.statusCode === '200' && data.message === 'OK') {
                  this.notificationService.success(this.translator.instant('lineItem.updated.successfully'), '');
                  this.submitted =false;
                  setTimeout(()=>{
                  this.localStorageService.removeItem('addLineItemScreen');
                  this.localStorageService.setItem('jobsiteScreen','jobsiteListing',false);
                  this.postProjectService.jobsiteScreenChange.next('jobsiteListing');
                  this.localStorageService.removeItem('lineItem');
                  this.lineItemService.lineItemIdTransfer.next(null);
                },1000);
                }
                else{
                  this.notificationService.error(data.message, '');
                }
              },
              error => {
                this.notificationService.error(this.translator.instant('common.error'), '');
              }
            );
        });
      }
    }
    }
  }


  private resetSingleWorkType(index:number){
    (<FormArray>this.lineItemForm.get('lineItem')).controls[index].get('lineItemId').markAsUntouched();
   (<FormArray>this.lineItemForm.get('lineItem')).controls[index].get('lineItemId').markAsPristine();

   (<FormArray>this.lineItemForm.get('lineItem')).controls[index].get('lineItemName').markAsUntouched();
   (<FormArray>this.lineItemForm.get('lineItem')).controls[index].get('cost').markAsUntouched();
   (<FormArray>this.lineItemForm.get('lineItem')).controls[index].get('quantity').markAsUntouched();
   (<FormArray>this.lineItemForm.get('lineItem')).controls[index].get('unit').markAsUntouched();
   (<FormArray>this.lineItemForm.get('lineItem')).controls[index].get('inclusions').markAsUntouched();
   (<FormArray>this.lineItemForm.get('lineItem')).controls[index].get('exclusions').markAsUntouched();
   (<FormArray>this.lineItemForm.get('lineItem')).controls[index].get('description').markAsUntouched();
   (<FormArray>this.lineItemForm.get('lineItem')).controls[index].get('dynamicLabel1').markAsUntouched();
   (<FormArray>this.lineItemForm.get('lineItem')).controls[index].get('dynamicLabel2').markAsUntouched();
   (<FormArray>this.lineItemForm.get('lineItem')).controls[index].get('dynamicLabel3').markAsUntouched();

   (<FormArray>this.lineItemForm.get('lineItem')).controls[index].get('lineItemName').markAsPristine();
   (<FormArray>this.lineItemForm.get('lineItem')).controls[index].get('cost').markAsPristine();
   (<FormArray>this.lineItemForm.get('lineItem')).controls[index].get('quantity').markAsPristine();
   (<FormArray>this.lineItemForm.get('lineItem')).controls[index].get('unit').markAsPristine();
   (<FormArray>this.lineItemForm.get('lineItem')).controls[index].get('inclusions').markAsPristine();
   (<FormArray>this.lineItemForm.get('lineItem')).controls[index].get('exclusions').markAsPristine();
   (<FormArray>this.lineItemForm.get('lineItem')).controls[index].get('description').markAsPristine();
   (<FormArray>this.lineItemForm.get('lineItem')).controls[index].get('dynamicLabel1').markAsPristine();
   (<FormArray>this.lineItemForm.get('lineItem')).controls[index].get('dynamicLabel2').markAsPristine();
   (<FormArray>this.lineItemForm.get('lineItem')).controls[index].get('dynamicLabel3').markAsPristine();

   (<FormArray>this.lineItemForm.get('lineItem')).controls[index].patchValue({
      'lineItemId':'',
      'description': '',
      'dynamicLabel1': '',
      'dynamicLabel2': '',
      'dynamicLabel3': '',
      'exclusions': '',
      'inclusions': '',
      'lineItemName': '',
      'cost': null,
      'quantity': null,
      'unit': ''
    }); 
  }

  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
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
    let datatableParam : DataTableParam= {
      offset: 0,
      size: 1000000,
      sortField: '',
      sortOrder: 1,
      searchText: '{"IS_ENABLE" : true}'
  }
    this.queryParam = this.prepareQueryParam(datatableParam);
    this._uomService.getUOMList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.uom = data.data.result;
          }
        } else {
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  onCancel(){
    this.isCancel = true;
    this.localStorageService.removeItem('addLineItemScreen');
    if(this.localStorageService.getItem('lineItem')){
      this.localStorageService.removeItem('lineItem');
      this.lineItemService.lineItemIdTransfer.next(null);
    }
    this.screenChange1.emit('jobsiteListing');

  }

  setFilterToGetByClient(){
    this.filterMap.clear();
    this.filterMap.set('USER_ID', this.loggedInUserId);
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    let globalFilter = JSON.stringify(jsonObject);
    return globalFilter;
  }

  loadLineItemList() {
    this.dataTableParamForTemplate = {
      offset: this.offset,
      size: 1000,
      sortField: this.sortField.toUpperCase(),
      sortOrder: 0,
      searchText: this.setFilterToGetByClient()
    };
    this.queryParamTemplate = this.prepareQueryParam(this.dataTableParamForTemplate);
    this.lineItemTemplateService.getTemplateList(this.queryParamTemplate).subscribe(
      data => {
        this.products = data.data.result;
        if (!this.products.some((item) => item.id === this.defaultLineItem.id)) {
          this.products.splice(0, 0, this.defaultLineItem);
        }
        this.offset = data.data.first;
        this.totalRecords = data.data.totalRecords;
      }
    );
  }


  validateLengthForAllWorkType(){
    let count = 0;
    this.lineItemForm.value.lineItem.forEach(element => {
      if(this.validateLengthForSingleWorkType(element.description,element.inclusions,element.exclusions)){
        count++;
      }
    });

    if(this.lineItemForm.value.lineItem.length === count){
      return true;
    }
    else{
      false;
    }
  }

  validateLengthForSingleWorkType(description,inclusion,exclusion){
    if(this.returnLengthOfDescription(description) > 1000){
      return false;
    }
    else if(this.returnLengthOfInclusion(inclusion) > 200){
      return false;
    }
    else if(this.returnLengthOfExclusion(exclusion) > 200){
      return false;
    }

    return true;
  }

  returnLengthOfDescription(description){
    if(description){
      var plainText = description.replace(/<[^>]*>/g, '');
      return plainText.length;
    }
    else{
      return 0;
    }
  }

  returnLengthOfInclusion(inclusion){
    if(inclusion){
      var plainText = inclusion.replace(/<[^>]*>/g, '');
      return plainText.length;
    }
    else{
      return 0;
    }
  }

  returnLengthOfExclusion(exclusion){
    if(exclusion){
      var plainText = exclusion.replace(/<[^>]*>/g, '');
      return plainText.length;
    }
    else{
      return 0;
    }
  }
}



