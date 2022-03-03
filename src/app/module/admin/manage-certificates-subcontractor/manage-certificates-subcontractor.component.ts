import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver/dist/FileSaver';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { LicenseService } from 'src/app/service/subcontractor-services/active-license/license.service';
import { CoiService } from 'src/app/service/subcontractor-services/coi/coi.service';
import { EmrService } from 'src/app/service/subcontractor-services/emr/emr.service';
import { OshaService } from 'src/app/service/subcontractor-services/osha/osha.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { ApproveRejectCertificateDTO } from '../vos/ApproveRejectCertificateDTO';
@Component({
  selector: 'app-manage-certificates-subcontractor',
  templateUrl: './manage-certificates-subcontractor.component.html',
  styleUrls: ['./manage-certificates-subcontractor.component.css']
})
export class ManageCertificatesSubcontractorComponent implements OnInit, OnDestroy {

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

  header: string;

  certificateList: any[];
  EMRList: any[];
  OSHAList: any[];
  COIList: any[];
  LicenseList: any[];

  selectedCertificates: any[];
  selectedEMR: any[];
  selectedOSHA: any[];
  selectedCOI: any[];
  selectedLicense: any[];

  selectedActionOfEMR: any;
  selectedActionOfOSHA: any;
  selectedActionOfCOI: any;
  selectedActionOfLicense: any;

  typesOfInsurance = [
    { insurance: 'General Liability', minimumLimits: '1 million', isLimitMeets: '' },
    { insurance: 'Automobile Liability', minimumLimits: '1 million', isLimitMeets: '' },
    { insurance: 'Worker Compenstion Liability', minimumLimits: '1 million', isLimitMeets: '' },

  ]

  actionTypes = [
    { name: 'APPROVE', value: 'Approve' },
    { name: 'REJECT', value: 'Reject' }
  ];

  EMRColumns = [
    { label: this.translator.instant('year'), value: 'year', sortable: true, isHidden: false },
    { label: this.translator.instant('document'), value: 'documentName', sortable: true, isHidden: false },
    { label: this.translator.instant('uploaded.date'), value: 'createdDate', sortable: true, isHidden: false },
    { label: this.translator.instant('verifed.rejected.date'), value: 'approvedDate', sortable: true, isHidden: false },
    { label: this.translator.instant('status'), value: 'status', sortable: true, isHidden: false },
  ];

  OSHAColumns = [
    { label: this.translator.instant('year'), value: 'year', sortable: true, isHidden: false },
    // tslint:disable-next-line: max-line-length
    { label: this.translator.instant('document') + '/' + this.translator.instant('opt.out.reason'), value: 'reference', sortable: true, isHidden: false },
    { label: this.translator.instant('uploaded.date'), value: 'createdDate', sortable: true, isHidden: false },
    { label: this.translator.instant('verifed.rejected.date'), value: 'approvedDate', sortable: true, isHidden: false },
    { label: this.translator.instant('status'), value: 'status', sortable: true, isHidden: false },
  ];

  COIDocumentsColumns = [
    { label: this.translator.instant('excess.liability'), value: 'umbrellaLiability', sortable: true, isHidden: false },
    { label: this.translator.instant('coi.document'), value: 'reference', sortable: true, isHidden: false },
    { label: this.translator.instant('uploaded.date'), value: 'createdDate', sortable: true, isHidden: false },
    { label: this.translator.instant('verifed.rejected.date'), value: 'postedOn', sortable: true, isHidden: false },
    { label: this.translator.instant('status'), value: 'status', sortable: true, isHidden: false },
  ];

  COIColumns = [
    { label: this.translator.instant('type.of.insurance'), value: 'name', sortable: true, isHidden: false },
    { label: this.translator.instant('minimum.limits.required'), value: 'reference', sortable: true, isHidden: false },
    { label: this.translator.instant('yes.no'), value: 'postedOn', sortable: true, isHidden: false },
  ];

