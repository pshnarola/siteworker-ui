import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';
import { CustomHttpService } from '../customHttp.service';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(private customHttpService: CustomHttpService, private http: HttpClient) { }

  getAllInvoices(dataTableParam: URLSearchParams): Observable<any> {
    const url = API_CONSTANTS.GET_INVOICES + '?' + dataTableParam;
    return this.customHttpService.get(url);
  }
  exportToExcel(dataTableParam: URLSearchParams): Observable<any>{
    const url = API_CONSTANTS.EXPORT_TO_EXCEL_INVOICE + '?' + dataTableParam;
    const req = new HttpRequest('GET', url, {
        responseType: 'arraybuffer'
    });
    return  this.http.get(url,{ responseType: 'arraybuffer' });
  }
  // tslint:disable-next-line: typedef
  updateStatus(invoiceDTO){
    const url = API_CONSTANTS.UPDATE_INVOICE_STATUS;
    return this.customHttpService.put(url, invoiceDTO);
  }

}
