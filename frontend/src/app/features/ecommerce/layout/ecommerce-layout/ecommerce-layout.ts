import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/AuthService';
import { CarrinhoService } from '../../../../core/services/CarrinhoService';
import { ComparacaoService } from '../../../../core/services/ComparacaoService';
import { EcommerceCatalogSearchService } from '../../../../core/services/EcommerceCatalogSearchService';

@Component({
  imports: [FormsModule, MatDividerModule, MatIconModule, MatMenuModule, RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-ecommerce-layout',
  styleUrl: './ecommerce-layout.css',
  templateUrl: './ecommerce-layout.html',
})
export class EcommerceLayout {
  readonly auth = inject(AuthService);
  readonly carrinho = inject(CarrinhoService);
  readonly comparacao = inject(ComparacaoService);
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

  /** Página atual, para o login devolver o visitante ao mesmo lugar. */
  urlAtual(): string {
    return this.router.url;
  }

  sair(): void {
    this.auth.logout();
    void this.router.navigate(['/']);
  }
}
