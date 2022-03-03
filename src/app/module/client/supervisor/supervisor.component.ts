import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Table } from 'primeng/table';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { SupervisorService } from 'src/app/service/client-services/supervisor/supervisor.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { SupervisorDetails } from 'src/app/shared/vo/SupervisorDetails';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-supervisor',
  templateUrl: './supervisor.component.html',
  styleUrls: ['./supervisor.component.css']
})
export class SupervisorComponent implements OnInit {
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  action: any[] = [];
  selectedAction: any;
  supervisorDialog = false;
  selectedSupervisor: SupervisorDetails[] = [];
  data: SupervisorDetails[] = [];
  loggedInUserId: string;
  loading = false;
  offset: Number = 0;
  totalRecords: Number = 0;
  datatableParam: DataTableParam;
  filterMap = new Map();
  sortField = 'NAME';
  queryParam;
  sortOrder;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN
  globalFilter;
  supervisorForm: FormGroup;
  submitted = false;
  supervisor: any;
  supervisorDetails: SupervisorDetails;
  emailFilterValue = '';
  isFilterOpened = false;
  isInEditMode : boolean;
  assignmentDialog = false;
  dialogHeader : string;
  subscription: Subscription;
  _selectedColumns: any[];

  @ViewChild('dt') table: Table;
  columns = [
    { label:  this.translator.instant('name'), value: 'NAME', sortable:true,selected:true},
    { label:  this.translator.instant('email.address'), value: 'EMAIL', sortable:true,selected:true},
    { label:  this.translator.instant('status'), value: 'IS_ACTIVE', sortable:false,selected:true},
    { label:  this.translator.instant('work.phone'), value: 'WORK_PONE', sortable:true,selected:false},
    { label:  this.translator.instant('mobile.number'), value: 'MOBILE_PHONE', sortable:true,selected:false},
    { label:  'Post New Project ?', value: 'IS_ALLOW', sortable:false,selected:false},
    { label:  this.translator.instant('assignment'), value: 'ASSIGNMENT', sortable:false,selected:false}
  ];

  constructor( private translator: TranslateService,
               private _formBuilder: FormBuilder,
               private _localStorageService: LocalStorageService,
               private _supervisorService: SupervisorService,
               private confirmDialogService: ConfirmDialogueService,
               private notificationService: UINotificationService,
               private captionChangeService : HeaderManagementService) {
        this.captionChangeService.hideHeaderSubject.next(true);
        this.action = [
      {name : 'Activate', value: true},
      {name : 'Inactivate', value: false}
    ];
  }

  ngOnInit(): void {
    this.isInEditMode = true;
    this.dialogHeader = this.translator.instant('add.supervisor');
    this.loggedInUserId = this._localStorageService.getLoginUserId();
    this.initializeForm();
    this._selectedColumns = this.columns.filter(x=>x.selected==true);
  }

  openDialog(): void{
    this.supervisorDialog = true;
    this.dialogHeader = this.translator.instant('add.supervisor');
    this.submitted = false;
    this.initializeForm();
  }

  hideDialog(): void {
    this.supervisorDialog = false;
    this.submitted = false;
    this.supervisorForm.reset();
  }

  openAssignmentDialog(id): void{
    this._supervisorService.supervisorIdTransfer.next(id);
    this.assignmentDialog = true;
  }

  hideAssignmentDialog(): void {
    this.assignmentDialog = false;
  }

  onFilterOpen(){
    this.isFilterOpened = !this.isFilterOpened;
  }

  onFilterClear(){
    this.emailFilterValue = '';
    this.filter();
  }

  initializeForm(): void{
    this.isInEditMode = false;
    this.supervisorForm = this._formBuilder.group({
      id: [],
      createdBy: this.loggedInUserId,
      updatedBy: this.loggedInUserId,
      firstName: ['', [Validators.required,Validators.maxLength(30)]],
      lastName: ['', [Validators.required,Validators.maxLength(30)]],
      email : ['', [Validators.required, 
              CustomValidator.emailValidator,
              Validators.maxLength(50)]],
      workPhone: ['', [Validators.required]],
      mobilePhone: ['', [Validators.required]],
      clientId: this.loggedInUserId,
      password: ['Password@123'],
      isAllowToPostProject: [true],
      role: 'SUPERVISOR'
    });
  }

