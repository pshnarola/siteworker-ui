import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageService } from './localstorage.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  public static ADMIN_THEME = 'admin-theme';

  public static CLIENT_THEME = 'client-theme';

  public static SUBCONTRACTOR_THEME = 'subcontractor-theme';

  public static WORKER_THEME = 'worker-theme';

  public themechangerSubject = new BehaviorSubject(ThemeService.ADMIN_THEME);

  constructor(private localStorageService: LocalStorageService) { }


  setTheme(roleName: string): void {
    switch (roleName) {
      case 'ADMIN':
        {
          this.themechangerSubject.next(ThemeService.ADMIN_THEME);
          this.localStorageService.setTheme(ThemeService.ADMIN_THEME);
          break;
        }
      case 'CLIENT':
      case 'SUPERVISOR':
         {
        this.themechangerSubject.next(ThemeService.CLIENT_THEME);
        this.localStorageService.setTheme(ThemeService.CLIENT_THEME);
        break;
      }
      case 'SUBCONTRACTOR': {
        this.themechangerSubject.next(ThemeService.SUBCONTRACTOR_THEME);
        this.localStorageService.setTheme(ThemeService.SUBCONTRACTOR_THEME);
        break;
      }
      case 'WORKER': {
        this.themechangerSubject.next(ThemeService.WORKER_THEME);
        this.localStorageService.setTheme(ThemeService.WORKER_THEME);
        break;
      }
      default: {
        this.themechangerSubject.next(ThemeService.ADMIN_THEME);
        this.localStorageService.setTheme(ThemeService.ADMIN_THEME);
        break;
      }
    }
  }


}
