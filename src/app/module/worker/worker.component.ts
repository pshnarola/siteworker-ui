import { Component, OnInit } from '@angular/core';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';

@Component({
  selector: 'app-worker',
  templateUrl: './worker.component.html',
  styleUrls: ['./worker.component.css']
})
export class WorkerComponent implements OnInit {

  constructor(private captionChangeService: HeaderManagementService) {
    this.captionChangeService.hideHeaderSubject.next(false);
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(false);
  }

}
