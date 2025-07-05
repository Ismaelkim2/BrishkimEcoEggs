import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RecordsService } from '../services/records.service';
import { ExpenseService, ExpenseRecord } from '../services/expense.service';
import { SalesRecord, SalesService } from '../services/sales.service';
import { MortalitiesService, Mortality } from '../services/mortalities.service';
import { Chart, registerables } from 'chart.js';
import { CustomerService } from '../services/customer.service';

@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.css'],
})
export class RecordsComponent implements OnInit {
  salesExpenseChart: any;
  showSales = true;
  showExpenses = true;
  showProfit = true;
  showTotalBirds = true;
  salesProgress: number = 0;
  expenseProgress: number = 0;
  ProfitProgress: number = 0;
  monthlySales: { [month: number]: number } = {};
  monthlyExpenses: { [month: number]: number } = {};
  totalSalesAmount = 0;
  totalExpensesAmount = 0;
  salesList: SalesRecord[] = [];
  totalBirds = 0;
  totalMortalities = 0;
  mortalityRecords: Mortality[] = [];
  birdRecords: SalesRecord[] = [];
  expenseRecords: ExpenseRecord[] = [];
  selectedYear = new Date().getFullYear();
  years: number[] = [];
  selectedMonth = '';
  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  currentPage = 1;
  itemsPerPage = 5;
  noDataForYear = false;

  salesTarget: number = 50000;

  profit: number = 0;

  customers: any[] = [];

  constructor(
    private recordsService: RecordsService,
    private expenseService: ExpenseService,
    private salesService: SalesService,
    private mortalitiesService: MortalitiesService,
    private customerService: CustomerService,
    private cdr: ChangeDetectorRef
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.loadYears();
    this.fetchSalesRecords();
    this.fetchExpenseRecords();
    this.fetchTotalBirds();
    this.fetchMortalities();
    this.calculateProgress();
    this.loadCustomers();
    this.calculateProfit();
    this.calculateProfitProgress();
  }


  ngAfterViewInit(): void {
    this.renderChart();
  }

