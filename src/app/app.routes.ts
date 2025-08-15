import { Routes } from '@angular/router';
import { Login as LoginComponent } from './components/login/login';
import { Home as HomeComponent } from './components/home/home'; 
import { CitizenList as CitizenListComponent } from './components/citizens/citizens-list/citizens-list';
import { CitizenForm as CitizenFormComponent } from './components/citizens/citizen-form/citizen-form';
import { UsersList as UserListComponent } from './components/users/users-list/users-list';
import { UserForm as UserFormComponent } from './components/users/user-form/user-form';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'home', component: HomeComponent, canActivate: [authGuard] },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    
    { path: 'citizens', component: CitizenListComponent, canActivate: [authGuard]},
    { path: 'citizen', component: CitizenFormComponent, canActivate: [authGuard] },
    { path: 'citizen/:id', component: CitizenFormComponent, canActivate: [authGuard] },

    { path: 'users', component: UserListComponent, canActivate: [authGuard]},
    { path: 'user', component: UserFormComponent, canActivate: [authGuard] },
    { path: 'user/:id', component: UserFormComponent, canActivate: [authGuard] }
];
