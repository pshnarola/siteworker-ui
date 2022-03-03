import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CaptionConstants } from '../shared/CaptionConstants';

@Injectable({
  providedIn: 'root'
})
export class HeaderManagementService {

  public captionchangerSubject = new BehaviorSubject(CaptionConstants.DEFAULT);
  public hideHeaderSubject = new BehaviorSubject(true);

  public profileDataSubject = new Subject<any>();

  public hideSidebarSubject = new Subject<boolean>();

  constructor() { }
}
