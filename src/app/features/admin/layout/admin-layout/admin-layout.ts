import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon'; 
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../../core/services/auth/AuthService';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive, 
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  navItems: NavItem[] = [
    { label: 'Drones', route: '/drones', icon: 'flight_takeoff' },
    { label: 'Câmeras', route: '/cameras', icon: 'videocam' },
    { label: 'Fornecedores', route: '/fornecedores', icon: 'business' },
    { label: 'Administradores', route: '/administradores', icon: 'admin_panel_settings' },
    { label: 'Promoções', route: '/promocoes', icon: 'local_offer' },
    { label: 'Perfil', route: '/perfil', icon: 'person' },
  ];

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}