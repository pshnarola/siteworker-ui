import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver/dist/FileSaver';
import { FileDownloadService } from 'src/app/service/admin-services/fileDownload/file-download.service';
import { AwardJobsiteService } from 'src/app/service/client-services/award-jobsite/award-jobsite.service';
import { AwardProjectService } from 'src/app/service/client-services/award-project/award-project.service';
import { ProjectDetailService } from 'src/app/service/client-services/project-detail.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { JobsiteDetail } from '../Vos/jobsitemodel';
import { OfferJobSiteBidDetailDTO } from '../Vos/OfferJobSiteBidDetailDTO';
import { PODetail } from '../Vos/PODetail';


@Component({
  selector: 'app-award-jobsite',
  templateUrl: './award-jobsite.component.html',
  styleUrls: ['./award-jobsite.component.css']
})
export class AwardJobsiteComponent implements OnInit {

  awardJobsiteForm: FormGroup;
  files: File[] = [];
  submitted = false;

  showMore = false;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  truncateLength = COMMON_CONSTANTS.TRUNCATE_LENGTH;
  totalRecords;
  globalFilter;
  offset = 0;
  datatableParam: DataTableParam;
  queryParam: URLSearchParams;
  sortOrder = 0;
  sortField: any = 'created_date';

  columns = [
    { label: this.translator.instant('jobsite.title'), value: 'jobSiteDetail.title', sortable: true },
    { label: this.translator.instant('jobsite.desc'), value: 'jobSiteDetail.description', sortable: true },
    { label: this.translator.instant('bid.amount'), value: 'jobSiteDetail.cost', sortable: true },
    { label: this.translator.instant('city'), value: 'jobSiteDetail.city', sortable: true },
    { label: this.translator.instant('state'), value: 'jobSiteDetail.state', sortable: true },
    { label: this.translator.instant('zipcode'), value: 'jobSiteDetail.zipCode', sortable: true },
    { label: this.translator.instant('payment.milestone'), value: 'jobSiteDetail.paymentMileStone', sortable: true },
    { label: this.translator.instant('document'), value: 'jobSiteDetail.documents', sortable: false },
  ];
  jobsiteDetailToAward: any;
  projectDetail: any;
  subcontractorProfile: any;
  loggedInUserId: any;
  loginUser: any;
  fullDetail: any;
  jobsiteBidDetail: any;
  totalBidAmount;
  viewInfo = false;


  pODetail: PODetail;
  jobsiteDetail: JobsiteDetail;
  spinner: boolean;
  FileName: string;
  logoBody: any;
  logoData: string;
  disableForm = false;
  offerJobSiteBidDetailDTO: OfferJobSiteBidDetailDTO;
  pODetailDto: any;
  subcontractorDetail: any;

  paymentBidDetailList = [];



  constructor(
    private captionChangeService: HeaderManagementService,
    private translator: TranslateService,
    private _localStorageService: LocalStorageService,
    private notificationService: UINotificationService,
    private formBuilder: FormBuilder,
    private router: Router,
    private _projectDetailService: ProjectDetailService,
    private awardProjectService: AwardProjectService,
    private awardJobsiteService: AwardJobsiteService,
    private _fileService: FileDownloadService

  ) {
    this.loggedInUserId = this._localStorageService.getLoginUserId();
    this.loginUser = this._localStorageService.getLoginUserObject();
    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(true);
  }

  ngOnInit(): void {
    this.pODetailDto = new PODetail();
    this.pODetail = new PODetail();

    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.fullDetail = this._localStorageService.getItem('awardJobsite');
    this.jobsiteDetailToAward = this.fullDetail.fullDetail[0];
    this.jobsiteBidDetail = this.fullDetail.jobsiteBidDetail;
    this.projectDetail = this.fullDetail.fullDetail[0].jobsiteBidDetailDTO.projectDetail;
    this.subcontractorProfile = this.fullDetail.fullDetail[0].jobsiteBidDetailDTO.subContractorProfile;
    this.subcontractorDetail = this.fullDetail.fullDetail[0].jobsiteBidDetailDTO.subContractor;
    this.initializeForm();
    this.getPODetail();
    this.calculateTotalBidAmount(this.jobsiteBidDetail);
  }

