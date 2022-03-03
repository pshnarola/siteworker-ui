import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Table } from 'primeng/table';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { AdminUserService } from 'src/app/service/admin-services/admin-user/admin-user.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { UserService } from 'src/app/service/User.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { User } from 'src/app/shared/vo/User';
import { SubcontractorStatusChange } from '../subcontractorStatusChange';
import { AdminUserDTO } from './AdminUserDTO';
import { UserPermission } from './UserPermission';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit, OnDestroy {

  @ViewChild('dt') table: Table;

  columns = [
    { label: this.translator.instant('name'), value: 'name', sortable: true },
    { label: this.translator.instant('email'), value: 'email', sortable: true },
    { label: this.translator.instant('contact.number'), value: 'subAdminContactNumber', sortable: true },
    { label: this.translator.instant('user.rights'), value: 'userRights', sortable: false },
  ];

  accessRightsColumns = [
    { label: this.translator.instant('menu'), value: 'menu' },
    { label: this.translator.instant('can.view'), value: 'canView' },
    { label: this.translator.instant('can.modify'), value: 'canModify' },
  ];

  nameFilterValue = '';
  url;

  loading = false;
  offset = 0;
  datatableParam: DataTableParam;
  loginUserId;
  sortField = 'CREATED_DATE';
  sortOrder;
  globalFilter = null;
  totalRecords = 0;
  rowIndex = 0;

  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;

  filterMap = new Map();
  queryParam;

  displayDialog = false;
  accessRightDialog = false;
  userDialog = false;
  showConfirmDialog = false;

  myForm: FormGroup;
  accessRightsForm: FormGroup;

  selectedUserId: string;

  submitted = false;
  popupHeader: string;
  status;
  user: User;
  adminUserDTO: AdminUserDTO;
  adminUser: AdminUserDTO;
  userPermissions: UserPermission;
  userPermissionsList: UserPermission[] = [];
  userPermissionsListFromDB: UserPermission[] = [];
  userList = [];
  userStatusChange: SubcontractorStatusChange;
  isCheckedModify = false;
  editMode = false;

  constructor(
    private formBuilder: FormBuilder,
    private captionChangeService: HeaderManagementService,
    private translator: TranslateService,
    private userService: UserService,
    private adminUserService: AdminUserService,
    private notificationService: UINotificationService,
    private localStorageService: LocalStorageService,
    private confirmDialogueService: ConfirmDialogueService,

  ) {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.user = null;
    this.userPermissionsList = [
      {
        user: this.user,
        id: null,
        createdBy: null,
        updatedBy: null,
        menuName: 'Clients',
        canView: false,
        canModify: false
      },
      {
        user: this.user,
        id: null,
        createdBy: null,
        updatedBy: null,
        menuName: 'Subcontractors',
        canView: false,
        canModify: false
      },
      {
        user: this.user,
        id: null,
        createdBy: null,
        updatedBy: null,
        menuName: 'Workers',
        canView: false,
        canModify: false
      },
      {
        user: this.user,
        id: null,
        createdBy: null,
        updatedBy: null,
        menuName: 'Projects',
        canView: false,
        canModify: false
      },
      {
        user: this.user,
        id: null,
        createdBy: null,
        updatedBy: null,
        menuName: 'Jobs',
        canView: false,
        canModify: false
      },
      {
        user: this.user,
        id: null,
        createdBy: null,
        updatedBy: null,
        menuName: 'Masters',
        canView: false,
        canModify: false
      },
      {
        user: this.user,
        id: null,
        createdBy: null,
        updatedBy: null,
        menuName: 'Reports',
        canView: false,
        canModify: false
      }
    ];
    this.loginUserId = this.localStorageService.getLoginUserId();
    this.userList = [];
    this.datatableParam = new DataTableParam();
    this.datatableParam = {
      offset: this.offset,
      size: this.size,
      sortField: 'CREATED_DATE',
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
  }

  ngOnInit(): void {
    const dummyData = [];
    this.initializeForm();
    this.initializeAccessRightsForm(this.userPermissionsList);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.SUBADMIN_USERS);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
  }

  ngOnDestroy(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(false);
  }

  // tslint:disable-next-line: typedef
  prepareQueryParam(paramObject) {
    // tslint:disable-next-line: new-parens
    const params = new URLSearchParams;
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  initializeForm(): void {
    this.myForm = this.formBuilder.group({
      id: [],
      firstName: ['', [CustomValidator.required]],
      lastName: ['', [CustomValidator.required]],
      email: ['', [CustomValidator.required, CustomValidator.emailValidator]],
      subAdminContactNumber: ['', [CustomValidator.required]],
      password: [COMMON_CONSTANTS.COMMON_PASSWORD_FOR_ADMIN_ADD_FUNCTIONALITY],
      role: 'SUBADMIN',
      createdDate: [],
      updatedDate: [],
      isRequestFromAdmin: [true],
      isLoginAsCompany: [false],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      isActive: 1
    });
    this.editMode = false;
  }

  initializeAccessRightsForm(data): void {
    const userPermissions = new FormArray([]);
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < data.length; i++) {
      userPermissions.push(this.formBuilder.group({
        id: data[i].id,
        createdBy: data[i].createdBy,
        updatedBy: data[i].updatedBy,
        menuName: data[i].menuName,
        user: data[i].user,
        canView: data[i].canView,
        canModify: data[i].canModify
      }));
    }
    this.accessRightsForm = this.formBuilder.group({
      userPermissions

    });

  }

  onLazyLoad(event) {
    this.sortOrder = event.sortOrder === -1 ? 0 : 1;
    this.globalFilter = event.globalFilter ? event.globalFilter : `{"ROLE_NAME": "SUBADMIN"}`;
    this.sortField = event.sortField ? event.sortField : 'CREATED_DATE';
    this.offset = event.first / event.rows;
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadUserList();
  }

  loadUserList(): void {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.adminUserService.getUserList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.loading = false;
          this.userList = data.data.result;
          this.offset = data.data.first;
          this.totalRecords = data.data.totalRecords;
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

  loadUserPermissionsList(id): void {
    this.adminUserService.getUserPermissionsListById(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.userPermissionsListFromDB = data.data;
          this.initializeAccessRightsForm(this.userPermissionsListFromDB);
        } else {
        }
      },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
        console.log(error);
      }
    );
  }

  addCertificate(): void {
    this.userDialog = true;
    this.popupHeader = 'Add subadmin user';
    this.initializeForm();
  }

  onSubmit(): any {
    this.submitted = true;
    if (this.accessRightDialog && this.user) {
      this.adminUser = new AdminUserDTO();
      this.adminUser.userDTO = this.user;
      this.adminUser.userPermissions = this.accessRightsForm.value.userPermissions;
      this.adminUserService.updateUser(this.adminUser).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.notificationService.success(this.translator.instant('subAdmin.updated.successfully'), '');
            this.hideAccessRightDialog();
            this.loadUserList();
            this.submitted = false;
          }
          else {
            this.notificationService.error(this.translator.instant(data.message), '');
            this.hideAccessRightDialog();
            this.loadUserList();
            this.submitted = false;
          }
        },
        (error) => {
          this.notificationService.error(this.translator.instant('common.error'), '');
          this.hideAccessRightDialog();
          this.loadUserList();
          this.submitted = false;
        });
    } else {
      if (!this.myForm.valid) {
        let controlName: string;
        // tslint:disable-next-line: forin
        for (controlName in this.myForm.controls) {
          this.myForm.controls[controlName].markAsDirty();
          this.myForm.controls[controlName].updateValueAndValidity();
        }
        this.submitted = true;
        return false;
      }

      if (this.adminUserDTO) {
        this.adminUser = new AdminUserDTO();
        this.adminUser.createdBy = this.loginUserId;
        this.adminUser.updatedBy = this.loginUserId;
        this.adminUser.userDTO = this.myForm.value;
        this.adminUser.userPermissions = this.adminUserDTO.userPermissions;
        this.adminUserService.updateUser(this.adminUser).subscribe(
          data => {
            if (data.statusCode === '200' && data.message === 'OK') {
              this.notificationService.success(this.translator.instant('subAdmin.updated.successfully'), '');
              this.hideDialog();
              this.loadUserList();
              this.submitted = false;
            }
            else {
              this.notificationService.error(this.translator.instant(data.message), '');
              this.loadUserList();
            }
          },
          (error) => {
            this.notificationService.error(this.translator.instant('common.error'), '');
            this.loadUserList();
          });
      }
      else {
        this.adminUser = new AdminUserDTO();
        this.adminUser.createdBy = this.loginUserId;
        this.adminUser.updatedBy = this.loginUserId;
        this.adminUser.id = null;
        this.adminUser.userDTO = this.myForm.value;
        this.adminUser.userPermissions = this.accessRightsForm.value.userPermissions;
        this.adminUserService.addUser(this.adminUser).subscribe(
          data => {
            if (data.statusCode === '200' && data.message === 'OK') {
              this.notificationService.success(this.translator.instant('subAdmin.added.successfully'), '');
              this.hideDialog();
              this.loadUserList();
              this.submitted = false;
            }
            else {
              this.notificationService.error(data.message, '');
              this.loadUserList();
            }
          },
          (error) => {
            this.notificationService.error(this.translator.instant('common.error'), '');
            this.loadUserList();
          });
      }
    }

  }

  onSubmitUserPermission(): any {
    this.submitted = true;
    if (!this.accessRightsForm.valid) {
      let controlName: string;
      // tslint:disable-next-line: forin
      for (controlName in this.accessRightsForm.controls) {
        this.accessRightsForm.controls[controlName].markAsDirty();
        this.accessRightsForm.controls[controlName].updateValueAndValidity();
      }
      this.submitted = true;
      return false;
    }

    this.adminUser = new AdminUserDTO();
    this.adminUser.userPermissions = this.accessRightsForm.value.userPermissions;

    if (this.adminUser.userPermissions[0].id) {
      this.adminUserService.updateUserPermissions(this.adminUser.userPermissions).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.notificationService.success(this.translator.instant('admin.updated.successfully'), '');
            this.hideDialog();
            this.loadUserList();
            this.submitted = false;
          }
          else {
            this.notificationService.error(this.translator.instant(data.message), '');
            this.hideDialog();
            this.loadUserList();
            this.submitted = false;
          }
        },
        (error) => {
          this.notificationService.error(this.translator.instant('common.error'), '');
          this.hideDialog();
          this.loadUserList();
          this.submitted = false;
        });
    } else {
      this.adminUserService.updateUserPermissions(this.adminUser.userPermissions).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.notificationService.success(this.translator.instant('admin.updated.successfully'), '');
            this.hideDialog();
            this.loadUserList();
            this.submitted = false;
          }
          else {
            this.notificationService.error(this.translator.instant(data.message), '');
            this.hideDialog();
            this.loadUserList();
            this.submitted = false;
          }
        },
        (error) => {
          this.notificationService.error(this.translator.instant('common.error'), '');
          this.hideDialog();
          this.loadUserList();
          this.submitted = false;
        });
    }

  }

  editUser(user): void {
    this.editMode = true;
    this.userDialog = true;
    this.popupHeader = 'Edit subadmin user';
    this.adminUserDTO = { ...user };
    this.user = this.adminUserDTO.userDTO;
    this.myForm.controls.id.patchValue(this.user.id);
    this.myForm.controls.firstName.patchValue(this.user.firstName);
    this.myForm.controls.lastName.patchValue(this.user.lastName);
    this.myForm.controls.email.patchValue(this.user.email);
    this.myForm.controls.subAdminContactNumber.patchValue(this.user.subAdminContactNumber);
  }

  hideDialog(): void {
    this.userDialog = false;
    this.user = null;
    this.adminUserDTO = null;
    this.editMode = false;
    this.submitted = false;
    this.initializeForm();
  }

  onSaveAndOpenAccessRights(user): void {
    this.user = user;
    this.accessRightDialog = true;
    this.popupHeader = 'Access Right';
    this.loadUserPermissionsList(user.id);
  }

  hideAccessRightDialog(): void {
    this.accessRightDialog = false;
    this.submitted = false;
    this.initializeAccessRightsForm(this.userPermissionsList);
  }

  onActiveClient(id): void {
    let list = [];
    list.push(id);
    this.userStatusChange = new SubcontractorStatusChange();
    this.userStatusChange.userIds = [];
    this.userStatusChange.userIds = list;
    this.userStatusChange.createdBy = this.loginUserId;
    this.userStatusChange.updatedBy = this.loginUserId;
    this.userService.activateUser(this.userStatusChange).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success(this.translator.instant('subAdmin.activated'), '');
          this.loadUserList();
        } else {
          this.notificationService.error(data.message, '');
          this.loadUserList();
        }
      });
  }

  onInactiveClient(id): void {
    let list = [];
    list.push(id);
    this.userStatusChange = new SubcontractorStatusChange();
    this.userStatusChange.userIds = [];
    this.userStatusChange.userIds = list;
    this.userStatusChange.createdBy = this.loginUserId;
    this.userStatusChange.updatedBy = this.loginUserId;
    this.userService.deactivateUser(this.userStatusChange).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success(this.translator.instant('subAdmin.inactivated'), '');
          this.loadUserList();
        } else {
          this.notificationService.error(data.message, '');
          this.loadUserList();
        }
      });
  }

  openDialog(id, name, status): void {

    let options = null;
    let message = this.translator.instant('dialog.message');

    if (status) {
      this.status = 'deactivate';
    } else {
      this.status = 'activate';
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
          this.onInactiveClient(id);
        }
        else {
          this.onActiveClient(id);
        }
      }
    });
  }

  onCheckedCanModify(event, index) {
    if (event.checked === true) {
      (<FormArray>this.accessRightsForm.get('userPermissions')).controls[index].get('canView').setValue(true);
    }
  }

  onCheckedCanView(event, index) {
    if (event.checked === false) {
      (<FormArray>this.accessRightsForm.get('userPermissions')).controls[index].get('canModify').setValue(false);
    }
  }

}
