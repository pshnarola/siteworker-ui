import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { JobsiteService } from 'src/app/service/client-services/post-project/jobsite.service';
import { PostProjectService } from 'src/app/service/client-services/post-project/post-project.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { JobsiteStatus } from '../../enums/jobsiteStatus';
import { AddNewProjectComponent } from '../add-new-project/add-new-project.component';
import { JobsitesComponent } from '../jobsites/jobsites.component';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent implements OnInit {

  reviewForm = true;
  reviewFormGroup: FormGroup;
  pageNumber: number;
  isApproved = false;
  @ViewChild('addNewProjectComponent') addNewProject: AddNewProjectComponent;
  subscription: Subscription;
  subscription1: Subscription;

  constructor(private localStorageService: LocalStorageService,
    private postProjectService: PostProjectService,
    private translator: TranslateService,
    private notificationService: UINotificationService,
    private confirmDialogService: ConfirmDialogueService,
    private jobsiteService: JobsiteService) { }

  ngOnInit(): void {
    this.subscription1 = this.postProjectService.addNewProject.subscribe(
      data => {
        this.reviewFormGroup = this.localStorageService.getItem('addNewProjectFormValue');
      }
    );

    this.subscription = this.postProjectService.currentPostProjectStep.subscribe(
      data => {
        this.pageNumber = this.localStorageService.getItem('currentProjectStep');
      }
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscription1.unsubscribe();
  }


  previous() {
    this.localStorageService.setItem('currentProjectStep', 2, false);

    //line added during UT after build..
    this.postProjectService.currentPostProjectStep.next(2);

    this.postProjectService.jobsiteScreenChange.next('jobsiteListing');
  }

  checkAllLineItemAssigned() {
    let jobsites = this.localStorageService.getItem('jobsiteDetail');
    let count = 0;
    let countLineItem = 0;
    jobsites.forEach(jobsite => {
      countLineItem += jobsite.lineItem.length;
      if (jobsite.paymentMileStone.length !== 0) {
        jobsite.paymentMileStone.forEach(element => {
          count += element.lineItem.length;
        });
      }
    });

    if (countLineItem === count) {
      return true;
    }
    else {
      return false;
    }
  }

  checkProjectIsValidForPost() {
    this.isApproved = false;
    let jobsites = this.localStorageService.getItem('jobsiteDetail');
    if (jobsites != null && jobsites.length !== 0) {
      // let hasCost = true;
      // jobsites.forEach((jobsite) => {
      //   if (jobsite.cost === 0) {
      //     hasCost = false;
      //   }
      // });
      // if (hasCost) {
        if (this.checkAllLineItemAssigned()) {
          let id = this.localStorageService.getLoginUserId();
          this.postProjectService.checkClientAccess(id).subscribe(data => {
            if (data.data === true) {
              this.postAllJobsite();
              setTimeout(() => {
                this.addNewProject.onSaveAndNext();
              }, 4000);
            }
            else {
              this.notificationService.error(data.errorCode, '');
            }
          });
        }
        else {
          this.openDialogForProjectError('Project will be saved as a draft. In order to post project, please assign all line items to payment milestone. Are you sure you want to continue?');
        }
      // }
      // else {
      //   this.openDialogForProjectError('Project will be saved as a draft. In order to post project, please create at least one line item in jobsite. Are you sure you want to continue?');
      // }
    }
    else {
      this.openDialogForProjectError('Project will be saved as a draft. In order to post project, please create atleast one jobsite. Are you sure you want to continue?');
    }
  }

  openDialogForProjectError(message) {
    let options = null;
    options = {
      title: 'Warning',
      message: message,
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    }
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.postProject();
      }
    });
  }

  postProject() {
    this.addNewProject.onSaveAndNext();
  }


  postAllJobsite() {
    let responseCount = 0;
    let jobsites = this.localStorageService.getItem('jobsiteDetail');
    jobsites.forEach(element => {
      element.status = JobsiteStatus.POSTED;
      this.jobsiteService.editJobsiteDetail(element, '').subscribe(data => {
        responseCount++;
        if (data.statusCode === '200' && data.message === 'OK') {
          // this.notificationService.success(this.translator.instant('jobsite.edited.successfully'), '');
          // setTimeout(() => {
          // this.addNewProject.onSaveAndNext();
          // }, 4000);
        } else {
          if (
            data.message === 'Project bidding has already started cannot update further' &&
            this.localStorageService.getItem('currentProjectStep') !== 3 &&
            jobsites.length === responseCount
          ) {
            // if (this.localStorageService.getItem('currentProjectStep') !== 3) {
            this.notificationService.error(data.message, '');
          }
        }
      });
    });
  }

}
