import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from "@angular/material/toolbar";
import { AuthService } from './services/auth';
import { Observable } from 'rxjs';
import { User } from 'firebase/auth';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule, AsyncPipe, MatIconModule, MatButtonModule, MatTooltipModule, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.sass'
})
export class App {
  protected readonly title = signal('cruzeiro-connect');
  protected readonly user$: Observable<User | null>;

  constructor(private authSvc: AuthService, private router: Router) {
    this.user$ = this.authSvc.user$;
  }

  public signOut(): void {
    this.authSvc.signOut().then(() => this.router.navigate(['/login']));
  }
  
}
