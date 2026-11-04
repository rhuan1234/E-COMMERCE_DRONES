import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  imports: [MatIconModule, RouterLink, RouterOutlet],
  selector: 'app-ecommerce-layout',
  styleUrl: './ecommerce-layout.css',
  templateUrl: './ecommerce-layout.html',
})
export class EcommerceLayout {}
