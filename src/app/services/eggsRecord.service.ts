import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';

import { error } from 'node:console';
import { EggRecord } from '../eggs-record-list/eggs-record-list.component';
import { environment } from '../../environments/environment.prod';

interface ResponseMessage {
  message?: string;
  error?: string;
}

export interface WeeklyEggRecord {
  startOfWeek: Date;
  endOfWeek: Date;
  eggsCount: number;
  brokenEggsCount: number;
}


@Injectable({
  providedIn: 'root',
})
export class EggsRecordService {
  private baseUrl = `${environment.apiUrl}/api/eggs`;

  constructor(private http: HttpClient) {}


  getRecords(): Observable<EggRecord[]> {
    return this.http.get<EggRecord[]>(this.baseUrl).pipe(
      map(records =>
        records.map(record => ({
          ...record,
          date: new Date(record.date) 
        }))
      )
    );
  }
  

  addRecord(record: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, record);
  }
  

  updateRecord(id: number, record: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, record);
  }

  deleteRecord(id: number): Observable<ResponseMessage> {
    return this.http.delete<ResponseMessage>(`${this.baseUrl}/${id}`);
  }

  getCurrentWeekData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/current-week`);
  }

  archiveCurrentWeekData(records: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/archive-week`, records);
  }

  getPreviousWeeksData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/previous-records`);
  }

}
