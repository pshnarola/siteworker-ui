import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import Stepper from 'bs-stepper';
import { Subscription } from 'rxjs';
import { PostProjectService } from 'src/app/service/client-services/post-project/post-project.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';

@Component({
  selector: 'app-post-project',
  templateUrl: './post-project.component.html',
  styleUrls: ['./post-project.component.css']
})
export class PostProjectComponent implements OnInit, OnDestroy {

  currentStep: number;
  private stepper: Stepper;
  isFormCompleted = false;
  subscription :any;
  subscription1 :any;


  constructor(private readonly elementRef: ElementRef,
    private captionChangeService: HeaderManagementService,
    private postProjectService: PostProjectService,
    private _localStorageService: LocalStorageService,
    private projectJobSelectionService: ProjectJobSelectionService) {
      this.captionChangeService.hideHeaderSubject.next(false);
      if(this._localStorageService.getItem('addProjectDetail')){
        this.captionChangeService.captionchangerSubject.next(CaptionConstants.EDIT_PROJECT);
      }else{
        this.captionChangeService.captionchangerSubject.next(CaptionConstants.POST_PROJECT);
      }
  }

  ngOnInit() {
    const stepperEl = this.elementRef.nativeElement.querySelector('#post-project-stepper');
    this.captionChangeService.hideHeaderSubject.next(false);
    this.projectJobSelectionService.selectedJobsiteOfDropdown.next(1);
    this.subscription =  this.postProjectService.editProject.subscribe(
      data => {
        if(this._localStorageService.getItem('isEditMode')){
          this.captionChangeService.captionchangerSubject.next(CaptionConstants.EDIT_PROJECT);
        }else{
          this.captionChangeService.captionchangerSubject.next(CaptionConstants.POST_PROJECT);
        }
      }
    );
    stepperEl.addEventListener('show.bs-stepper', event => {
      this.currentStep = event.detail.to;
    });

    this.stepper = new Stepper(stepperEl, {
      linear: true,
      animation: false
    });

    this.subscription1 =  this.postProjectService.currentPostProjectStep.subscribe(
      data => {
        this.currentStep = this._localStorageService.getItem('currentProjectStep');
        this.stepper.to(this.currentStep);
      }
    );
  }

  ngOnDestroy(): void {
    this.projectJobSelectionService.hideJobsiteListBehaviourSubject.next(false);
    this.subscription.unsubscribe();
    this.subscription1.unsubscribe();
    this._localStorageService.removeItem('addNewProjectFormValue');
    this._localStorageService.removeItem('selectedJobsiteOfDropdown');
    this._localStorageService.removeItem('Data0');
    this._localStorageService.removeItem('addProjectDetail');
    this._localStorageService.removeItem('jobsiteScreen');
    this._localStorageService.removeItem('currentProjectStep');
    this._localStorageService.removeItem('unselectedLineItem');
    this._localStorageService.removeItem('milestoneScreen');
    this._localStorageService.removeItem('addJobsiteScreen');
    this._localStorageService.removeItem('addLineItemScreen');
    this._localStorageService.removeItem('jobsiteDetail');
    this._localStorageService.removeItem('isEditMode');
  }

  next() {
    this.stepper.next();
  }

}
