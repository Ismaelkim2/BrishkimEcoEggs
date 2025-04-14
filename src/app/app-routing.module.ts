import { MortalitiesComponent } from './mortalities/mortalities.component';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProductListComponent } from './product-list/product-list.component';
import { CartComponent } from './cart/cart.component';
import { RegistrationComponent } from './registration/registration.component';
import { PoultryListComponent } from './poultry-list/poultry-list.component';
import { PaymentMethodComponent } from './payment-method/payment-method.component';
import { DeliveryFormComponent } from './delivery-form/delivery-form.component';
import { OrderConfirmationComponent } from './order-confirmation/order-confirmation.component';
import { ContactComponent } from './contact/contact.component';
import { FooterComponent } from './footer/footer.component';
import { PostListComponent } from './post-list/post-list.component';
import { NewPostComponent } from './new-post/new-post.component';
import { EditPostComponent } from './edit-post/edit-post.component';
import { OurServicesComponent } from './our-services/our-services.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { FaqComponent } from './faq/faq.component';
import { SummaryComponent } from './summary/summary.component';
import { RecordsComponent } from './records/records.component';
import { FarmDataComponent } from './farm-data/farm-data.component';
import { WorkersComponent } from './workers/workers.component';
import { WorkersFormComponent } from './workers-form/workers-form.component';
import { SettingsComponent } from './settings/settings.component';
import { ExpensesComponent } from './expenses/expenses.component';
import { SalesComponent } from './sales/sales.component';
import { AuthGuard } from './auth.guard';
import { CustomersComponent } from './customers/customers.component';
import { AddCustomerComponent } from './customers/add-customer/add-customer.component';
import { EditCustomerComponent } from './customers/edit-customer/edit-customer.component';
import { EggsRecordListComponent } from './eggs-record-list/eggs-record-list.component';
import { EggsRecordFormComponent } from './eggs-record-list/eggs-record-form/eggs-record-form.component';
import { DetailViewComponent } from './detail-view/detail-view.component';
import { ActivitiesComponent } from './activities/activities.component';
import { NotificationComponent } from './notification/notification.component';
import { ArchivedEggRecordsComponent } from './eggs-record-list/archived-egg-records/archived-egg-records.component';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';


const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'product-list', component: ProductListComponent, canActivate: [AuthGuard] },
  { path: 'cart', component: CartComponent, canActivate: [AuthGuard] },
  { path: 'registration', component: RegistrationComponent },
  { path: 'poultry-list', component: PoultryListComponent, canActivate: [AuthGuard] },
  { path: 'payment-method', component: PaymentMethodComponent, canActivate: [AuthGuard] },
  { path: 'delivery-form', component: DeliveryFormComponent, canActivate: [AuthGuard] },
  { path: 'order-confirmation', component: OrderConfirmationComponent, canActivate: [AuthGuard] },
  { path: 'contact', component: ContactComponent },
  { path: 'footer', component: FooterComponent },
  { path: 'post-list', component: PostListComponent, canActivate: [AuthGuard] },
  { path: 'new-post', component: NewPostComponent, canActivate: [AuthGuard] },
  { path: 'edit-post/:id', component: EditPostComponent, canActivate: [AuthGuard] },
  { path: 'our-services', component: OurServicesComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'faq', component: FaqComponent },
  { path: 'summary', component: SummaryComponent, canActivate: [AuthGuard] },
  { path: 'records', component: RecordsComponent, canActivate: [AuthGuard] },
  { path: 'farm-data', component: FarmDataComponent, canActivate: [AuthGuard] },
  { path: 'workers', component: WorkersComponent, canActivate: [AuthGuard] },
  { path: 'workers-form', component: WorkersFormComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: 'expenses', component: ExpensesComponent, canActivate: [AuthGuard] },
  { path: 'sales', component: SalesComponent, canActivate: [AuthGuard] },
  { path: 'customers', component: CustomersComponent, canActivate: [AuthGuard] },
  { path: 'eggs-record-list', component: EggsRecordListComponent},
  { path: 'eggs-record-form', component: EggsRecordFormComponent},
  { path: 'add-customer', component: AddCustomerComponent },
  { path: 'edit-customer/:id', component: EditCustomerComponent },
  { path: 'mortalities', component: MortalitiesComponent},
  { path: 'details/:type', component: DetailViewComponent },
  { path: 'activities', component: ActivitiesComponent },
  { path: 'notification', component: NotificationComponent },
  { path: 'archieved-egg-records', component: ArchivedEggRecordsComponent },
  {path:'forgotpassword',component:ForgotpasswordComponent},
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
