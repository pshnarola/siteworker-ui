import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { FileDownloadService } from 'src/app/service/admin-services/fileDownload/file-download.service';
import { ClientProfileService } from 'src/app/service/client-services/client-profile/client-profile.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { SubcontractorProfileService } from 'src/app/service/subcontractor-services/subcontractor-profile/subcontractor-profile.service';
import { BasicDetailService } from 'src/app/service/worker-services/basic-detail/basic-detail.service';
import { WorkerCertificateService } from 'src/app/service/worker-services/workerCertificate/worker-certificate.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { environment } from 'src/environments/environment';
import { ApproveRejectCertificateDTO } from '../../admin/vos/ApproveRejectCertificateDTO';
@Component({
  selector: 'app-manage-certificates-worker',
  templateUrl: './manage-certificates-worker.component.html',
  styleUrls: ['./manage-certificates-worker.component.css']
})
export class ManageCertificatesWorkerComponent implements OnInit, OnDestroy {

  tableRowSize = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  tablePaginateDropdown = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  loading = false;

  user: any;
  rolename: any;
  loggedInUserName: string;
  usernameLabel: string;
  displayAvatar: boolean;
  avatarColor: string = '#2196F3';
  client: any;
  profileImage: any;
  singleImageView: string;
  workerDto: any;
  subcontractor: any;

  datatableParam: DataTableParam;
  offset = 0;
  totalRecords = 0;
  sortField = 'NAME';
  sortOrder = 0;

  loginUserId: any;
  actionTypes = [
    { name: 'APPROVE', value: 'Approve' },
    { name: 'REJECT', value: 'Reject' }
  ];
  columns = [
    { label: 'Certificate', value: 'certificate.name', sortable: true, isHidden: false },
    { label: 'Certificate Date', value: 'certificationDate', sortable: true, isHidden: false },
    { label: 'Expiry Date', value: 'expiryDate', sortable: true, isHidden: false },
    { label: 'Uploaded Date', value: 'createdDate', sortable: true, isHidden: false },
    { label: 'Approved / Rejected date', value: 'approvedDate', sortable: true, isHidden: false },
  ];
  workerName: any;
  queryParam;
  certificateList = [];
  isAllCertificateSelected: boolean;
  selectedCertificateList = [];
  approveOrReject: any;
  totalStatusCount = 0;
  loggedInUser: any;
  constructor(
    private translator: TranslateService,
    private localStorageService: LocalStorageService,
    private captionChangeService: HeaderManagementService,
    private formBuilder: FormBuilder,
    private notificationService: UINotificationService,
    private fileService: FileDownloadService,
    private confirmDialogueService: ConfirmDialogueService,
    private workerCertificateService: WorkerCertificateService,
    private _clientProfileService: ClientProfileService,
    private _workerProfileServices: BasicDetailService,
    private _subContractorProfileServices: SubcontractorProfileService,
    private router: Router
  ) {

    this.datatableParam = new DataTableParam();
    this.datatableParam = {
      offset: 0,
      size: 2,
      sortField: 'NAME',
      sortOrder: 1,
      searchText: null
    };
    this.loginUserId = localStorageService.getLoginUserId();
    this.loggedInUser = localStorageService.getLoginUserObject();
    this.user = this.localStorageService.getLoginUserObject();
    if (this.user != null) {
      this.rolename = this.user.roles[0].roleName;
      this.loggedInUserName = this.user.firstName + ' ' + this.user.lastName;
    } else {
      this.loggedInUserName = 'Guest';
    }


  }

  ngOnInit(): void {
    this.getWorkerCertificateList(this.localStorageService.getItem('workerUserForManageCertificates'));
    let worker = this.localStorageService.getItem('workerUserForManageCertificates');
    this.workerName = worker.firstName + ' ' + worker.lastName;
    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(true);


    switch (this.rolename) {
      case 'ADMIN':
        this.usernameLabel = 'AU';
        this.displayAvatar = true;
        break;
      case 'CLIENT':
        this.getLogedInClientDetail(this.user.id);
        break;
      case 'SUBCONTRACTOR':
        this.getLogedInSubcontractorDetail(this.user.id);
        this.avatarColor = '#FCCC00';
        break;
      case 'WORKER':
        this.getLogedInWorkerDetail(this.user.id);
        break;
      default:
        this.usernameLabel = this.user.firstName.substring(0, 1) + this.user.lastName.substring(0, 1);
        this.avatarColor = '#2196F3';
        this.displayAvatar = true;
        break;
    }
  }

  ngOnDestroy(): void {
    this.captionChangeService.hideSidebarSubject.next(false);
    this.localStorageService.removeItem('workerUserForManageCertificates');
  }

