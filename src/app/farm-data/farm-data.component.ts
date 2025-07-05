import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core'; 
import { Observable, Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { BirdRecord, DailyRecord, RecordsService, WeeklySummary } from '../services/records.service';
import { DataServiceService } from '../data-service.service';
import { Router } from '@angular/router';
import { format } from 'date-fns';
import {
  trigger,
  style,
  transition,
  animate,
} from '@angular/animations';

declare var bootstrap: any;

@Component({
  selector: 'app-farm-data',
  templateUrl: './farm-data.component.html',
  styleUrls: ['./farm-data.component.css'],
  animations: [
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms 0ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms 0ms', style({ opacity: 0 }))
      ])
    ])
  ]
})

export class FarmDataComponent implements OnInit, OnDestroy {
  Math = Math;
  batchId?: string;   
  age?: number;
  newVaccination={date:'',name:'',recommendation:''};
  selectedRecord:any;
  isVaccinationModalOpen = false;
  formData: Partial<BirdRecord> = {}
  isEditMode: boolean = false;
  selectedIndex: number = -1;
  isModalOpen = false;
  isEditing: boolean = false;
  poultryIndex: number | null = 0;
  soldBirds: BirdRecord[] = []; 
  isSavedArray: boolean[] = [];
  showNotification: boolean = false;

  isLoggedInSubscription: Subscription = new Subscription();
  isLoggedIn:boolean=false;


  isLargeScreen = window.innerWidth >= 992;
  isSidebarOpen = false;

  filterTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 1;
  filteredPoultryRecords: BirdRecord[] = [];

  newHatchData = {
    hatchDate: '',
    birdType: '',
    birdCount: 0,
    role:''
    
  };


  birdRecords: BirdRecord[] = [];
  dailyRecords: DailyRecord[] = [];
  weeklySummary: WeeklySummary[] = [];
  totalBirds: number = 0;
  birdTypes: string[] = ['Improved Kienyeji', 'Kienyeji', 'Chicks'];
  poultryTypes: BirdRecord[] = [];
  subscriptions: Subscription[] = [];


  constructor(private recordsService: RecordsService,
    private cd:ChangeDetectorRef,
    private dataservice:DataServiceService,
    private recordService:RecordsService,
  private location:Location,
  private router :Router
   ) {

  }

openVaccinationLog(record:any){
this.selectedRecord=record;
this.isVaccinationModalOpen=true;
}

closeVaccinationModal(){
  this.isVaccinationModalOpen=false;
}

addVaccination() {
  if (!this.selectedRecord.vaccinations) {
    this.selectedRecord.vaccinations = [];
  }

  // Automatic recommendation logic
  if (this.newVaccination.name.toLowerCase().includes("newcastle")) {
    this.newVaccination.recommendation = "Recommended every 3 months";
  } else {
    this.newVaccination.recommendation = "Consult vet for frequency";
  }

  // Add the vaccination record
  this.selectedRecord.vaccinations.push({ ...this.newVaccination });

  // Reset form
  this.newVaccination = { date: '', name: '', recommendation: '' };

  // Close modal
  this.isVaccinationModalOpen = false;
}