  renderChart(): void {
    const canvas = document.getElementById('salesExpenseChart') as HTMLCanvasElement;
  
    if (!canvas) {
      console.error('Canvas element not found.');
      return;
    }
  
    this.salesExpenseChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: this.months,
        datasets: [
          {
            label: 'Sales (Bar)',
            type: 'bar',
            data: this.formatChartData(this.monthlySales),
            backgroundColor: 'rgba(40, 167, 69, 0.8)',
          },
  
          {
            label: 'Expenses (Bar)',
            type: 'bar',
            data: this.formatChartData(this.monthlyExpenses),
            backgroundColor: 'rgba(220, 53, 69, 0.8)',
          },
    
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
        },
        scales: {
          x: {
            beginAtZero: true,
          },
          y: {
            beginAtZero: true,
            position: 'left',
          },
        },
      },
    });
  }
  

  updateChart(): void {
    if (this.salesExpenseChart) {
      this.salesExpenseChart.data.datasets[0].data = this.formatChartData(this.monthlySales);
      this.salesExpenseChart.data.datasets[1].data = this.formatChartData(this.monthlyExpenses);
      this.salesExpenseChart.update();
    } else {
      this.renderChart();
    }
  }

  formatChartData(data: { [month: number]: number }): number[] {
    return Array.from({ length: 12 }, (_, i) => data[i + 1] || 0); 
  }

  calculateProfit(): void {
    this.profit = this.totalSalesAmount - this.totalExpensesAmount;
    this.calculateProfitProgress();
  }
  
  calculateProfitProgress(): void {
    if (this.totalSalesAmount > 0) {
      this.ProfitProgress = (this.profit / this.totalSalesAmount) * 100;
    } else {
      this.ProfitProgress = 0;
    }
    }
  
  calculateProgress(): void {
    this.salesProgress = this.salesTarget > 0 
      ? Math.min((this.totalSalesAmount / this.salesTarget) * 100, 100) 
      : 0;
  
    this.expenseProgress = this.salesTarget > 0 
      ? Math.min((this.totalExpensesAmount / this.salesTarget) * 100, 100) 
      : 0;
    this.calculateProfitProgress();
  }

  
  fetchSalesRecords(): void {
    this.salesService.SalesRecord$.subscribe(
      (records) => {
        this.salesList = records;
        this.calculateMonthlySales();
        this.calculateProfit();
        this.updateChart();
      },
      (error) => console.error('Error fetching sales records:', error)
    );
  }

  fetchExpenseRecords(): void {
    this.expenseService.expenseRecords$.subscribe(
      (records) => {
        this.expenseRecords = records;
        this.calculateMonthlyExpenses();
        this.calculateProfit();
        this.updateChart();
      },
      (error) => console.error('Error fetching expense records:', error)
    );
  }

  calculateMonthlySales(): void {
    this.monthlySales = {};
    this.totalSalesAmount = 0;

    this.salesList.forEach((record) => {
      const date = new Date(record.date);
      if (date.getFullYear() === this.selectedYear) {
        const month = date.getMonth() + 1;
        this.monthlySales[month] = (this.monthlySales[month] || 0) + record.sales;
        this.totalSalesAmount += record.sales;
      }
    });
    this.calculateProgress();
  }

  calculateMonthlyExpenses(): void {
    this.monthlyExpenses = {};
    this.totalExpensesAmount = 0;

    this.expenseRecords.forEach((record) => {
      const date = new Date(record.date);
      if (date.getFullYear() === this.selectedYear) {
        const month = date.getMonth() + 1;
        this.monthlyExpenses[month] = (this.monthlyExpenses[month] || 0) + record.amount;
        this.totalExpensesAmount += record.amount;
      }
    });

    this.calculateProgress();
  }

  toggleVisibility(card: string) {
    switch (card) {
      case 'sales':
        this.showSales = !this.showSales;
        break;
      case 'expenses':
        this.showExpenses = !this.showExpenses;
        break;
      case 'profit':
        this.showProfit = !this.showProfit;
        break;
      case 'totalBirds':
        this.showTotalBirds = !this.showTotalBirds;
        break;
      default:
        console.warn('Unknown card:', card);
    }
  }


  loadYears(): void {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  }

  fetchTotalBirds(): void {
    this.recordsService.birdRecords$.subscribe(
      (records) => {
        this.birdRecords = records;
        this.totalBirds = this.birdRecords.reduce((sum, record) => sum + (record.count || 0), 0);
      },
      (error) => console.error('Error fetching bird records:', error)
    );
  }


  fetchMortalities(): void {
    this.mortalitiesService.getMortalities().subscribe(
      (records) => {
        this.mortalityRecords = records;
        this.totalMortalities = this.mortalityRecords.reduce((sum, record) => sum + (record.numberOfMortalities || 0), 0);
      },
      (error) => console.error('Error fetching mortality records:', error)
    );
  }

  loadCustomers() {
    this.customerService.getCustomers().subscribe(data => {
        this.customers = data.map(customer => ({
            ...customer
           
        }));
    });
}

  get totalCustomers(){
    return this.customers.length;
}


  onYearChange(): void {
    this.calculateMonthlySales();
    this.calculateMonthlyExpenses();
    this.updateChart();
  }


  getFilteredMonthlyRecords(): string[] {
    const filteredMonths = this.months.filter(month => {
      const monthIndex = this.getMonthIndex(month) + 1;
      return (this.monthlySales[monthIndex] || 0) > 0 || (this.monthlyExpenses[monthIndex] || 0) > 0;
    });
    this.noDataForYear = filteredMonths.length === 0;
    return filteredMonths.reverse();
  }
  

  getMonthIndex(month: string): number {
    return this.months.indexOf(month);
  }

  get totalPages(): number {
    return Math.ceil(this.getFilteredMonthlyRecords().length / this.itemsPerPage);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  printMonthlyRecords(): void {
    window.print();
  }

   get effectiveTotalBirds(): number {
    return this.totalBirds - this.totalMortalities;
  }

  latestActions: string[] = [
    'Added 50 broilers on 2025-04-15',
    'Updated flock record BK2025-04-10',
    'Deleted batch BK2025-04-05',
    'Vaccination recorded for BK2025-04-01',
    // add more as needed
  ];
  
  navigateTo(destination: string) {
    // Example for now; replace with actual navigation logic
    alert(`Redirecting to ${destination}...`);
  }
  
  viewAllActions() {
    alert('Redirecting to all activity logs...');
  }

  toggleModal(){

  }
  
}
