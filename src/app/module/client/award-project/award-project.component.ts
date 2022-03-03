import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FileDownloadService } from 'src/app/service/admin-services/fileDownload/file-download.service';
import { AwardProjectService } from 'src/app/service/client-services/award-project/award-project.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { ProjectBidDetail } from '../../subcontractor/vos/ProjectBidDetail';
import { AwardProject } from '../Vos/awardProject';
import { PODetail } from '../Vos/PODetail';

@Component({
  selector: 'app-award-project',
  templateUrl: './award-project.component.html',
  styleUrls: ['./award-project.component.css']
})
export class AwardProjectComponent implements OnInit {
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  awardProjectForm: FormGroup;
  files: File[] = [];
  awardProjectDto: AwardProject;
  loggedInUserId: any;
  loginUser: any;
  projectDetailToAward;
  totalJobsite = 0;
  allowedToAward = false;
  submitted: boolean;

  pODetail: PODetail;
  projectBidDetail: ProjectBidDetail;
  spinner: boolean;
  FileName: string;
  logoBody: any;
  logoData: string;
  disableForm = false;
  subcontractorProfile: any;


  constructor(
    private captionChangeService: HeaderManagementService,
    private translator: TranslateService,
    private _localStorageService: LocalStorageService,
    private notificationService: UINotificationService,
    private formBuilder: FormBuilder,
    private router: Router,
    private awardProjectService: AwardProjectService,
    private _fileService: FileDownloadService
  ) {
    this.loggedInUserId = this._localStorageService.getLoginUserId();
    this.loginUser = this._localStorageService.getLoginUserObject();
    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(true);
  }

  ngOnInit(): void {
    this.pODetail = new PODetail();
    this.projectDetailToAward = this._localStorageService.getItem('awardProject');
    this.subcontractorProfile = this.projectDetailToAward.projectBidDetailDTO.subContractorProfile;
    this.isAllowToOfferProject();
    this.initializeForm();
    this.getPODetail();
    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(true);
  }

  ngOnDestroy(): void {
    this._localStorageService.removeItem('awardProject');
    this.captionChangeService.hideSidebarSubject.next(false);
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
    this.awardProjectForm = this.formBuilder.group({
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

  cancel() {
    this.router.navigate([PATH_CONSTANTS.BID_COMPARISION]);
    this._localStorageService.removeItem('awardProject');
  }

  isAllowToOfferProject() {
    this.awardProjectService.checkProjectIsAllowToAward(this.projectDetailToAward.projectBidDetailDTO.projectDetail.id).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.data) {
            this.allowedToAward = data.data;
          } else {
            this.allowedToAward = data.data;
          }
        }
      }
    );

  }

  getPODetail() {
    this.awardProjectService.getPoDetailToAward(this.projectDetailToAward.projectBidDetailDTO.projectDetail.id).subscribe(
      data => {
        if (data.statusCode === '200') {
          this.pODetail = data.data;
          this.disableForm = true;
          this.patchPODetail(this.pODetail);
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

    this.awardProjectForm.patchValue({
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

      if (!this.awardProjectForm.valid) {
        CustomValidator.markFormGroupTouched(this.awardProjectForm);
        this.submitted = true;
        this.spinner = false;
        return false;
      }

      this.pODetail = new PODetail();

      this.pODetail.name = this.awardProjectForm.value.name;
      this.pODetail.number = this.awardProjectForm.value.number;
      this.pODetail.amount = this.awardProjectForm.value.amount;
      this.pODetail.attachmentName = this.FileName;
      this.pODetail.attachmentPath = this.logoData;
      this.pODetail.project = this.projectDetailToAward.projectBidDetailDTO.projectDetail;

      this.awardProjectService.addPoDetailToAward(this.pODetail).subscribe(
        data => {
          if (data.statusCode === '200') {
            this.notificationService.success(this.translator.instant('po.added'), '');
            this.getPODetail();
            this.offerProject();
            this.files = [];
            this.submitted = false;
          } else {
            this.notificationService.error(data.message, '');
            this.submitted = false;
          }
        });
    } else {
      this.offerProject();
    }


  }

  offerProject() {

    this.projectBidDetail = new ProjectBidDetail();

    this.projectBidDetail = this.projectDetailToAward.projectBidDetailDTO;
    this.projectBidDetail.clientSpecialNotes = this.awardProjectForm.value.specialNotes;

    this.awardProjectService.offerProject(this.projectBidDetail).subscribe(
      data => {
        if (data.statusCode === '200') {
          this.notificationService.success(this.translator.instant('project.awarded'), '');
          this._localStorageService.removeItem('selectedSubcontractorForProject');
          this.router.navigate([PATH_CONSTANTS.BID_COMPARISION]);
          this._localStorageService.removeItem('awardProject');
        } else {
          this.notificationService.error(data.message, '');
        }
      });
  }

  redirectToJobsiteList(previewJobsiteList) {
    this._localStorageService.setItem('previewJobsiteList', previewJobsiteList);
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_JOBSITE_LIST);
  }

}
