import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { EcommerceCatalogSearchService } from '../../../../core/services/EcommerceCatalogSearchService';

@Component({
  imports: [FormsModule, MatIconModule, RouterLink, RouterOutlet],
  selector: 'app-ecommerce-layout',
  styleUrl: './ecommerce-layout.css',
  templateUrl: './ecommerce-layout.html',
})
export class EcommerceLayout {
  termoBusca = '';

  constructor(
    private readonly router: Router,
    private readonly catalogSearch: EcommerceCatalogSearchService,
  ) {}

  pesquisar(): void {
    const termo = this.termoBusca.trim();
    this.termoBusca = termo;
    this.catalogSearch.search(termo);
    void this.router.navigate(['/home']);
  }
}
