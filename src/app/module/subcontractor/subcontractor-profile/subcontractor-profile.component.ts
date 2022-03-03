import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import Stepper from 'bs-stepper';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { CommonService } from 'src/app/shared/common-services/common.service';

@Component({
  selector: 'app-subcontractor-profile',
  templateUrl: './subcontractor-profile.component.html',
  styleUrls: ['./subcontractor-profile.component.css']
})
export class SubcontractorProfileComponent implements OnInit, OnDestroy {
  currentStep: number;
  stepper: Stepper;
  constructor(
    private readonly elementRef: ElementRef,
    private captionChangeService: HeaderManagementService,
    private commonService: CommonService
  ) {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
  }

  ngOnDestroy(): void {
    this.captionChangeService.hideSidebarSubject.next(false);
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.SUBCONTRACTOR_PROFILE);
    this.commonService.getAllData('industryType');
    this.commonService.getAllData('diversityCategory');
    this.commonService.getAllData('noOfEmployee');
    this.commonService.getAllData('service');
    this.commonService.getAllData('State');

    const stepperEl = this.elementRef.nativeElement.querySelector('#subcontrator-profile-stepper');

    stepperEl.addEventListener('show.bs-stepper', event => {
      this.currentStep = event.detail.to;
    });

    this.stepper = new Stepper(stepperEl, {
      linear: true,
      animation: false
    });
  }

  goToNext(event) {
    this.next();
  }

  next() {
    this.stepper.next();
  }

  goToPrevious(event) {
    this.previous();
  }

  previous() {
    this.stepper.previous();
  }

}
