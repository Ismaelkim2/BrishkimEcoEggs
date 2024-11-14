import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment.prod';

export interface BirdRecord {
  id?: number;
  date: string ;
  birdType: string;
  sales: number;
  eggProduction?: number;
  feedConsumption?: string;
  expenses?: number;
  vaccineRecords?: { vaccine: string; date: string }[];
  hatchDate?: string;
  totalBirds?: number;
  newFlock?: number;
  mortalities?: number;
  hatchdata?: string;
  birdCount?: number;
  sold: boolean;
  count: number;
  salesAmount: number
}

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private birdRecordsSubject = new BehaviorSubject<BirdRecord[]>([]);
  birdRecords$ = this.birdRecordsSubject.asObservable();

  private apiUrl = `${environment.apiUrl}/api/sales`; 

  constructor(private http: HttpClient) {
    this.loadBirdRecords();
  }

  loadBirdRecords() {
    this.http.get<BirdRecord[]>(this.apiUrl).subscribe(
      (records) => {
        this.birdRecordsSubject.next(records);
      },
      (error) => console.error('Error loading records:', error)
    );
  }

  saveBirdRecord(record: BirdRecord): Observable<BirdRecord> {
    return this.http.post<BirdRecord>(this.apiUrl, record).pipe(
      catchError((error) => {
        console.error('Failed to save bird record', error);
        return throwError(() => new Error('Failed to save bird record.'));
      })
    );
  }
  

  updateBirdRecord(record: BirdRecord): Observable<BirdRecord> {
    return this.http.put<BirdRecord>(`${this.apiUrl}/${record.id}`, record);
  }

  deleteSale(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        console.error('HTTP error in deleteSale:', err);
        return throwError(() => new Error('Failed to delete sale.'));
      })
    );
  }
}