  goBack(){
    this.location.back();
  }

  
  ngAfterViewInit(): void {
    let tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  onSubmit() {
    const hatchDate = this.newHatchData.hatchDate;
  
    const newBirdRecord: BirdRecord = {
      ...this.newHatchData,
      date: new Date(hatchDate).toISOString().split('T')[0],
      count: this.newHatchData.birdCount,
      eggProduction: 0,
      feedConsumption: this.getFeedType(this.calculateAgeInDays(hatchDate)),
      vaccineRecords: [this.getNextVaccine(this.calculateAgeInDays(hatchDate), hatchDate)],
      hatchdata: hatchDate,
      totalBirds: this.newHatchData.birdCount,
      newFlock: this.newHatchData.birdCount,
      mortalities: 0,
      sold: false,
      sales: 0,
      expenses: 0,
      vaccinationType: '',
      dateAdministered: '',
      name: '',
      dosage: 0,
      administeredBy: '',
      remarks: '',
      type: '',
      id: 0,
      salesAmount: 0,
      batchId: this.generateBatchId(hatchDate),
      age: this.getAgeInWeeks(hatchDate),
      breed: this.getBreedByAge(hatchDate)
    };
  
    this.recordsService.saveBirdRecord(newBirdRecord).subscribe({
      next: () => {
        // ✅ Refresh records
        this.recordsService.getBirdRecords().subscribe((records) => {
          this.birdRecords = records;
          this.applyFilter();
        });
  
        // ✅ Reset form
        this.newHatchData = {
          hatchDate: '',
          birdType: '',
          birdCount: 0,
          role: ''
        };
  
  
        // Close modal
        this.closeModal();
  
        // ✅ Optional: Show a success toast/alert
        alert('New hatch record saved successfully.');
      },
      error: (error) => {
        console.error('Error saving hatch record:', error);
        alert('Failed to save hatch record.');
      }
    });
  }
  

  ngOnInit(): void {

    this.subscriptions.push(
      this.recordsService.getBirdRecords().subscribe(
        (records) => {
          this.birdRecords = records.map(record => ({
            ...record,
            age: record.hatchdata ? this.getAgeInWeeks(record.hatchdata) : 0
          }));
          this.poultryTypes = this.birdRecords;
          this.applyFilter();
        },
        (error) => {
          console.error('Error fetching bird records:', error);
        }
      )
    );
    
  
    this.subscriptions.push(
      this.recordsService.getTotalBirds().subscribe((total) => {
        console.log('total bird',total)
        this.totalBirds = total;
      })
    );
    this.isLoggedInSubscription = this.dataservice.isLoggedIn.subscribe((isLoggedIn: boolean) => {
      this.isLoggedIn = isLoggedIn;
      if (!isLoggedIn) {
        this.router.navigate(['/login']);
      }
    });
  
    if (this.isLoggedIn) {
      this.subscriptions.push(
        this.recordsService.birdRecords$.subscribe((records) => {
          this.birdRecords = records;
          this.poultryTypes = records;
          this.applyFilter();
        })
      );
  }
}

  ngOnDestroy(): void {
    this.isLoggedInSubscription.unsubscribe();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  formatDate(date: string): string {
    return format(new Date(date), 'MMM dd, yyyy'); 
  }


  onSellBird(index: number): void {
    const confirmSell = confirm('Are you sure you want to mark this bird as sold?');
    if (confirmSell) {
      const recordIndex = (this.currentPage - 1) * this.itemsPerPage + index;
      this. filteredPoultryRecords[recordIndex].sold = true;
      this.applyFilter();  
    }
  }
  
  
  onDeleteBird(index: number): void {
    const confirmDelete = confirm('Are you sure you want to delete this bird record?');
    if (confirmDelete) {
      const recordId = this.filteredPoultryRecords[index].id; 
      if (recordId !== undefined) {
        this.recordsService.deleteBirdRecord(recordId).subscribe(
          () => {
            const globalIndex = this.birdRecords.findIndex(record => record.id === recordId);
            if (globalIndex !== -1) {
              this.birdRecords.splice(globalIndex, 1); 
            }
            this.filteredPoultryRecords.splice(index, 1); 
            this.applyFilter();
            alert('Bird record deleted successfully');
          },
          (error) => {
            console.error('Error deleting bird record:', error);
            alert('Failed to delete bird record');
          }
        );
      } else {
        console.error('Record ID is undefined');
        alert('Cannot delete bird record: ID is missing');
      }
    }
  }

  openEditModal(record: BirdRecord, index: number): void {
    this.isEditMode = true;
    this.formData = { ...record };
    this.poultryIndex = index;
    this.isEditing = true;

    const modalElement = document.getElementById('editModal');
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }
  
  openAddModal() {
    this.isEditMode = false;
    this.formData = {}; 
    this.isModalOpen = true;
  }

  onEditFarm(record: BirdRecord, index: number): void {
    const recordIndex = (this.currentPage - 1) * this.itemsPerPage + index;
    this.formData = { ...this.filteredPoultryRecords[recordIndex] }; 
    this.isEditing = true;
    this.poultryIndex = recordIndex;
    this.isModalOpen = true;  
  }
  
  
  saveChanges(): void {
    if (this.isEditing && this.formData.id) {
      this.recordsService.updateBirdRecord(this.formData as BirdRecord).subscribe(
        (updatedRecord) => {
          const index = this.birdRecords.findIndex((record) => record.id === updatedRecord.id);
          if (index !== -1) {
            this.birdRecords[index] = updatedRecord;
            this.filteredPoultryRecords[index] = updatedRecord;
          }
          this.showNotification = true;
          this.hideModal();
          this.resetFormData();

          setTimeout(() => (this.showNotification = false), 3000);
        },
        (error) => console.error('Error saving changes:', error)
      );
    }
  }

  saveEdit(): void {
    if (this.isEditing && this.poultryIndex !== null) {
      const updatedRecord = { ...this.formData }; 
      
      this.recordsService.updateBirdRecord(updatedRecord as BirdRecord).subscribe(
        (updatedRecordResponse) => {
          // Update both global and filtered records
          this.birdRecords[this.poultryIndex ?? 0] = updatedRecordResponse;
  
          const filterIndex = this.filteredPoultryRecords.findIndex(
            (record) => record.id === updatedRecordResponse.id
          );
          if (filterIndex !== -1) {
            this.filteredPoultryRecords[filterIndex] = updatedRecordResponse;
          }
  
          this.isEditing = false;
          this.poultryIndex = null;
          this.closeModal(); 
  
          this.showNotification = true;
          setTimeout(() => {
            this.showNotification = false;
          }, 3000); 
        },
        (error) => {
          console.error('Error saving record:', error);
          alert('Failed to save changes. Please try again.');
        }
      );
    }
  }
  
  
  
  resetEditMode() {
    this.formData = {};
    this.isEditMode = false;
    this.selectedIndex = -1;
    const modalElement = document.getElementById('editModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
  }
  

  showModal(): void {
    const modalElement = document.getElementById('editModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  hideModal(): void {
    const modalElement = document.getElementById('editModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
    this.resetFormData();
  }
  
  
  openModal() {
    console.log('Opening the modal...');
    this.isModalOpen = true;
  }
  
  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
    if (this.isModalOpen) {
      setTimeout(() => {
        const modal = document.getElementById('editModal');
        if (modal) {
          modal.focus();
        }
      }, 0);
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.isEditMode = false;
  }
  
  
  resetFormData(): void {
    this.formData = {}; 
    this.isEditing = false;
    this.poultryIndex = null;
  }

  generateBatchId(hatchDate: string): string {
    const dateStr = new Date(hatchDate).toISOString().slice(0, 10).replace(/-/g, '');
    return `BATCH-${dateStr}`;
  }
  
  getBreedByAge(hatchDate: string): string {
    const ageInMonths = this.calculateAgeInDays(hatchDate) / 30;
    if (ageInMonths < 2) return 'Chick';
    if (ageInMonths < 4.5) return 'Pullet';
    return 'Layer';
  }
  
  getAgeInWeeks(hatchDate: string | undefined): number {
    if (!hatchDate) return 0;
  
    const hatch = new Date(hatchDate);
    const today = new Date();
  
    if (isNaN(hatch.getTime())) {
      return 0; // Invalid date
    }
  
    const diffInMs = today.getTime() - hatch.getTime();
    const diffInWeeks = diffInMs / (1000 * 60 * 60 * 24 * 7);
  
    return Math.floor(diffInWeeks);
  }
  
  
  get poultryRecords(): any[] {
    return this.birdRecords.map(record => ({
      ...record,
      batchId: record.id?.toString().padStart(4, '0'), // or any batchId logic
      breed: record.birdType || 'Unknown',
      age: this.calculateAgeInWeeks(record.hatchdata),
      vaccinations: record.vaccineRecords || []
    }));
  }

  calculateAgeInWeeks(hatchDate: string): number {
    const today = new Date();
    const hatch = new Date(hatchDate);
    const diffInMs = today.getTime() - hatch.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    return Math.floor(diffInDays / 7);
  }
  
  
  
  calculateAgeInDays(date: string): number {
    const hatchDate = new Date(date);
    const today = new Date();
    const differenceInTime = today.getTime() - hatchDate.getTime();
    return Math.floor(differenceInTime / (1000 * 3600 * 24)); 
  }

  calculateDescriptiveAge(date: string): string {
    const ageInDays = this.calculateAgeInDays(date);
    const daysInMonth = 30;
    const daysInWeek = 7;
    const months = Math.floor(ageInDays / daysInMonth);
    const remainingDays = ageInDays % daysInMonth; 
    const weeks = Math.floor(remainingDays / daysInWeek); 
    const days = remainingDays % daysInWeek; 
  
    let ageString = '';
    if (months > 0) ageString += `${months} month${months > 1 ? 's' : ''}`;
    if (weeks > 0) ageString += (ageString ? ', ' : '') + `${weeks} week${weeks > 1 ? 's' : ''}`;
    if (days > 0) ageString += (ageString ? ', ' : '') + `${days} day${days > 1 ? 's' : ''}`;
    

    return ageString || 'just hatched';
  }

  getFeedType(ageInDays: number): string {
    const ageInMonths = ageInDays / 30;
    if (ageInMonths < 2) return 'Chick Mash'; 
    if (ageInMonths >= 1 && ageInMonths < 2) return 'Starter Crumbles';
    if (ageInMonths >= 2 && ageInMonths < 4) return 'Growers Mash'; 
    if (ageInMonths >= 4) return 'Layers Mash'; 
    return 'These birds are old enough to sell out!';
  }

  addDays(date: string, days: number): string {
    const resultDate = new Date(date);
    resultDate.setDate(resultDate.getDate() + days);
    return resultDate.toISOString().split('T')[0]; 
  }

  getNextVaccine(age: number, hatchedDate: string): { vaccine: string, date: string } {
    if (age <= 7) 
        return { vaccine: 'Newcastle 1st Dose', date: this.addDays(hatchedDate, 7) };
    if (age > 7 && age <= 14) 
        return { vaccine: 'Newcastle 2nd Dose', date: this.addDays(hatchedDate, 14) };
    if (age > 14 && age <= 21) 
        return { vaccine: 'Gumboro 1st Dose', date: this.addDays(hatchedDate, 21) };
    if (age > 21 && age <= 28) 
        return { vaccine: 'Gumboro 2nd Dose', date: this.addDays(hatchedDate, 28) };
    if (age >= 42 && age <= 50) 
        return { vaccine: 'Fowl Box', date: this.addDays(hatchedDate, 42) };
    if (age > 50 && age <= 120) 
        return { vaccine: 'Fowl Typhoid', date: this.addDays(hatchedDate, 56) };
    if (age === 112 || (age > 112 && age <= 119)) 
        return { vaccine: 'Fowl Typhoid', date: this.addDays(hatchedDate, 112) };
    if (age >= 120 && (age - 120) % 90 === 0) // Repeat Newcastle every 3 months
        return { vaccine: 'Newcastle Booster', date: this.addDays(hatchedDate, age) };
    if (age >= 365 && (age - 365) % 365 === 0) // Repeat Fowl Box yearly
        return { vaccine: 'Fowl Box', date: this.addDays(hatchedDate, age) };
    if (age > 120 && (age - 120) % 120 === 0) // Deworm every 4 months
        return { vaccine: 'Dewormer', date: this.addDays(hatchedDate, 120) };
    
    return { vaccine: 'Next dose coming soon', date: 'N/A' };
}

  cancelEdit() {
    this.isEditing = false;
    this.poultryIndex = null;
  }
  
  reviewSoldBirds() {
    const soldBirds = this.birdRecords.filter(bird => bird.sold);
    console.log(soldBirds);
  }

  

  ngOnChanges(): void {
    this.applyFilter();
  }

  // applyFilter(): void {
  //   if (this.filterTerm) {
  //     this.filteredPoultryRecords = this.birdRecords.filter((record) =>
  //       record.birdType.toLowerCase().includes(this.filterTerm.toLowerCase())
  //     );
  //   } else {
  //     this.filteredPoultryRecords = [...this.birdRecords];
  //   }
  
  //   this.filteredPoultryRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  //   this.totalPages = Math.ceil(this.filteredPoultryRecords.length / this.itemsPerPage);
  //   this.currentPage = Math.min(this.currentPage, this.totalPages);
  // }

  applyFilter(): void {
    this.filteredPoultryRecords = this.birdRecords.filter(record =>
      record.birdType?.toLowerCase().includes(this.filterTerm.toLowerCase()) ||
      record.birdType?.toLowerCase().includes(this.filterTerm.toLowerCase())
    );
    this.totalPages = Math.ceil(this.filteredPoultryRecords.length / this.itemsPerPage);
    this.currentPage = 1; // Reset to first page when filter is applied
  }
  
  

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredPoultryRecords.length / this.itemsPerPage);
  }


  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
  
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isLargeScreen = event.target.innerWidth >= 992;
    if (!this.isLargeScreen) {
      this.isSidebarOpen = false; 
    }
  } 

  

}