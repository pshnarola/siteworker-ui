import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomHttpService } from 'src/app/service/customHttp.service';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {

  constructor(private customHttpService: CustomHttpService) { }


  getLeaderboard(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_LEADERBOARD + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }

  getAllTimeTopTenUsers(role) {
    const url = API_CONSTANTS.GET_TOP_TEN_ALL_TIME_USERS + role;
    return this.customHttpService.get(url);
  }

  getLoggedInUserPoints(id) {
    const url = API_CONSTANTS.GET_CUMULATIVE_POINTS_OF_LOGGEDIN_USERS + id;
    return this.customHttpService.get(url);
  }

}
