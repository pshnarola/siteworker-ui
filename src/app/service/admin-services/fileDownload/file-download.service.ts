import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from 'src/app/shared/ApiConstants';


@Injectable({
  providedIn: 'root'
})
export class FileDownloadService {

  constructor(private http: HttpClient) { }

  // downloadFile() {
  //   // const res = 'arraybuffer' | 'blob' | 'json' | 'text';
  //   return this.http.get('assets/sample file/Region_Sample.xlsx');
  // }

  uploadFile(logo) {
    const url = API_CONSTANTS.UPLOAD_INDUSTRY_LOGO;
    const req = new HttpRequest('PUT', url, logo, {
      reportProgress: true,
      responseType: 'json'
    });
    return this.http.request(req);
  }
  uploadMultipleFile(logo) {
    const url = API_CONSTANTS.UPLOAD_MULTIPLE_FILE;
    const req = new HttpRequest('PUT', url, logo, {
      reportProgress: true,
      responseType: 'json'
    });
    return this.http.request(req);
  }

  getFile(fileId: URLSearchParams) {
    const url = API_CONSTANTS.GET_INDUSTRY_LOGO + '?' + fileId;
    const req = new HttpRequest('GET', url, {
      responseType: 'blob'
    });
    return this.http.request(req);
  }

  downloadFiles(fileId, fileName) {
    const url = API_CONSTANTS.DOWNLOAD_FILE + '?fileId=' + fileId + '&fileName=' + fileName;
    const req = new HttpRequest('GET', url, {
      responseType: 'arraybuffer'
    });
    return this.http.get(url, { responseType: 'arraybuffer' });
  }


  downloadFile(fileName: string): Observable<Blob> {
    // url = 'assets/sample file/';
    const url = API_CONSTANTS.SAMPLE_FILE_PATH + fileName;
    return this.http.get(url, {
      responseType: 'blob'
    })
  }

}
