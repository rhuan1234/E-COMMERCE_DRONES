import { Component, DestroyRef, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../../../core/services/auth/AuthService';
import { CarrinhoService } from '../../../../core/services/CarrinhoService';
import { ComparacaoService } from '../../../../core/services/ComparacaoService';
import { EcommerceCatalogSearchService } from '../../../../core/services/EcommerceCatalogSearchService';
import { DroneMarkComponent } from '../../../../shared/components/drone-mark/drone-mark';

@Component({
  imports: [DroneMarkComponent, FormsModule, MatDividerModule, MatIconModule, MatMenuModule, RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-ecommerce-layout',
  styleUrl: './ecommerce-layout.css',
  templateUrl: './ecommerce-layout.html',
})
export class EcommerceLayout {
  private readonly destroyRef = inject(DestroyRef);
  readonly auth = inject(AuthService);
  readonly carrinho = inject(CarrinhoService);
  readonly comparacao = inject(ComparacaoService);
  readonly menuMobileAberto = signal(false);
  readonly buscaMobileAberta = signal(false);
  termoBusca = '';

  private readonly campoBusca = viewChild<ElementRef<HTMLInputElement>>('campoBusca');

  constructor(
    private readonly router: Router,
    private readonly catalogSearch: EcommerceCatalogSearchService,
  ) {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.menuMobileAberto.set(false);
      });
  }

  @HostListener('document:keydown.escape')
  fecharOverlays(): void {
    if (this.menuMobileAberto()) {
      this.menuMobileAberto.set(false);
    }
    if (this.buscaMobileAberta()) {
      this.buscaMobileAberta.set(false);
    }
  }

  alternarMenuMobile(): void {
    const proximo = !this.menuMobileAberto();
    this.menuMobileAberto.set(proximo);
    if (proximo) {
      this.buscaMobileAberta.set(false);
    }
  }

  alternarBuscaMobile(): void {
    const proximo = !this.buscaMobileAberta();
    this.buscaMobileAberta.set(proximo);
    if (proximo) {
      this.menuMobileAberto.set(false);
      queueMicrotask(() => this.campoBusca()?.nativeElement.focus());
    }
  }

  fecharMenuMobile(): void {
    this.menuMobileAberto.set(false);
  }

  pesquisar(): void {
    const termo = this.termoBusca.trim();
    this.termoBusca = termo;
    this.buscaMobileAberta.set(false);
    this.menuMobileAberto.set(false);
    this.catalogSearch.search(termo);
    void this.router.navigate(['/home']);
  }

  /** Página atual, para o login devolver o visitante ao mesmo lugar. */
  urlAtual(): string {
    return this.router.url;
  }

  sair(): void {
    this.menuMobileAberto.set(false);
    this.auth.logout();
    void this.router.navigate(['/']);
  }
}
