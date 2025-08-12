import { Routes } from '@angular/router';
import { Login as LoginComponent } from './components/login/login';
import { Home as HomeComponent } from './components/home/home'; 
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'home', component: HomeComponent, canActivate: [authGuard] },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
];
