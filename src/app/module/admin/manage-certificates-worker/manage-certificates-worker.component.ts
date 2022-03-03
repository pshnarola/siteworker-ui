import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { WorkerCertificateService } from 'src/app/service/worker-services/workerCertificate/worker-certificate.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { ApproveRejectCertificateDTO } from '../vos/ApproveRejectCertificateDTO';

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
    { label: this.translator.instant('certificate'), value: 'certificate.name', sortable: true, isHidden: false },
    { label: this.translator.instant('certificate.date'), value: 'certificationDate', sortable: true, isHidden: false },
    { label: this.translator.instant('expiry.date'), value: 'expiryDate', sortable: true, isHidden: false },
    { label: this.translator.instant('uploaded.date'), value: 'createdDate', sortable: true, isHidden: false },
    { label: this.translator.instant('verified.date.or.rejected.date'), value: 'approvedDate', sortable: true, isHidden: false },
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
    private notificationService: UINotificationService,
    private workerCertificateService: WorkerCertificateService,
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

  }

  ngOnInit(): void {
    this.getWorkerCertificateList(this.localStorageService.getItem('workerUserForManageCertificates'));
    let worker = this.localStorageService.getItem('workerUserForManageCertificates');
    this.workerName = worker.firstName + ' ' + worker.lastName;
    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(true);
  }

  ngOnDestroy(): void {
    this.captionChangeService.hideSidebarSubject.next(false);
    this.localStorageService.removeItem('workerUserForManageCertificates');
  }

  save(): void {

  }

  back(): void {
    this.router.navigate(['/admin/worker'])
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
}
