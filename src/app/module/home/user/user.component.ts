import { PATH_CONSTANTS } from './../../../shared/PathConstants';
import { API_CONSTANTS } from './../../../shared/ApiConstants';
import { CustomValidator } from './../../../shared/CustomValidator';
import { DataTableParam } from './../../../shared/vo/DataTableParam';
import { User } from './../../../shared/vo/User';
import { NotificationService } from './../../../shared/error/error.service';
import { LocalStorageService } from './../../../service/localstorage.service';
import { Router } from '@angular/router';
import { UserService } from './../../../service/User.service';
import { DatePipe, DOCUMENT } from '@angular/common';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { InitEditableRow, Table } from 'primeng/table';
import { strict } from 'assert';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { TranslateService } from '@ngx-translate/core';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { LoginAsService } from 'src/app/service/login-as.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  providers: [DatePipe],
})
export class UserComponent implements OnInit {
  @ViewChild('dt') table: Table;
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  columns = [
    { label: this.translator.instant('first.name'), value: 'first_name' },
    { label: this.translator.instant('last.name'), value: 'last_name' },
    { label: this.translator.instant('email'), value: 'email' },
    // { 'label': 'Company Name', 'value': 'companyName' },
    // { 'label': 'Role', 'value': 'role' },
    // { 'label': 'Mobile Phone', 'value': 'mobilePhone' },
    // { 'label': 'Work Phone', 'value': 'workPhone' }

  ];

  emailFilterValue = '';
  firstNameFilterValue = '';
  data: User[] = [];
  url;
  loading = false;
  offset: Number = 0;
  datatableParam: DataTableParam;
  totalRecords: Number = 0;
  loginUserId;
  showConfirmDialog = false;
  sortField = 'FIRST_NAME';
  sortOrder;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  globalFilter;
  filterMap = new Map();
  queryParam;
  displayDialog = false;
  myForm: FormGroup;
  selectedUserId: string;
  user: User;
  submitted = false;
  userDialog = false;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  constructor(@Inject(DOCUMENT) private document: any,
    private _userService: UserService,
    private loginAsService:LoginAsService,
    private _router: Router,
    private datePipe: DatePipe,
    private _localStorageService: LocalStorageService,
    private _errorservice: NotificationService,
    private _formBuilder: FormBuilder,
    private captionChangeService: HeaderManagementService, private translator: TranslateService
  ) {
    // this.contactUser = this._formBuilder.group({
    //   'fromUser': [''],
    //   'objectId': [''],
    //   'objectType': [''],
    //   'toUser': [''],
    //   'message': ['', [CustomValidator.required]]
    // });

    this.datatableParam = new DataTableParam();
    this.datatableParam = {
      offset: 0,
      size: 2,
      sortField: 'FIRST_NAME',
      sortOrder: 1,
      searchText: null
    };

    this.loginUserId = _localStorageService.getLoginUserId();
  }