  ngOnDestroy(): void {
    this.captionChangeService.hideSidebarSubject.next(false);
    this._localStorageService.removeItem('awardJobsite');
  }

  removeJobsite() {
    const jobsite = this._localStorageService.getItem('awardJobsite');

    const selectedSubcontractorDetail = this._localStorageService.getItem('selectedSubcontractorDetail');
    const selectedSubcontractor = this._localStorageService.getItem('selectedSubcontractorForJobsite');

    selectedSubcontractor.forEach(element => {
      if (element.jobsiteBidDetailDTO.subContractor.id === jobsite.subcontractorId) {
        const index = selectedSubcontractor.indexOf(element);
        if (index !== -1) {
          selectedSubcontractor.splice(index, 1);
        }

        selectedSubcontractorDetail.forEach((element1, index) => {
          if (element1.subcontractorId === element.jobsiteBidDetailDTO.subContractor.id) {
            selectedSubcontractorDetail.splice(index, 1);
          }
        });
        this._localStorageService.setItem('selectedSubcontractorDetail', selectedSubcontractorDetail);
        this._localStorageService.setItem('selectedSubcontractorForJobsite', selectedSubcontractor);
      }
    });
  }


  hideDialog() {
    this.viewInfo = false;
  }

  showDialog(jobsiteId) {
    this.viewInfo = true;
    this.getPaymentMileStoneList(jobsiteId);
  }

  onSelect(event) {
    this.files.splice(2, 0, ...event.addedFiles);
    if (this.files[5] != null) {
      this.onRemove(this.files[0]);
    }
    if (event.rejectedFiles.length > 0) {
      if (event.rejectedFiles[0].reason === 'size') {
        this.notificationService.error(this.translator.instant('max.file.size.10.mb'), '');
      } else {
        this.notificationService.error(this.translator.instant('image.pdf.upload'), '');
      }
      event.rejectedFiles = [];
    }
  }

  onRemove(event) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  onRemoveFromList(id) {
    const fileTemp: File[] = [];
    this.files.forEach((e, index) => {
      if (index !== id) {
        fileTemp.push(e);
      }
    });
    this.files.length = 0;
    this.files = fileTemp;
    this.notificationService.success(this.translator.instant('file.deleted'), '');
  }

  private initializeForm() {
    this.awardJobsiteForm = this.formBuilder.group({
      id: [null],
      createdBy: this.loggedInUserId,
      updatedBy: this.loggedInUserId,
      specialNotes: '',
      name: [null, CustomValidator.required],
      number: [null, CustomValidator.required],
      amount: [null, CustomValidator.required],
      attachmentName: [null],
      attachmentPath: [null],
    });
  }

  calculateTotalBidAmount(jobsiteBidDetail: any[]) {
    this.totalBidAmount = 0;
    jobsiteBidDetail.forEach(
      e => {
        this.totalBidAmount += e.subContractorCost;
      });
    return this.totalBidAmount;
  }

  cancel() {
    this.router.navigate([PATH_CONSTANTS.BID_COMPARISION]);
    this._localStorageService.removeItem('awardJobsite');
  }

