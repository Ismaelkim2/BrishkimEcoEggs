import { UserDTO } from './../models/user.model';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { CartService } from '../cart.service';
import { DataServiceService } from '../data-service.service';
import { Product } from '../models/product.model';

import { RecordsService } from '../services/records.service';
import { environment } from '../../environments/environment.prod';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  recentActivities: string[] = [];
  isVibrating = false;
  private vibrationInterval: any;

  currentLanguage: string = 'en';

  cart: Product[] = [];
  notification: string | null = null;
  cartSubscription: Subscription = new Subscription();
  cartUpdatedSubscription: Subscription = new Subscription();
  isLoggedInSubscription: Subscription = new Subscription();
  loggedInUserSubscription: Subscription = new Subscription();
  isLoggedIn: boolean = false;
  userFirstName: string | null = null;
  userImageUrl?: string | null;
  loggedInUser: UserDTO | null | undefined;
  environment = environment;
  isSidebarOpen = false;
  imageError = false;
  isLargeScreen = window.innerWidth >= 992;

  constructor(
    private dataService: DataServiceService,
    private router: Router,
    private cartService: CartService,
    private recordsService: RecordsService,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    this.recordsService.recentActivities$.subscribe(activities => {
      this.recentActivities = activities;
      this.startVibration(); 
    });

    this.isSidebarOpen = this.isLargeScreen;

    this.cartSubscription = this.cartService.getCart().subscribe((cart: Product[]) => {
      this.cart = cart;
    });
  
    this.cartUpdatedSubscription = this.cartService.getCartUpdated().subscribe((message: string) => {
      this.notification = message;
      setTimeout(() => {
        this.notification = null;
      }, 3000); 
    });
  
    this.isLoggedInSubscription = this.dataService.isLoggedIn.subscribe((isLoggedIn: boolean) => {
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        this.loggedInUserSubscription = this.dataService.loggedInUser.subscribe((user: UserDTO | null) => {
          console.log("User Details:", user);
          this.userFirstName = user ? user.firstName : null;
          this.userImageUrl = user ? user.userImageUrl : '';
          if (user && user.userImageUrl) {
            // Use the full URL if it's already a valid Cloudinary URL or other full URLs
            if (user.userImageUrl.startsWith('http://') || user.userImageUrl.startsWith('https://')) {
              this.userImageUrl = user.userImageUrl;  // If already a valid URL from Cloudinary or another source
            } else {
              // If the image URL is just a file name (e.g., "image123.jpg"), construct the Cloudinary URL
              this.userImageUrl = `https://res.cloudinary.com/dg70z4hug/image/upload/${user.userImageUrl}`;
            }
            console.log("User Image URL:", this.userImageUrl);
          }
          
        });
      } else {
        this.userFirstName = null;
      }
    });
  
    this.dataService.loggedInUser.subscribe((user: UserDTO | null) => {
      this.loggedInUser = user;
    });

    this.startVibrationInterval()
  }

  ngOnDestroy(): void {
    this.cartSubscription.unsubscribe();
    this.cartUpdatedSubscription.unsubscribe();
    this.isLoggedInSubscription.unsubscribe();
    this.loggedInUserSubscription.unsubscribe();
    clearInterval(this.vibrationInterval);
  }

  toggleLanguage(): void {
    this.currentLanguage = this.currentLanguage === 'en' ? 'sw' : 'en';
    this.switchLanguage(this.currentLanguage);
  }

  switchLanguage(language: string) {
    this.translate.use(language);
  }

  viewActivities(): void {
    this.router.navigateByUrl('/activities', {
      state: { recentActivities: this.recentActivities },
    });
  }

  closeNavbar() {
    const navbar = document.getElementById('navbarSupportedContent');
    if (navbar) {
      navbar.classList.remove('show'); 
    }
  }
  
  navigateTo(route: string): void {
    this.dataService.isLoggedIn.pipe(take(1)).subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.router.navigate([route]);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }


  removeFromCart(index: number): void {
    this.cartService.removeFromCart(index);
  }

  submitOrder(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/delivery-form']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  SignIn(): void {
    this.router.navigate(['/login']);
  }

  SignUp(): void {
    this.router.navigate(['/registration']);
  }


  SignOut(): void {
    this.dataService.signOut();
    this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isLargeScreen = window.innerWidth >= 992;
    this.isSidebarOpen = this.isLargeScreen; 
  }

  onImageError(event: Event): void {
    this.imageError = true;
    (event.target as HTMLImageElement).style.display = 'none'; 
  }

  startVibration() {
    this.isVibrating = true;
    setTimeout(() => {
      this.isVibrating = false;
    }, 15000); 
  }


  startVibrationInterval() {
    this.vibrationInterval = setInterval(() => {
      this.startVibration();
    }, 5 * 60 * 1000);
  }
}
