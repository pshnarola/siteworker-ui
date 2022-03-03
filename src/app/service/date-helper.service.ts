import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateHelperService {

  constructor() { }

  setStartDate(startDate): void{
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
  }
  setEndDate(endDate): void{
    endDate.setHours(23);
    endDate.setMinutes(59);
    endDate.setSeconds(59);
  }
}