  ngOnInit() {
    this.initializeForm();
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.USER);
  }

  onLazyLoad(event) {

    this.sortOrder = event.sortOrder == -1 ? 0 : 1;
    this.globalFilter = event.globalFilter ? event.globalFilter : null;
    this.sortField = event.sortField ? event.sortField : 'FIRST_NAME';
    this.offset = event.first / event.rows;
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ?  event.rows : 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    console.log('datatableparams', this.datatableParam);
    this.loadUserList();
  }

  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  loadUserList() {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this._userService.getUserList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.loading = false;
            this.data = data.data.result;
            console.log(this.data);
            this.data.map(e => {

            });

            this.offset = data.data.first;
            this.totalRecords = data.data.totalRecords;
            // this.url = 'assets/images/users/5.jpg';
          }
        } else {
          this.loading = false;
        }
      },
      error => {
        this.loading = false;
        console.log(error);
      }
    );
  }

  filter() {

    this.filterMap.clear();
    if (this.emailFilterValue != '') {
      this.filterMap.set('EMAIL', this.emailFilterValue);
    }
    if (this.firstNameFilterValue != '') {
      this.filterMap.set('FIRST_NAME', this.firstNameFilterValue);
    }
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    console.log(JSON.stringify(jsonObject));
    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParam = {
      offset: this.offset,
      size: this.size,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    console.log('datatableparams', this.datatableParam);
    this.loadUserList();
  }


  viewUserDetails(userId): void {
    this._router.navigate([PATH_CONSTANTS.USER_PATH + '/view/' + userId]);
  }

  onLoad(img: HTMLElement, id: string) {
    const ele: HTMLElement = this.document.getElementById('progress_' + id);
    ele.remove();
  }




  // activateDeactivate(id: string, value: number) {
  //   this.showConfirmDialog = true;
  //   //const object = { 'userId': userId, 'isActive': value };
  //   if (value === 1) {
  //     this.confirmationService.confirm({
  //       message: 'Do you want to deactivate the user?',
  //       header: 'Deactivate Confirmation',
  //       icon: 'fa fa-info',
  //       accept: () => {
  //         this.activateDeactivateUser(id, 0);
  //       },
  //       reject: () => {
  //         this.showConfirmDialog = false;
  //         return false;
  //       }
  //     });

  //   } else {
  //     this.confirmationService.confirm({
  //       message: 'Do you want to activate the user?',
  //       header: 'Activate Confirmation',
  //       icon: 'fa fa-info',
  //       accept: () => {
  //         this.activateDeactivateUser(id, 1);
  //       },
  //       reject: () => {
  //         this.showConfirmDialog = false;
  //         return false;
  //       }
  //     });
  //   }
  // }

  // delete(event, id: string) {
  //   this.showConfirmDialog = true;
  //   this.confirmationService.confirm({
  //     message: 'Do you want to delete the user?',
  //     header: 'Delete Confirmation',
  //     icon: 'fa fa-info',
  //     accept: () => {
  //       this.deleteUser(event, id);
  //     },
  //     reject: () => {
  //       this.showConfirmDialog = false;
  //       return false;
  //     }
  //   });

  // }

  activateDeactivateUser(id: string, isActive: number) {

  }


  deleteUser(event, id: string) {
    // this._userService.deleteUser(id).subscribe(
    //   data => {
    //     if (data.statusCode == "200" && data.message == "OK") {
    //       this._errorservice.showSuccess("User deleted successfully.");
    //       this.onLazyLoad(event);
    //       //this._router.navigate([PATH_CONSTANTS.USER_PATH]);
    //       // this.data.map((item , index)=>{
    //       //   if(item.id === id){
    //       //     this.data.splice(index, 1);
    //       //   }
    //       //   return item
    //       // })
    //     }
    //     else {
    //       this._errorservice.showError("Something went wrong.\nPlease retry after sometime or contact Administrator.")
    //     }
    //   },
    //   error => {
    //     console.log(error);
    //   }
    // );
  }




  editUser(user: User): void {

    this.user = { ...user };
    // alert(this.user.id);
    this.myForm.controls.id.patchValue(this.user.id);
    this.myForm.controls.firstName.patchValue(this.user.firstName);
    this.myForm.controls.lastName.patchValue(this.user.lastName);
    this.myForm.controls.email.patchValue(this.user.email);
    this.myForm.controls.companyName.patchValue(this.user.companyName);
    this.myForm.controls.password.patchValue(this.user.password);
    this.myForm.controls.role.patchValue(this.user.role);
    this.myForm.controls.mobilePhone.patchValue(this.user.mobilePhone);
    this.myForm.controls.workPhone.patchValue(this.user.workPhone);

    this.userDialog = true;
  }

  hideDialog(): void {
    this.userDialog = false;
    this.submitted = false;
    this.initializeForm();
  }

  addUser() {
    // this.userDialog = true;
    // this.initializeForm();
    this._localStorageService.logout();

    let userParams={"username":'admin@admin.com',"password":'Parth@13'};

    let queryparam=this.prepareQueryParam(userParams);
    setTimeout(() => {
      this.loginAsService.generateTokenForLoginAs(queryparam,'ravi.gohil@spec-india.com');
    }, 5000);
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
      this._userService.updateUser(JSON.stringify(this.myForm.value)).subscribe(
        data => {
          console.log(data);
          if (data.statusCode === '200' && data.message === 'OK') {
            this._errorservice.showSuccess('User updated');
            this.loadUserList();
            this.userDialog = false;
            this.submitted = false;
          }
        },
        error => {
          this._errorservice.showError('Something went wrong. Please try again later or contact your administrator');
          console.log(error);
          this.userDialog = false;
          this.submitted = false;
        }
      );
    } else {
      this._userService.addUser(JSON.stringify(this.myForm.value)).subscribe(
        data => {
          console.log(data);
          if (data.statusCode === '200' && data.message === 'OK') {
            this._errorservice.showSuccess('User Added');
            this.loadUserList();
            this.userDialog = false;
            this.submitted = false;
          }
        },
        error => {
          this._errorservice.showError('Something went wrong. Please try again later or contact your administrator');
          console.log(error);
          this.userDialog = false;
          this.submitted = false;
        }
      );
    }
  }




  initializeForm() {
    this.myForm = this._formBuilder.group({
      id: [],
      companyName: ['', [CustomValidator.required]],
      email: ['', [CustomValidator.required]],
      firstName: ['', [CustomValidator.required]],
      lastName: ['', [CustomValidator.required]],
      mobilePhone: ['', [CustomValidator.required, CustomValidator.numericValidation]],
      password: ['', [CustomValidator.required]],
      role: ['', [CustomValidator.required]],
      workPhone: [],
    });
  }

  // saveProduct() {
  //   this.submitted = true;

  //   if (this.product.name.trim()) {
  //     if (this.product.id) {
  //       this.products[this.findIndexById(this.product.id)] = this.product;
  //       this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 });
  //     }
  //     else {
  //       this.product.id = this.createId();
  //       this.product.image = 'product-placeholder.svg';
  //       this.products.push(this.product);
  //       this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
  //     }

  //     this.products = [...this.products];
  //     this.productDialog = false;
  //     this.product = {};
  //   }
  // }

}
