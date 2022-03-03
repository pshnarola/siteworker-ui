import { Component, OnInit } from '@angular/core';
import { GamificationConfigurationService } from 'src/app/service/admin-services/gamification-configuration/gamification-configuration.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
@Component({
  selector: 'app-gamification-configuration',
  templateUrl: './gamification-configuration.component.html',
  styleUrls: ['./gamification-configuration.component.css']
})
export class GamificationConfigurationComponent implements OnInit {

  clientAccess: any;
  isGamificationEnabled = false;

  constructor(
    private captionChangeService: HeaderManagementService,
    private localStorageService: LocalStorageService,
    private gamificationConfigurationService: GamificationConfigurationService,
  ) {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
  }

  ngOnInit(): void {
    this.clientAccess = this.localStorageService.getItem('userAccess');
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.GAMIFICATION);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);

    this.getGamificationToggle();
  }

  handleChange(event) {
    console.log(event);
  }

  onToggle(event) {
    this.gamificationConfigurationService.toggleGamification(event.checked).subscribe(data => {
      this.gamificationConfigurationService.toggleGamificationSubject.next(event.checked);
    });
  }
  getGamificationToggle() {
    this.gamificationConfigurationService.getGamificationConfiguration().subscribe(data => {
      this.isGamificationEnabled = data.data;
    });
  }
}
