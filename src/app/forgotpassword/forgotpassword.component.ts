import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css']
})
export class ForgotpasswordComponent implements OnInit {
  email: string = '';
  phone: string = '';
  smsSelected: boolean = false;
  emailSelected: boolean = false;
  verificationCode: string = '';  // Store the verification code input by the user
  codeSent: boolean = false;  // Flag to check if code was sent
  errorMessage: string = '';  // Store error message

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.email = localStorage.getItem('registeredEmail') || '';
    this.phone = localStorage.getItem('registeredPhone') || '';
  }

  // Method to handle sending verification code
  sendVerificationCode() {
    if (!this.smsSelected && !this.emailSelected) {
      this.errorMessage = 'Please select a method to receive the verification code.';
      return;
    }

    // Send the verification code based on the selected method
    if (this.smsSelected) {
      // Send SMS code to phone
      this.http.post(`${environment.apiUrl}/api/user/send-sms-code`, { phoneNumber: this.phone })
        .subscribe({
          next: (res) => {
            this.codeSent = true;
            this.errorMessage = '';  // Clear any previous error message
            console.log('SMS code sent successfully!');
          },
          error: (err) => {
            this.errorMessage = 'Failed to send SMS code. Please try again later.';
            console.error(err);
          }
        });
    } else if (this.emailSelected) {
      // Send email code
      this.http.post(`${environment.apiUrl}/api/user/send-email-code`, { email: this.email })
        .subscribe({
          next: (res) => {
            this.codeSent = true;
            this.errorMessage = '';  // Clear any previous error message
            console.log('Email code sent successfully!');
          },
          error: (err) => {
            this.errorMessage = 'Failed to send email code. Please try again later.';
            console.error(err);
          }
        });
    }
  }

  // Method to handle verifying the entered code
  verifyCode() {
    if (!this.verificationCode) {
      this.errorMessage = 'Please enter the verification code.';
      return;
    }



    // Verify the code
    this.http.post(`${environment.apiUrl}/api/user/verify-code`, { code: this.verificationCode })
      .subscribe({
        next: (res:any) => {
          if (res.isValid) {
            // Code is correct, navigate to password reset page
            this.router.navigate(['/reset-password']);
          } else {
            this.errorMessage = 'Invalid verification code.';
          }
        },
        error: (err) => {
          this.errorMessage = 'Error verifying code. Please try again.';
          console.error(err);
        }
      });
  }
}
