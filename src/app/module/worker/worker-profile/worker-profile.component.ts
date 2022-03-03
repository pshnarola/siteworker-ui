import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import Stepper from 'bs-stepper';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { CommonService } from 'src/app/shared/common-services/common.service';

@Component({
  selector: 'app-worker-profile',
  templateUrl: './worker-profile.component.html',
  styleUrls: ['./worker-profile.component.css']
})
export class WorkerProfileComponent implements OnInit, OnDestroy {

  currentStep: number;
  stepper: Stepper;

  constructor(
    private readonly elementRef: ElementRef,
    private captionChangeService: HeaderManagementService,
    private commonService: CommonService,
  ) {
    this.captionChangeService.hideSidebarSubject.next(true);
  }

  ngOnDestroy(): void {
    this.captionChangeService.hideSidebarSubject.next(false);
  }

  ngOnInit(): void {
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.WORKER_PROFILE);
    this.captionChangeService.hideSidebarSubject.next(true);

    const stepperEl = this.elementRef.nativeElement.querySelector('#worker-profile-stepper');

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