  LicenseColumns = [
    { label: this.translator.instant('license.name'), value: 'name', sortable: true, isHidden: false },
    { label: this.translator.instant('license.number'), value: 'number', sortable: true, isHidden: false },
    { label: this.translator.instant('state'), value: 'state', sortable: true, isHidden: false },
    { label: this.translator.instant('expiration.date'), value: 'expiryDate', sortable: true, isHidden: false },
    { label: this.translator.instant('view.documents'), value: 'postedOn', sortable: false, isHidden: false },
    { label: this.translator.instant('uploaded.date'), value: 'createdDate', sortable: true, isHidden: false },
  ];
  queryParam: any;
  EMRcertificateList = [];
  totalStatusCount = 0;
  selectedEMRCertificateList: any[] = [];
  isAllEMRCertificateSelected = false;
  approveOrReject: any;
  OSHAcertificateList = [];
  COIcertificateList = [];
  totalStatusCountOSHA = 0;
  totalStatusCountCOI = 0;
  selectedOSHACertificateList: any[] = [];
  isAllOSHACertificateSelected = false
  selectedCOICertificateList: any[] = [];
  isAllCOICertificateSelected: any;
  subcontractor: any;
  loggedInUser: any;
  constructor(
    private translator: TranslateService,
    private localStorageService: LocalStorageService,
    private captionChangeService: HeaderManagementService,
    private notificationService: UINotificationService,
    private COIService: CoiService,
    private EMRService: EmrService,
    private OSHAService: OshaService,
    private licenseService: LicenseService,
    private router: Router
  ) {
    this.header = 'please select certificate';
    this.certificateList = [];
    this.EMRList = [];
    this.OSHAList = [];
    this.COIList = [];
    this.LicenseList = [];
    this.selectedCertificates = [];
    this.selectedEMR = [];
    this.selectedOSHA = [];
    this.selectedCOI = [];
    this.selectedLicense = [];
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
    this.subcontractor = this.localStorageService.getItem('subcontractorUserForManageCertificates');
    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.showEMR();
  }

  ngOnDestroy(): void {
    this.captionChangeService.hideSidebarSubject.next(false);
    this.localStorageService.removeItem('subcontractorUserForManageCertificates');
  }

  save(): void {

  }

  back(): void {
    this.router.navigate(['/admin/subcontractor']);
  }

  showEMR(): void {
    this.header = 'EMR';
    let user = this.localStorageService.getItem('subcontractorUserForManageCertificates');
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
    this.EMRService.getEmrList(this.queryParam).subscribe(data => {
      this.EMRcertificateList = data.data.result;
      this.totalStatusCount = 0;

      this.EMRcertificateList.forEach(
        e => {
          if (e.status === 'UNDER_REVIEW') {
            this.totalStatusCount++;
          }
        }
      );
    });
  }

  showOSHA(): void {
    this.header = 'OSHA';
    let user = this.localStorageService.getItem('subcontractorUserForManageCertificates');
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
    this.OSHAService.getOshaList(this.queryParam).subscribe(data => {
      this.OSHAcertificateList = data.data.result;

      this.totalStatusCountOSHA = 0;
      this.OSHAcertificateList.forEach(
        e => {
          if (e.status === 'UNDER_REVIEW') {
            this.totalStatusCountOSHA++;
          }
        }
      );
    });
  }

  showCOI(): void {
    this.header = 'COI';
    let user = this.localStorageService.getItem('subcontractorUserForManageCertificates');
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
    this.COIService.getCOIList(this.queryParam).subscribe(data => {
      this.COIcertificateList = data.data.result;

      this.totalStatusCountCOI = 0;
      this.COIcertificateList.forEach(
        e => {
          if (e.status === 'UNDER_REVIEW') {
            this.totalStatusCountCOI++;
          }
          this.typesOfInsurance = [
            { insurance: 'General Liability', minimumLimits: '1 million', isLimitMeets: e.isGeneralLimitMeets ? 'Yes' : 'No' },
            { insurance: 'Automobile Liability', minimumLimits: '1 million', isLimitMeets: e.isAutoMobileLimitMeets ? 'Yes' : 'No' },
            { insurance: 'Worker Compenstion Liability', minimumLimits: '1 million', isLimitMeets: e.isWorkerLimitMeets ? 'Yes' : 'No' },

          ]
        }
      );
    });
  }

