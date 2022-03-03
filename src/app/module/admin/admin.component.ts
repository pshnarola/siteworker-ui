import { Component, OnDestroy, OnInit } from '@angular/core';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { CommonService } from 'src/app/shared/common-services/common.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {

  constructor(private captionChangeService: HeaderManagementService, private commonService: CommonService) { }

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.ADMIN);
    this.commonService.getAllData('State');
    this.captionChangeService.hideHeaderSubject.next(true);
  }

}
