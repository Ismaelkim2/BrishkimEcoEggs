import { Component } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Location } from '@angular/common';
import { ExpenseRecord, ExpenseService } from '../services/expense.service';

declare var bootstrap: any;

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.css']
})
export class ExpensesComponent {
  newExpense: Partial<ExpenseRecord> = { date: '', expenseType: '', amount: 0 };
  expensesList: ExpenseRecord[] = [];
  filteredExpenses: ExpenseRecord[] = [];
  currentExpensesPage: ExpenseRecord[] = [];
  filterText: string = '';
  editMode: boolean = false;
  editIndex: number | null = null;
  currentPage: number = 1 ;
  pageSize: number = 5;
  totalPages: number = 1;

  constructor(
    private expenseService: ExpenseService,
    private modalService: NgbModal,
    private location: Location
  ) {}

  ngOnInit() {
    this.loadExpenses();
  }

  ngAfterViewInit(): void {
    let tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  goBack(): void {
    this.location.back();
  }

  openExpenseModal(content: any) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
    });
  }

  saveExpense() {
    if (this.newExpense.date && this.newExpense.expenseType && this.newExpense.amount) {
      const expenseRecord: ExpenseRecord = {
        id: this.editMode ? this.expensesList[this.editIndex!].id : undefined,
        date: this.newExpense.date,
        expenseType: this.newExpense.expenseType,
        amount: this.newExpense.amount,
        notes: this.newExpense.notes || ''
      };

      if (this.editMode) {
        this.expenseService.updateExpenseRecord(expenseRecord).subscribe({
          next: () => {
            this.loadExpenses();
            this.modalService.dismissAll();
            this.resetForm();
          },
          error: (err) => console.error('Error updating record:', err)
        });
      } else {
        this.expenseService.saveExpenseRecord(expenseRecord).subscribe({
          next: () => {
            this.loadExpenses();
            this.modalService.dismissAll();
            this.resetForm();
          },
          error: (err) => console.error('Error saving record:', err)
        });
      }
    }
  }

  loadExpenses() {
    this.expenseService.expenseRecords$.subscribe(records => {
      this.expensesList = records;
      this.filterExpenses();
    });
  }

  filterExpenses() {
    this.filteredExpenses = this.expensesList.filter(expense =>
      expense.expenseType && expense.expenseType.toLowerCase().includes(this.filterText.toLowerCase())
    );
    this.setPagination();
  }
  
  resetForm() {
    this.newExpense = { date: '', expenseType: '', amount: 0 };
    this.editMode = false;
    this.editIndex = null;
  }

  onEdit(expense: ExpenseRecord, modal: any): void {
    this.newExpense = { ...expense };
    this.editMode = true;
    this.editIndex = this.expensesList.indexOf(expense);
    this.openExpenseModal(modal); 
  }

  onDeleteExpense(expense: ExpenseRecord) {
    const confirmDelete = confirm(`Are you sure you want to delete this expense (${expense.expenseType})?`);
    if (confirmDelete) {
      this.expenseService.deleteExpenseRecord(expense.id!).subscribe({
        next: () => {
          this.expenseService.fetchExpenseRecords(); // Refresh UI
          console.log(`Expense with ID ${expense.id} deleted.`);
        },
        error: (err) => console.error('Error deleting expense:', err)
      });
    }
  }
  

  setPagination() {
    this.totalPages = Math.ceil(this.filteredExpenses.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.updateExpensesPage();
  }

  updateExpensesPage() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.currentExpensesPage = this.filteredExpenses.slice(start, end);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateExpensesPage();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateExpensesPage();
    }
  }

  getTotalExpenses(): number {
    return this.expensesList.reduce((total, expense) => total + expense.amount, 0);
  }
}