  downloadAttachments(id) {
    this._projectDetailService.downloadJobsiteAttachments(id).subscribe(
      data => {
        const blob = new Blob([data], { type: 'application/zip' });
        const fileName = 'jobsite-attachments.zip';
        saveAs(blob, fileName);
      },
      (error) => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      });
  }

  getPODetail() {
    this.awardProjectService.getPoDetailToAward(this.projectDetail.id).subscribe(
      data => {
        if (data.statusCode === '200') {
          this.pODetailDto = data.data;
          this.disableForm = true;
          this.patchPODetail(this.pODetailDto);
        } else {
          if (data.message !== 'No data found.') {
            this.disableForm = false;
            this.notificationService.error(data.message, '');
          }
          this.disableForm = false;
        }
      }
    );
  }

  uploadFile() {
    this.spinner = true;
    if (this.files.length != 0) {
      if (this.files.length < 2) {
        this.files.forEach(element => {
          const uploadFileData = new FormData();
          uploadFileData.append('file', element);
          this._fileService.uploadFile(uploadFileData).subscribe(
            event => {
              this.FileName = element.name;
              if (event instanceof HttpResponse) {
                this.logoBody = event.body;
                this.logoData = this.logoBody.data;
                this.addPoDetailToAward();
              }
            },
            (error) => {
              this.notificationService.error(this.translator.instant('common.error'), '');
              this.spinner = false;
            });
        });
      } else {
        this.notificationService.error(this.translator.instant('single.document.required'), '');
      }
    }
    else {
      this.addPoDetailToAward();
    }
  }

  patchPODetail(poDetail: PODetail) {
    this.awardJobsiteForm.patchValue({
      id: poDetail.id,
      createdBy: poDetail.createdBy,
      updatedBy: poDetail.updatedBy,
      specialNotes: '',
      name: poDetail.name,
      number: poDetail.number,
      amount: poDetail.amount,
      attachmentName: poDetail.attachmentName,
      attachmentPath: poDetail.attachmentPath,
    });
  }

  addPoDetailToAward() {

    if (!this.disableForm) {
      this.submitted = true;
      if (!this.awardJobsiteForm.valid) {
        CustomValidator.markFormGroupTouched(this.awardJobsiteForm);
        this.submitted = true;
        this.spinner = false;
        return false;
      }

      this.pODetail = new PODetail();

      this.pODetail.name = this.awardJobsiteForm.value.name;
      this.pODetail.number = this.awardJobsiteForm.value.number;
      this.pODetail.amount = this.awardJobsiteForm.value.amount;
      this.pODetail.attachmentName = this.FileName;
      this.pODetail.attachmentPath = this.logoData;
      this.pODetail.project = this.projectDetail;

      this.awardProjectService.addPoDetailToAward(this.pODetail).subscribe(
        data => {
          if (data.statusCode === '200') {
            this.notificationService.success(this.translator.instant('po.added'), '');
            this.getPODetail();
            this.offerShortListedJobsite();
            this.files = [];
            this.submitted = false;
          } else {
            this.notificationService.error(data.message, '');
            this.submitted = false;
          }
        });
    } else {
      this.offerShortListedJobsite();
    }

  }

  offerShortListedJobsite() {

    this.offerJobSiteBidDetailDTO = new OfferJobSiteBidDetailDTO();
    if (this.awardJobsiteForm.value.specialNotes) {
      this.offerJobSiteBidDetailDTO.specialNotes = this.awardJobsiteForm.value.specialNotes;
    }
    this.offerJobSiteBidDetailDTO.selectedJobSites = this.jobsiteBidDetail;

    this.awardJobsiteService.offerShortListedJobsite(this.offerJobSiteBidDetailDTO).subscribe(
      data => {
        if (data.statusCode === '200') {
          this.notificationService.success(this.translator.instant('josite.awarded'), '');
          this.removeJobsite();
          this.router.navigate([PATH_CONSTANTS.BID_COMPARISION]);
          this._localStorageService.removeItem('awardJobsite');
        } else {
          this.notificationService.error(data.message, '');
        }
      });
  }

  private prepareQueryParam(paramObject): URLSearchParams {
    const params = new URLSearchParams();
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  getPaymentMileStoneList(jobSiteId) {
    this.paymentBidDetailList = [];
    const filterMap = new Map();
    filterMap.set('JOBSITE_ID', jobSiteId);
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParam = {
      offset: this.offset,
      size: 10000,
      sortField: 'CREATED_DATE',
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.awardProjectService.getPaymentMileStoneList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          this.paymentBidDetailList = data.data.result;
        } else {
          this.notificationService.error(data.message, '');
        }
      });
  }

}
