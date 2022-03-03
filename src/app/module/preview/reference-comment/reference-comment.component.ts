import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ManageReferencesService } from 'src/app/service/admin-services/manage-references.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { SubContractorReferenceDTO } from '../../admin/vos/SubContractorReferenceDTO';
import { WorkerReferenceDTO } from '../../admin/vos/WorkerReferenceDTO';

@Component({
  selector: 'app-reference-comment',
  templateUrl: './reference-comment.component.html',
  styleUrls: ['./reference-comment.component.css']
})
export class ReferenceCommentComponent implements OnInit {
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  id: string;
  type: string;
  commentsForm: FormGroup;
  submitted = false;

  constructor(
    private route: ActivatedRoute, private formBuilder: FormBuilder,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private manageReferenceService: ManageReferencesService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.id = params['id'];
      this.type = params['type'];
    });


    this.getReferenceDetail();
  }

  initializeForm(data) {

    this.commentsForm = this.formBuilder.group({
      createdBy: data.createdBy,
      createdDate: data.createdDate,
      updatedBy: data.updatedBy,
      updatedDate: data.updatedDate,
      status: data.status,
      user: data.user,
      companyName: [data.companyName, [Validators.maxLength(50)]],
      fullName: [data.fullName, [CustomValidator.required, Validators.maxLength(50)]],
      jobTitle: [data.jobTitle, [CustomValidator.required, Validators.maxLength(50)]],
      email: [data.email, [CustomValidator.required, CustomValidator.emailValidator, Validators.maxLength(50)]],
      workPhone: [data.workPhone, [CustomValidator.required]],
      mobilePhone: [data.mobilePhone],
      comments: ['', Validators.required]
    });
  }

  submit() {

    this.submitted = true;
    if (!this.commentsForm.valid) {
      CustomValidator.markFormGroupTouched(this.commentsForm);
      this.submitted = false;
      return false;
    }
    else {
      if (this.type === 'SUBCONTRACTOR') {
        let subcontractorReferenceDTO = new SubContractorReferenceDTO();
        subcontractorReferenceDTO.id = this.id;

        subcontractorReferenceDTO.createdBy = this.commentsForm.value.createdBy;
        subcontractorReferenceDTO.createdDate = this.commentsForm.value.createdDate;
        subcontractorReferenceDTO.updatedBy = this.commentsForm.value.updatedBy;
        subcontractorReferenceDTO.updatedDate = this.commentsForm.value.updatedDate;
        subcontractorReferenceDTO.status = this.commentsForm.value.status;
        subcontractorReferenceDTO.user = this.commentsForm.value.user;

        subcontractorReferenceDTO.comment = this.commentsForm.value.comments;
        subcontractorReferenceDTO.companyName = this.commentsForm.value.companyName;
        subcontractorReferenceDTO.fullName = this.commentsForm.value.fullName;
        subcontractorReferenceDTO.jobTitle = this.commentsForm.value.jobTitle;
        subcontractorReferenceDTO.email = this.commentsForm.value.email;
        subcontractorReferenceDTO.workPhone = this.commentsForm.value.workPhone;
        subcontractorReferenceDTO.mobilePhone = this.commentsForm.value.mobilePhone;


        this.manageReferenceService.updateCommentOfSubcontractor(subcontractorReferenceDTO).subscribe(data => {

          if (data.statusCode === '200' && data.message === 'OK') {
            this.notificationService.success('Comment added successfully', '');
            this.submitted = false;
          }
          else {
            this.notificationService.error(data.message, '');
            this.submitted = false;
          }
        },
          error => {
            this.notificationService.error(this.translator.instant('common.error'), '');
            this.submitted = false;
          });
      }

      if (this.type === 'WORKER') {
        let workerReferenceDTO = new WorkerReferenceDTO();
        workerReferenceDTO.id = this.id;

        workerReferenceDTO.createdBy = this.commentsForm.value.createdBy;
        workerReferenceDTO.createdDate = this.commentsForm.value.createdDate;
        workerReferenceDTO.updatedBy = this.commentsForm.value.updatedBy;
        workerReferenceDTO.updatedDate = this.commentsForm.value.updatedDate;
        workerReferenceDTO.status = this.commentsForm.value.status;
        workerReferenceDTO.user = this.commentsForm.value.user;

        workerReferenceDTO.comment = this.commentsForm.value.comments;
        workerReferenceDTO.companyName = this.commentsForm.value.companyName;
        workerReferenceDTO.fullName = this.commentsForm.value.fullName;
        workerReferenceDTO.jobTitle = this.commentsForm.value.jobTitle;
        workerReferenceDTO.email = this.commentsForm.value.email;
        workerReferenceDTO.workPhone = this.commentsForm.value.workPhone;
        workerReferenceDTO.mobilePhone = this.commentsForm.value.mobilePhone;
        workerReferenceDTO.comment = this.commentsForm.value.comments;


        this.manageReferenceService.updateCommentOfWorker(workerReferenceDTO).subscribe(data => {

          if (data.statusCode === '200' && data.message === 'OK') {
            this.notificationService.success('Comment added successfully', '');
            this.submitted = false;
          }
          else {
            this.notificationService.error(data.message, '');
            this.submitted = false;
          }
        },
          error => {
            this.notificationService.error(this.translator.instant('common.error'), '');
            this.submitted = false;
          });
      }
    }
  }


  getReferenceDetail() {
    if (this.type === 'SUBCONTRACTOR') {
      this.manageReferenceService.getSubcontractorReferenceDetailById(this.id).subscribe(data => {

        if (data.statusCode === '200' && data.message === 'OK') {
          this.initializeForm(data.data);
        }
      });
    }

    if (this.type === 'WORKER') {
      this.manageReferenceService.getWorkerReferenceDetailById(this.id).subscribe(data => {

        if (data.statusCode === '200' && data.message === 'OK') {
          this.initializeForm(data.data);
        }
      });
    }

  }

}
