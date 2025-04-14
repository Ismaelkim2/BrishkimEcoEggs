import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.prod';


@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent {
  formData = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    above18: false,
    createdBy: 'self',
    userImage: null as File | null,
    userImageUrl: '',
  };
  error: string = '';
  success: string = '';
  loading = false;
  showPassword: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    if (!this.isFormValid()) return;

    this.loading = true;

    // If an image is provided, upload it first
    if (this.formData.userImage) {
        this.uploadImageToCloudinary(this.formData.userImage)
            .then((imageUrl) => {
                this.formData.userImageUrl = imageUrl;  // Store the image URL
                const formData = this.createFormData();
                this.submitRegistration(formData);
            })
            .catch((error) => {
                this.setError('Image upload failed. Please try again.', error);
            });
    } else {
        // If no image, proceed directly
        const formData = this.createFormData();
        this.submitRegistration(formData);
    }
  }

  private createFormData(): FormData {
    const formData = new FormData();
    formData.append('firstName', this.formData.firstName);
    formData.append('lastName', this.formData.lastName);
    formData.append('email', this.formData.email);
    formData.append('phoneNumber', this.formData.phoneNumber);
    formData.append('password', this.formData.password);
    formData.append('above18', String(this.formData.above18));
    formData.append('createdBy', this.formData.createdBy);

    // Only append userImageUrl if it exists
    if (this.formData.userImageUrl) {
        formData.append('userImageUrl', this.formData.userImageUrl);
    }

    return formData;
  }

  private submitRegistration(formData: FormData) {
    const apiUrl = `${environment.apiUrl}/api/user/create`;
    this.http.post(apiUrl, formData).subscribe(
      (res: any) => {  // <-- Add 'res' here to capture the response
        this.resetForm();
        this.success = 'Registration successful. Redirecting to login...';
        this.success = 'Registration successful. Redirecting to login...';
        localStorage.setItem('registeredEmail', res.email || this.formData.email);
        localStorage.setItem('registeredPhone', res.phoneNumber || this.formData.phoneNumber);
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      (error) => {
        if (error.status === 409) {
          this.setError('Phone number is already registered. Please use a different phone number.', error);
        } else {
          this.setError('Registration failed. Please try again.', error);
        }
      },
      () => (this.loading = false)
    );
  }

  private uploadImageToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', environment.cloudinaryPreset);

    return new Promise((resolve, reject) => {
      this.http.post(environment.cloudinaryUrl, formData).subscribe(
        (response: any) => {
          if (response && response.secure_url) {
            resolve(response.secure_url); // Return the image URL
          } else {
            reject('Image upload failed: No secure_url in response');
          }
        },
        (error) => reject(error)
      );
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 10 * 1024 * 1024;  // Max 10MB

    if (file && validTypes.includes(file.type) && file.size <= maxSize) {
      this.formData.userImage = file;
    } else {
      this.setError(
        'Invalid file type or size. Please upload a JPG, PNG, or GIF image less than 10MB.'
      );
    }
  }

  private isFormValid(): boolean {
    const phoneNumberPattern = /^[0-9]{10,}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = /(?=.*\d)(?=.*[a-zA-Z]).{6,}/;

    if (!this.formData.firstName || !this.formData.lastName) {
      this.setError('Please enter your full name.');
      return false;
    }

    if (!phoneNumberPattern.test(this.formData.phoneNumber)) {
      this.setError('Please enter a valid phone number with at least 10 digits.');
      return false;
    }

    if (!emailPattern.test(this.formData.email)) {
      this.setError('Please enter a valid email address.');
      return false;
    }

    if (!passwordPattern.test(this.formData.password)) {
      this.setError('Password must contain both letters and numbers and be at least 6 characters long.');
      return false;
    }

    return true;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  private setError(message: string, error?: any) {
    this.error = message;
    console.error(message, error);
    setTimeout(() => (this.error = ''), 3000);
    this.loading = false;
  }

  private resetForm() {
    this.formData = {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      above18: false,
      createdBy: 'self',
      userImage: null,
      userImageUrl: '',
    };
  }
}