  getLogedInClientDetail(id) {
    this._clientProfileService.getClientDetail(id).subscribe(
      (data) => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.client = data.data;
          this.profileImage = this.client.photo;
          this.usernameLabel = this.client.user.firstName.substring(0, 1) + this.client.user.lastName.substring(0, 1);
          if (this.client.photo) {
            this.singleImageView = environment.baseURL + '/file/getById?fileId=' + this.profileImage;
            this.displayAvatar = false;
          }
          else {
            this.displayAvatar = true;
          }
        } else {
        }
      },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');

      }
    );
  }

  getLogedInSubcontractorDetail(id) {
    this._subContractorProfileServices.getSubcontractorDetail(id).subscribe(
      (data) => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.subcontractor = data.data;
          this.profileImage = this.subcontractor.subcontractorProfile.photo;
          this.usernameLabel = this.subcontractor.subcontractorProfile.user.firstName.substring(0, 1) + this.subcontractor.subcontractorProfile.user.lastName.substring(0, 1)
          if (this.subcontractor.subcontractorProfile.photo) {
            this.singleImageView = environment.baseURL + '/file/getById?fileId=' + this.profileImage;
            this.displayAvatar = false;
          }
          else {
            this.displayAvatar = true;
          }
        } else {
        }
      },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      }
    );
  }


  getLogedInWorkerDetail(id) {
    this._workerProfileServices.getWorkerDetail(id).subscribe(
      (data) => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.workerDto = data.data;
          this.profileImage = this.workerDto.workerProfile.photo;
          this.usernameLabel = this.workerDto.workerProfile.user.firstName.substring(0, 1) + this.workerDto.workerProfile.user.lastName.substring(0, 1)
          if (this.workerDto.workerProfile.photo) {
            this.singleImageView = environment.baseURL + '/file/getById?fileId=' + this.profileImage;
            this.displayAvatar = false;
          }
          else {
            this.displayAvatar = true;
          }
        } else {
        }
      },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      }
    );
  }


  getWorkerCertificateList(user): void {
    let filterMap = new Map();
    filterMap.set('USER_ID', user.id);
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    let globalFilter = JSON.stringify(jsonObject);
    this.datatableParam = {
      offset: 0,
      size: 10000,
      sortField: '',
      sortOrder: 1,
      searchText: globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.workerCertificateService.getCertificateList(this.queryParam).subscribe(data => {
      this.certificateList = data.data.result;

      this.totalStatusCount = 0;
      this.certificateList.forEach(
        e => {
          if (e.status === 'PENDING') {
            this.totalStatusCount++;
          }
        }
      )
    });
  }
  selectCertificate(e): void {
    this.selectedCertificateList = [];
    if (e.checked && !this.isAllCertificateSelected) {
      this.selectedCertificateList.push(e.value);
    }
    else {
      const index = this.selectedCertificateList.findIndex(data => data.id === e.value.id);
      this.selectedCertificateList.splice(index, 1);
    }

  }
  selectAllCertificates(e): void {
    this.selectedCertificateList = [];

    const length = e.dt._value.length;
    if (e.checked) {
      this.isAllCertificateSelected = true;
      for (let i = 0; i < length; i++) {
        if (e.dt._value[i].status === 'PENDING') {
          this.selectedCertificateList.push(e.dt._value[i]);
        }
      }
    }
    else {
      this.isAllCertificateSelected = false;
      this.selectedCertificateList.splice(0, length);
    }

  }
  apply() {

    if (this.selectedCertificateList.length > 0) {
      if (this.approveOrReject) {
        if (this.approveOrReject.value === 'Reject') {
          this.rejectCertificates();
        }
        else {
          this.approveCertificates();
        }
      } else {
        this.notificationService.error('Select action of Status', '');
      }
    }
    else {
      this.notificationService.error(this.translator.instant('please.select.atleast.one.certificate.to.reject.or.approve'), '');
    }
  }
  approveCertificates(certificate?): void {
    let approveRejectDTO = new ApproveRejectCertificateDTO();
    this.selectedCertificateList = [];
    if (certificate) {
      this.selectedCertificateList.push(certificate);
      approveRejectDTO.workerCertificates = this.selectedCertificateList;
    }
    else {
      approveRejectDTO.workerCertificates = this.selectedCertificateList;
    }
    approveRejectDTO.loggedInAdmin = this.loggedInUser;
    this.workerCertificateService.approveCertificates(approveRejectDTO).subscribe(data => {

      if (data.statusCode === '200' || data.message === 'OK') {
        this.notificationService.success(this.translator.instant('selected.certificates.approved'), '');
        this.selectedCertificateList = [];
        this.approveOrReject = null;
        this.getWorkerCertificateList(this.localStorageService.getItem('workerUserForManageCertificates'));
      }
      else {
        this.notificationService.error(data.message, '');
      }
    });
  }
  rejectCertificates(certificate?): void {
    let approveRejectDTO = new ApproveRejectCertificateDTO();
    this.selectedCertificateList = [];
    if (certificate) {
      this.selectedCertificateList.push(certificate);
      approveRejectDTO.workerCertificates = this.selectedCertificateList;
    }
    else {
      approveRejectDTO.workerCertificates = this.selectedCertificateList;
    }
    approveRejectDTO.loggedInAdmin = this.loggedInUser;
    this.workerCertificateService.rejectCertificates(approveRejectDTO).subscribe(data => {

      if (data.statusCode === '200' || data.message === 'OK') {
        this.notificationService.success(this.translator.instant('selected.certificates.rejected'), '');
        this.selectedCertificateList = [];
        this.approveOrReject = null;
        this.getWorkerCertificateList(this.localStorageService.getItem('workerUserForManageCertificates'));
      }
      else {
        this.notificationService.error(data.message, '');
      }
    });
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


  onTermsOfUseClick() {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.TERMLY_TERMS_OF_USE);
  }

  onPrivacyPolicyClick() {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.TERMLY_PRIVACY_POLICY);
  }

  onCookiePolicyClick() {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.TERMLY_COOKIE_POLICY);
  }


}
