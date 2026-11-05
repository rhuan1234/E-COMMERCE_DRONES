import { ChangeDetectorRef, Component, computed, DestroyRef, HostListener, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../../core/services/auth/AuthService';
import { PerfilService } from '../../../../core/services/PerfilService';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

interface NavGroup {
  titulo: string;
  itens: NavItem[];
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatTooltipModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private perfilService = inject(PerfilService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  emailUsuario = '';
  erroCarregamentoEmail = false;

  /** Barra lateral recolhida (somente ícones) no desktop. */
  isCollapsed = signal(false);
  /** Gaveta de navegação aberta em telas menores que `lg`. */
  menuMobileAberto = signal(false);
  /** Rótulos visíveis: barra expandida no desktop ou gaveta aberta no celular. */
  mostrarRotulos = computed(() => !this.isCollapsed() || this.menuMobileAberto());

  readonly navGroups: NavGroup[] = [
    {
      titulo: 'Catálogo',
      itens: [
        { label: 'Drones', route: '/admin/drones', icon: 'flight_takeoff' },
        { label: 'Marcas', route: '/admin/marcas', icon: 'branding_watermark' },
        { label: 'Modelos', route: '/admin/modelos', icon: 'category' },
        { label: 'Câmeras', route: '/admin/cameras', icon: 'videocam' },
      ],
    },
    {
      titulo: 'Comercial',
      itens: [
        { label: 'Promoções', route: '/admin/promocoes', icon: 'local_offer' },
        { label: 'Fornecedores', route: '/admin/fornecedores', icon: 'business' },
      ],
    },
    {
      titulo: 'Acesso',
      itens: [
        { label: 'Administradores', route: '/admin/administradores', icon: 'admin_panel_settings' },
      ],
    },
  ];

  /** Lista plana, mantida para quem precisa percorrer todos os destinos. */
  readonly navItems: NavItem[] = this.navGroups.flatMap((grupo) => grupo.itens);

  ngOnInit(): void {
    this.perfilService.obterPerfil().subscribe({
      next: (perfil) => {
        this.emailUsuario = perfil.email;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.erroCarregamentoEmail = true;
        this.cdr.markForCheck();
        console.error('Erro ao carregar e-mail do usuário', err);
      },
    });

    this.router.events
      .pipe(
        filter((evento) => evento instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.menuMobileAberto.set(false));
  }

  get iniciais(): string {
    const base = (this.emailUsuario || 'A').split('@')[0];
    return base.slice(0, 2).toUpperCase();
  }

  toggleSidebar(): void {
    this.isCollapsed.update((collapsed) => !collapsed);
  }

  abrirMenuMobile(): void {
    this.menuMobileAberto.set(true);
  }

  fecharMenuMobile(): void {
    this.menuMobileAberto.set(false);
  }

  @HostListener('document:keydown.escape')
  aoPressionarEsc(): void {
    this.fecharMenuMobile();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
