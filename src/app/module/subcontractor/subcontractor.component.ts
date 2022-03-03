import { Component, OnInit } from '@angular/core';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { CommonService } from 'src/app/shared/common-services/common.service';

@Component({
  selector: 'app-subcontractor',
  templateUrl: './subcontractor.component.html',
  styleUrls: ['./subcontractor.component.css']
})
export class SubcontractorComponent implements OnInit {

  constructor(private captionChangeService: HeaderManagementService, private commonService: CommonService) { }

  ngOnInit(): void {
    // this.commonService.getAllData('industryType');
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    // this.commonService.industryTypeSUbscription.unsubscribe();
  }

}
