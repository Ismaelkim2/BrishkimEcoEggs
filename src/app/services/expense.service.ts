import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, throwError, tap } from 'rxjs';
import { environment } from '../../environments/environment.prod';

export interface ExpenseRecord {
  id?: number;
  date: string;
  expenseType: string;
  amount: number;
  notes?: string;
}
@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private expenseRecordsSubject = new BehaviorSubject<ExpenseRecord[]>([]);
  expenseRecords$ = this.expenseRecordsSubject.asObservable();

  private apiUrl = `${environment.apiUrl}/api/expenses`;

  constructor(private http: HttpClient) {
    this.fetchExpenseRecords();
  }

   fetchExpenseRecords(): void {
    this.http.get<ExpenseRecord[]>(this.apiUrl).subscribe((records) => {
      this.expenseRecordsSubject.next(records);
    });
  }

  saveExpenseRecord(expense: ExpenseRecord): Observable<ExpenseRecord> {
    const currentRecords = this.expenseRecordsSubject.getValue();
    this.expenseRecordsSubject.next([...currentRecords, expense]); 

    return this.http.post<ExpenseRecord>(this.apiUrl, expense).pipe(
      catchError((error) => {
        this.expenseRecordsSubject.next(currentRecords);
        return throwError(() => new Error('Failed to save expense record.'));
      })
    );
  }

  updateExpenseRecord(expense: ExpenseRecord): Observable<ExpenseRecord> {
    return this.http.put<ExpenseRecord>(`${this.apiUrl}/${expense.id}`, expense);
  }

  deleteExpenseRecord(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        return throwError(() => new Error('Failed to delete expense record.'));
      }),
      // Update BehaviorSubject to remove deleted record
      tap(() => {
        const currentRecords = this.expenseRecordsSubject.getValue();
        const updatedRecords = currentRecords.filter(expense => expense.id !== id);
        this.expenseRecordsSubject.next(updatedRecords);
      })
    );
  }
  
}
