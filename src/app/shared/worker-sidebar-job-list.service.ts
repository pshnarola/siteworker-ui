import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkerSidebarJobListService {

  public workerSidebarJobChanged = new Subject<any>();
  public workerSidebarJobList = new Subject<any>();
  public refreshSidebarAfterAcceptReject =  new Subject<any>();

  constructor() { }
}
