import { Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Stepper from 'bs-stepper';
import { PostJobServiceService } from 'src/app/post-job-service.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';

@Component({
  selector: 'app-post-job',
  templateUrl: './post-job.component.html',
  styleUrls: ['./post-job.component.css']
})
export class PostJobComponent implements OnInit {
   /*
  @author Vinita Jagwani
  */
  currentStep: number;
  private stepper: Stepper;
  isFormCompleted = false;

  constructor(private readonly elementRef: ElementRef,
              private postJobService: PostJobServiceService,
              private captionChangeService: HeaderManagementService,
              private localStorageService: LocalStorageService,
              private router: Router) {
    this.localStorageService.removeItem('jobId');
    this.localStorageService.removeItem('job');
    this.localStorageService.removeItem('jobInviteeList');
    this.localStorageService.removeItem('reviewConfirmPreviousData');
    this.captionChangeService.hideHeaderSubject.next(false);
    const currenturl = this.router.url;
    if (currenturl === '/client/post-job'){
      this.localStorageService.removeItem('editJobId');
      this.captionChangeService.captionchangerSubject.next(CaptionConstants.POST_JOB);
    }else{
      this.captionChangeService.captionchangerSubject.next(CaptionConstants.EDIT_JOB);
    }
    }

  ngOnInit(): void {
    this.localStorageService.removeItem('jobId');
    this.captionChangeService.hideHeaderSubject.next(false);
    const currenturl = this.router.url;
    if (currenturl === '/client/post-job'){
      this.captionChangeService.captionchangerSubject.next(CaptionConstants.POST_JOB);
    }else{
      this.captionChangeService.captionchangerSubject.next(CaptionConstants.EDIT_JOB);
    }

    const stepperEl = this.elementRef.nativeElement.querySelector('#post-job-stepper');

    stepperEl.addEventListener('show.bs-stepper', event => {
      this.currentStep = event.detail.to;
    });

    this.stepper = new Stepper(stepperEl, {
      linear: true,
      animation: false
    });
  }
  ngOnDestroy(){
    this.localStorageService.removeItem('editJobId');
    this.localStorageService.removeItem('jobId');
    this.localStorageService.removeItem('job');
  }
  saveJobDetails(jobDetails: any): void{
    this.postJobService.postJobDetails.jobDetails = jobDetails;
    this.isFormCompleted = false;
    this.next();
  }

  savePayDetails(payDetails: any): void{
    this.postJobService.postJobDetails.payDetails = payDetails;
    this.isFormCompleted = true;
    this.next();
  }
  saveReviewFormDetails(postJobDetails: any): void{
    this.postJobService.postJobDetails = postJobDetails;
    this.next();
  }
  saveWorkerSelection(workerSelection: any): void{
    this.postJobService.postJobDetails.workerSelection = workerSelection;
     }
  previousPayDetails(payDetails: any): void{
    this.postJobService.postJobDetails.payDetails = payDetails;
    this.previous();
  }
  previousReviewDetails(postJobDetails: any): void{
    this.previous();
  }
  goToPrevious(event): void{
    this.previous();
  }
  next(): void{
    this.stepper.next();
  }

  previous(): void{
    this.stepper.previous();
  }

}
