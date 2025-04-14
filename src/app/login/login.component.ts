import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataServiceService } from './../data-service.service';
import { ToastrService } from 'ngx-toastr';

export interface AuthResponse {
  token: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  Greeting: string='';
  phoneNumber: string = '';
  password: string = '';
  showPassword: boolean = false;
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private dataService: DataServiceService, 
    private router: Router,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.setGreetings();
    setInterval(()=>this.setGreetings(),6000);
  }

  setGreetings(){
    const currenthour= new Date().getHours();
    if (currenthour<12){
      this.Greeting='Good Morning';
    } else if(currenthour<18){
      this.Greeting='Good afternoon';
    }else{
      this.Greeting='Good evening'
    }

  }

  onPhoneNumberInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.phoneNumber = target.value;
    }
  }

  onPasswordInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.password = target.value;
    }
  }

  onSubmit() {
    if (this.phoneNumber.length < 10) {
      this.errorMessage = 'Phone number must be at least 10 digits.';
      return;
    }
  
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordPattern.test(this.password)) {
      this.errorMessage = 'Password must contain letters and numbers.';
      return;
    }
  
    this.loading = true;
    this.errorMessage = '';
  
    this.dataService.signIn({ phoneNumber: this.phoneNumber, password: this.password })
      .subscribe(
        success => {
          if (success) {
            this.toastr.success('Logged in successfully');
            this.router.navigate(['/records']);
          } else {
            this.errorMessage = 'Incorrect Phone Number or Password';
          }
          this.loading = false;
        },
        error => {
          console.error(error); 
          this.errorMessage = error.status === 401
            ? 'Unauthorized: Incorrect credentials'
            : 'An error occurred during login.';
          this.loading = false;
        }
      );
  }
  
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  navigateToForgotPassword() {
    this.router.navigate(['forgotpassword']);
  }
}