  onSupervisorFormSubmit(){
    this.submitted = true;
    if (!this.supervisorForm.valid) {
      CustomValidator.markFormGroupTouched(this.supervisorForm);
      this.submitted = true;
      return false;
    }


    if (this.supervisorForm.controls.id.value !== null) {
      if (this.supervisorForm.valid){
        this.supervisorDetails = {
          id: this.supervisorForm.controls.id.value,
          workPhone: this.supervisorForm.controls.workPhone.value,
          mobilePhone:this.supervisorForm.controls.mobilePhone.value,
          isAllowToPostProject:this.supervisorForm.controls.isAllowToPostProject.value,
          supervisor : {
            firstName: this.supervisorForm.controls.firstName.value,
            lastName: this.supervisorForm.controls.lastName.value,
            email: this.supervisorForm.controls.email.value,
          },
          updatedBy: this.supervisorForm.controls.updatedBy.value,
          createdBy: this.supervisorForm.controls.createdBy.value
        }

        this._supervisorService.updateSupervisor(JSON.stringify(this.supervisorDetails)).subscribe(
          data => {
            if (data.statusCode === '200' && data.message === 'OK') {
              this.notificationService.success(this.translator.instant('supervisor.updated.successfully'), '');
              this.supervisorForm.reset();
              this.supervisorDialog = false;
              this.submitted = false;
              this.loadSupervisorList();
            }
            else{
              this.notificationService.error(data.message, '');
              this.supervisorDialog = false;
              this.submitted = false;
            }
          },
          error => {
            this.notificationService.error(this.translator.instant('common.error'), '');
            this.supervisorDialog = false;
            this.submitted = false;
          }
        );
      }
    }
    else{
      if (this.supervisorForm.valid){
        this._supervisorService.addSupervisor(this.supervisorForm.value).subscribe(
          data => {
            if (data.statusCode === '200' && data.message === 'OK') {
              this.notificationService.success(this.translator.instant('supervisor.added.successfully'), '');
              this.supervisorDialog = false;
              this.submitted = false;
              this.supervisorForm.reset();
              this.loadSupervisorList();
            }
            else{
              this.notificationService.error(data.message, '');
              this.supervisorDialog = false;
              this.submitted = false;
            }
          },
          error => {
            this.notificationService.error(this.translator.instant('common.error'), '');
            this.supervisorDialog = false;
            this.submitted = false;
          }
        );
      }
    }  
  }

  setFilterToGetByClient(){
    this.filterMap.clear();
    this.filterMap.set('CLIENT_ID', this.loggedInUserId);
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    let globalFilter = JSON.stringify(jsonObject);
    return globalFilter;
  }

  onLazyLoad(event) {
    this.sortOrder = event.sortOrder === -1 ? 0 : 1;

    if (this.emailFilterValue === '') {
      this.globalFilter = event.globalFilter ? event.globalFilter : this.setFilterToGetByClient();
    }

    this.sortField = event.sortField ? event.sortField : 'NAME';
    this.offset = event.first / event.rows;
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ?  event.rows : 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadSupervisorList();
  }

  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  loadSupervisorList() {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this._supervisorService.getSupervisorList(this.queryParam).subscribe(
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

  editSupervisor(supervisorDetails : SupervisorDetails){
    this.dialogHeader = this.translator.instant('edit.supervisor');
    this.isInEditMode = true;
    this.supervisor = { ...supervisorDetails };

    this.supervisorForm.controls.id.patchValue(this.supervisor.id);
    this.supervisorForm.controls.firstName.patchValue(this.supervisor.supervisor.firstName);
    this.supervisorForm.controls.lastName.patchValue(this.supervisor.supervisor.lastName);
    this.supervisorForm.controls.email.patchValue(this.supervisor.supervisor.email);
    this.supervisorForm.controls.isAllowToPostProject.patchValue(this.supervisor.isAllowToPostProject);
    this.supervisorForm.controls.workPhone.patchValue(this.supervisor.workPhone);
    this.supervisorForm.controls.mobilePhone.patchValue(this.supervisor.mobilePhone);
    this.supervisorForm.controls.updatedBy.patchValue(this.loggedInUserId);
    this.supervisorForm.controls.createdBy.patchValue(this.supervisor.createdBy);

    this.supervisorDialog = true;
  }

  changeStatusOfSupervisor(){
    if(this.selectedAction.value){
      this.selectedSupervisor.forEach(supervisor => this.activeSupervisor(supervisor.id));
      this.selectedSupervisor.splice(0,this.selectedSupervisor.length);
    }
    else{
      this.selectedSupervisor.forEach(supervisor => this.inactiveSupervisor(supervisor.id));
      this.selectedSupervisor.splice(0,this.selectedSupervisor.length);
    }
  }

  inactiveSupervisor(id: string){
    this._supervisorService.inactiveSupervisor(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success(this.translator.instant('supervisor.inactived.successfully'), '');
          this.selectedAction = null;
          this.loadSupervisorList();
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

  activeSupervisor(id: string){
    this._supervisorService.activeSupervisor(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success(this.translator.instant('supervisor.actived.successfully'), '');
          this.selectedAction = null;
          this.loadSupervisorList();
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

  openDialogBox(){
    if(this.selectedSupervisor.length !== 0){

      if(this.selectedAction){
        let options = null;
        let message = this.translator.instant('dialog.message');
        options = {
          title: this.translator.instant('warning'),
          message: this.translator.instant(`${message} ${this.selectedAction.name}?`),
          cancelText: this.translator.instant('dialog.cancel.text'),
          confirmText: this.translator.instant('dialog.confirm.text')
        }
        this.confirmDialogService.open(options);
        this.confirmDialogService.confirmed().subscribe(confirmed => {
        if (confirmed){
          this.changeStatusOfSupervisor();
        }
        });
      }
      else{
        this.notificationService.error('Please select action','');
      }
    }
    else{
      this.notificationService.error('Please select at least one supervisor','');
    }
  }

  filter() {
    this.filterMap.clear();
    this.filterMap.set('CLIENT_ID', this.loggedInUserId);
    if (this.emailFilterValue !== '') {
      this.filterMap.set('EMAIL', this.emailFilterValue);
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
    this.loadSupervisorList();
  }

  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }
  
  set selectedColumns(val: any[]) {
    this._selectedColumns = this.columns.filter(col => val.includes(col));
  }
}
