import { Component, OnInit } from '@angular/core';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { CommonService } from 'src/app/shared/common-services/common.service';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent implements OnInit {

  constructor( private commonService: CommonService, private captionChangeService: HeaderManagementService) { }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    // this.commonService.getAllData('State');
    // this.commonService.getAllData('City');
    // this.commonService.getAllData('noOfEmployee');
  }

}
