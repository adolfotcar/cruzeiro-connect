import { Routes } from '@angular/router';
import { Login as LoginComponent } from './components/login/login';
import { Home as HomeComponent } from './components/home/home'; 
import { CustomerList as CustomerListComponent } from './components/customers/customer-list/customer-list';
import { CustomerForm as CustomerFormComponent } from './components/customers/customer-form/customer-form';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'home', component: HomeComponent, canActivate: [authGuard] },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    
    { path: 'customers', component: CustomerListComponent, canActivate: [authGuard]},
    { path: 'customer', component: CustomerFormComponent, canActivate: [authGuard] },
    { path: 'customer/:id', component: CustomerFormComponent, canActivate: [authGuard] }
];
