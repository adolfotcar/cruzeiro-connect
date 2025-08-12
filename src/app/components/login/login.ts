import { Component, OnInit } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.sass'
})
export class Login implements OnInit {

  public email: string = '';
  public password: string = '';
  public doingLogin: boolean = false;
  public loginFailed: boolean = false;


  constructor(private router: Router, private snack: MatSnackBar, private authSvc: AuthService) {}

  ngOnInit(): void {
    this.authSvc.user$.subscribe(user => {
      if (user) {
        this.router.navigate(['/home']);
      }
    });
  }

  public doLogin(){
    this.doingLogin = true;
    this.authSvc.signIn(this.email, this.password)
      .then((userCredential) => {
        this.doingLogin = false;
        this.router.navigate(['/home']);
      })
      .catch((error) => {
        this.doingLogin = false;
        this.loginFailed = true;
        this.snack.open('Erro no login', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      });
  }

}
