import { Component, HostListener, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'app-home',
  imports: [MatCardModule, RouterLink, MatIconModule, MatGridListModule],
  templateUrl: './home.html',
  styleUrl: './home.sass'
})
export class Home implements OnInit {

  // Number of columns to display based on screen size
  // starting with 4 columns for desktop and then will be calculated on resize
  public cols: number = 4;
  
  ngOnInit(): void {
    this.updateCols(window.innerWidth);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updateCols(event.target.innerWidth);
  }

  private updateCols(width: number): void {
    if (width < 600) {
      this.cols = 2; // On mobile
    } else if (width < 960) {
      this.cols = 3; // On tablets
    } else {
      this.cols = 4; // On desktop
    }
  }
}