  showLicense(): void {
    this.header = 'License';
    let user = this.localStorageService.getItem('subcontractorUserForManageCertificates');
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
    this.licenseService.getLIcenseList(this.queryParam).subscribe(data => {
      this.LicenseList = data.data.result;

    });
  }

  onChangeStatusOfselected(): void {

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
  selectEMRCertificate(e): void {
    this.selectedEMRCertificateList = [];
    if (e.checked && !this.isAllEMRCertificateSelected) {
      this.selectedEMRCertificateList.push(e.value);
    }
    else {
      const index = this.selectedEMRCertificateList.findIndex(data => data.id === e.value.id);
      this.selectedEMRCertificateList.splice(index, 1);
    }

  }
  selectAllEMRCertificates(e): void {
    this.selectedEMRCertificateList = [];

    const length = e.dt._value.length;
    if (e.checked) {
      this.isAllEMRCertificateSelected = true;
      for (let i = 0; i < length; i++) {
        if (e.dt._value[i].status === 'UNDER_REVIEW') {
          this.selectedEMRCertificateList.push(e.dt._value[i]);
        }
      }
    }
    else {
      this.isAllEMRCertificateSelected = false;
      this.selectedEMRCertificateList.splice(0, length);
    }

  }

  apply() {

    if (this.selectedEMRCertificateList.length > 0) {
      if (this.selectedActionOfEMR) {
        if (this.selectedActionOfEMR.value === 'Reject') {
          this.rejectEMR();
        }
        else {
          this.approveEMR();
        }
      } else {
        this.notificationService.error('Select action of Status', '');
      }
    }
    else {
      this.notificationService.error(this.translator.instant('please.select.atleast.one.certificate.to.reject.or.approve'), '');
    }
  }
  approveEMR(certificate?): void {
    let approveRejectDTO = new ApproveRejectCertificateDTO();
    // this.selectedEMRCertificateList = [];
    if (certificate) {
      this.selectedEMRCertificateList.push(certificate);
      approveRejectDTO.subContractorEMRs = this.selectedEMRCertificateList;
    }
    else {
      approveRejectDTO.subContractorEMRs = this.selectedEMRCertificateList;
    }
    approveRejectDTO.loggedInAdmin = this.loggedInUser;
    this.EMRService.approveEmr(approveRejectDTO).subscribe(data => {

      if (data.statusCode === '200' || data.message === 'OK') {
        this.notificationService.success(this.translator.instant('selected.certificates.approved'), '');
        this.selectedEMRCertificateList = [];
        this.totalStatusCount = 0;
        this.selectedActionOfEMR = null;
        this.showEMR();
      }
      else {
        this.notificationService.error(data.message, '');
      }
    });
  }
  rejectEMR(certificate?): void {
    let approveRejectDTO = new ApproveRejectCertificateDTO();
    // this.selectedEMRCertificateList = [];
    if (certificate) {
      this.selectedEMRCertificateList.push(certificate);
      approveRejectDTO.subContractorEMRs = this.selectedEMRCertificateList;
    }
    else {
      approveRejectDTO.subContractorEMRs = this.selectedEMRCertificateList;
    }
    approveRejectDTO.loggedInAdmin = this.loggedInUser;
    this.EMRService.rejectEmr(approveRejectDTO).subscribe(data => {

      if (data.statusCode === '200' || data.message === 'OK') {
        this.notificationService.success(this.translator.instant('selected.certificates.rejected'), '');
        this.selectedEMRCertificateList = [];
        this.selectedActionOfEMR = null;
        this.showEMR();
      }
      else {
        this.notificationService.error(data.message, '');
      }
    });
  }

  clearEmr(emr) {

    let loggedInUserId = this.localStorageService.getLoginUserId();

    this.EMRService.clearEmr(emr.id, loggedInUserId).subscribe(data => {

      if (data.statusCode === '200' || data.message === 'OK') {
        this.notificationService.success(this.translator.instant('certificates.unverified'), '');
        this.selectedEMRCertificateList = [];
        this.showEMR();
      }
      else {
        this.notificationService.error(data.message, '');
      }
    });
  }

  clearOsha(Osha) {

    let loggedInUserId = this.localStorageService.getLoginUserId();

    this.OSHAService.clearOsha(Osha.id, loggedInUserId).subscribe(data => {

      if (data.statusCode === '200' || data.message === 'OK') {
        this.notificationService.success(this.translator.instant('certificates.unverified'), '');
        this.showOSHA();
      }
      else {
        this.notificationService.error(data.message, '');
      }
    });
  }

  clearCoi(coi) {

    let loggedInUserId = this.localStorageService.getLoginUserId();

    this.COIService.clearCoi(coi.id, loggedInUserId).subscribe(data => {

      if (data.statusCode === '200' || data.message === 'OK') {
        this.notificationService.success(this.translator.instant('certificates.unverified'), '');
        this.showCOI();
      }
      else {
        this.notificationService.error(data.message, '');
      }
    });
  }



  selectOSHACertificate(e): void {
    this.selectedOSHACertificateList = [];
    if (e.checked && !this.isAllOSHACertificateSelected) {
      this.selectedOSHACertificateList.push(e.value);
    }
    else {
      const index = this.selectedOSHACertificateList.findIndex(data => data.id === e.value.id);
      this.selectedOSHACertificateList.splice(index, 1);
    }

  }
  selectAllOSHACertificates(e): void {
    this.selectedOSHACertificateList = [];

    const length = e.dt._value.length;
    if (e.checked) {
      this.isAllOSHACertificateSelected = true;
      for (let i = 0; i < length; i++) {
        if (e.dt._value[i].status === 'UNDER_REVIEW') {
          this.selectedOSHACertificateList.push(e.dt._value[i]);
        }
      }
    }
    else {
      this.isAllOSHACertificateSelected = false;
      this.selectedOSHACertificateList.splice(0, length);
    }

  }

  applyOSHA() {

    if (this.selectedOSHACertificateList.length > 0) {
      if (this.selectedActionOfOSHA) {
        if (this.selectedActionOfOSHA.value === 'Reject') {
          this.rejectOSHA();
        }
        else {
          this.approveOSHA();
        }
      } else {
        this.notificationService.error('Select action of Status', '');
      }
    }
    else {
      this.notificationService.error(this.translator.instant('please.select.atleast.one.certificate.to.reject.or.approve'), '');
    }
  }
  approveOSHA(certificate?): void {
    // this.selectedOSHACertificateList = [];
    let approveRejectDTO = new ApproveRejectCertificateDTO();
    if (certificate) {
      this.selectedOSHACertificateList.push(certificate);
      approveRejectDTO.subContractorOSHAs = this.selectedOSHACertificateList;
    }
    else {
      approveRejectDTO.subContractorOSHAs = this.selectedOSHACertificateList;
    }
    approveRejectDTO.loggedInAdmin = this.loggedInUser;
    this.OSHAService.approveOsha(approveRejectDTO).subscribe(data => {

      if (data.statusCode === '200' || data.message === 'OK') {
        this.notificationService.success(this.translator.instant('selected.certificates.approved'), '');
        this.selectedOSHACertificateList = [];
        this.selectedActionOfOSHA = null;
        this.showOSHA();
      }
      else {
        this.notificationService.error(data.message, '');
      }
    });
  }
  rejectOSHA(certificate?): void {
    // this.selectedOSHACertificateList = [];
    let approveRejectDTO = new ApproveRejectCertificateDTO();
    if (certificate) {

      this.selectedOSHACertificateList.push(certificate);
      approveRejectDTO.subContractorOSHAs = this.selectedOSHACertificateList;
    }
    else {
      approveRejectDTO.subContractorOSHAs = this.selectedOSHACertificateList;
    }
    approveRejectDTO.loggedInAdmin = this.loggedInUser;
    this.OSHAService.rejectOsha(approveRejectDTO).subscribe(data => {

      if (data.statusCode === '200' || data.message === 'OK') {
        this.notificationService.success(this.translator.instant('selected.certificates.rejected'), '');
        this.selectedOSHACertificateList = [];
        this.selectedActionOfOSHA = null;
        this.showOSHA();
      }
      else {
        this.notificationService.error(data.message, '');
      }
    });
  }
  downloadFile(id) {
    this.licenseService.downloadFile(id).subscribe(
      data => {
        const blob = new Blob([data], { type: 'application/zip' });
        const fileName = 'License';
        saveAs(blob, fileName);
        this.showLicense();


      },
      (error) => {
        this.notificationService.error(this.translator.instant('common.error'), '');

      }
    );
  }
  selectCOICertificate(e): void {
    this.selectedCOICertificateList = [];
    if (e.checked && !this.isAllCOICertificateSelected) {
      this.selectedCOICertificateList.push(e.value);
    }
    else {
      const index = this.selectedCOICertificateList.findIndex(data => data.id === e.value.id);
      this.selectedCOICertificateList.splice(index, 1);
    }

  }
  selectAllCOICertificates(e): void {
    this.selectedCOICertificateList = [];

    const length = e.dt._value.length;
    if (e.checked) {
      this.isAllCOICertificateSelected = true;
      for (let i = 0; i < length; i++) {
        if (e.dt._value[i].status === 'UNDER_REVIEW') {
          this.selectedCOICertificateList.push(e.dt._value[i]);
        }
      }
    }
    else {
      this.isAllCOICertificateSelected = false;
      this.selectedCOICertificateList.splice(0, length);
    }

  }

  applyCOI() {

    if (this.selectedCOICertificateList.length > 0) {
      if (this.selectedActionOfCOI) {

        if (this.selectedActionOfCOI.value === 'Reject') {
          this.rejectCOI();
        }
        else {
          this.approveCOI();
        }
      } else {
        this.notificationService.error('Select action of Status', '');
      }
    }
    else {
      this.notificationService.error(this.translator.instant('please.select.atleast.one.certificate.to.reject.or.approve'), '');
    }
  }
  approveCOI(certificate?): void {
    // this.selectedCOICertificateList = [];
    let approveRejectDTO = new ApproveRejectCertificateDTO();
    if (certificate) {
      this.selectedCOICertificateList.push(certificate);
      approveRejectDTO.subContractorCOIs = this.selectedCOICertificateList;
    }
    else {
      approveRejectDTO.subContractorCOIs = this.selectedCOICertificateList;
    }
    approveRejectDTO.loggedInAdmin = this.loggedInUser;
    this.COIService.approveCoi(approveRejectDTO).subscribe(data => {

      if (data.statusCode === '200' || data.message === 'OK') {
        this.notificationService.success(this.translator.instant('selected.certificates.approved'), '');
        this.selectedCOICertificateList = [];
        this.selectedActionOfCOI = null;
        this.showCOI();
      }
      else {
        this.notificationService.error(data.message, '');
      }
    });
  }
  rejectCOI(certificate?): void {
    // this.selectedCOICertificateList = [];
    let approveRejectDTO = new ApproveRejectCertificateDTO();
    if (certificate) {
      this.selectedCOICertificateList.push(certificate);
      approveRejectDTO.subContractorCOIs = this.selectedCOICertificateList;
    }
    else {
      approveRejectDTO.subContractorCOIs = this.selectedCOICertificateList;
    }
    approveRejectDTO.loggedInAdmin = this.loggedInUser;
    this.COIService.rejectCoi(approveRejectDTO).subscribe(data => {

      if (data.statusCode === '200' || data.message === 'OK') {
        this.notificationService.success(this.translator.instant('selected.certificates.rejected'), '');
        this.selectedCOICertificateList = [];
        this.selectedActionOfCOI = null;
        this.showCOI();
      }
      else {
        this.notificationService.error(data.message, '');
      }
    });
  }
}
