import { Component, OnInit } from '@angular/core';
import { HeaderManagementService } from 'src/app/service/header-management.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {

  constructor(private headerManagementService: HeaderManagementService) { }

  ngOnInit(): void {
    this.headerManagementService.hideHeaderSubject.next(false);
  }

}
