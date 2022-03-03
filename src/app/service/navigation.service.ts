
import { Injectable } from '@angular/core';
import { CustomHttpService } from './customHttp.service';
import { DataTableParam } from '../shared/vo/DataTableParam';
import { Observable } from 'rxjs/Observable';
import { API_CONSTANTS } from '../shared/ApiConstants';

@Injectable()
export class NavigationService {

    hideSideNav: boolean = true;

    constructor() { }

    toggleSideNav(): void {
        this.hideSideNav = !this.hideSideNav;
    }
}