import { Component, OnInit } from '@angular/core';
import { PerfectScrollbarConfigInterface } from "ngx-perfect-scrollbar";
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public config: PerfectScrollbarConfigInterface = {};
  constructor(private captionChangeService: HeaderManagementService) { }

  ngOnInit(): void {
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.HOME);
  }

}
