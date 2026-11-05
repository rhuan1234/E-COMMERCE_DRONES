import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AdminLayoutComponent } from './admin-layout';
import { AuthService } from '../../../../core/services/auth/AuthService';
import { PerfilService } from '../../../../core/services/PerfilService';

describe('AdminLayoutComponent', () => {
  let component: AdminLayoutComponent;
  let fixture: ComponentFixture<AdminLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLayoutComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { logout: () => {} },
        },
        {
          provide: PerfilService,
          useValue: { obterPerfil: () => of({ email: 'admin@skyline.com' }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLayoutComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with sidebar expanded and toggle collapsed state when clicking menu button', () => {
    expect(component.isCollapsed()).toBe(false);

    const toggleBtn: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('.toggle-sidebar-btn');
    expect(toggleBtn).toBeTruthy();

    toggleBtn?.click();
    fixture.detectChanges();
    expect(component.isCollapsed()).toBe(true);
    expect(fixture.nativeElement.querySelector('.admin-sidenav.collapsed')).toBeTruthy();

    toggleBtn?.click();
    fixture.detectChanges();
    expect(component.isCollapsed()).toBe(false);
    expect(fixture.nativeElement.querySelector('.admin-sidenav.collapsed')).toBeFalsy();
  });

  it('agrupa a navegação em Catálogo, Comercial e Acesso com todos os destinos do painel', () => {
    const el: HTMLElement = fixture.nativeElement;
    const titulos = Array.from(el.querySelectorAll('.nav-list p')).map((p) => p.textContent?.trim());
    expect(titulos).toEqual(['Catálogo', 'Comercial', 'Acesso']);
    expect(el.querySelectorAll('.nav-list a.nav-link').length).toBe(7);
  });

  it('mostra o e-mail do administrador carregado do perfil', () => {
    expect(fixture.nativeElement.querySelector('.profile-email')?.textContent).toContain('admin@skyline.com');
  });

  it('abre a gaveta no celular e fecha com Esc', () => {
    const el: HTMLElement = fixture.nativeElement;
    el.querySelector<HTMLButtonElement>('.mobile-menu-btn')?.click();
    fixture.detectChanges();

    expect(component.menuMobileAberto()).toBe(true);
    expect(el.querySelector('.admin-sidenav.open')).toBeTruthy();
    expect(el.querySelector('.admin-backdrop')).toBeTruthy();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(component.menuMobileAberto()).toBe(false);
    expect(el.querySelector('.admin-sidenav.open')).toBeNull();
    expect(el.querySelector('.admin-backdrop')).toBeNull();
  });

  it('fecha a gaveta ao tocar no fundo escurecido', () => {
    component.abrirMenuMobile();
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.admin-backdrop')?.click();
    fixture.detectChanges();

    expect(component.menuMobileAberto()).toBe(false);
  });

  it('mantém os rótulos visíveis na gaveta mesmo com a barra recolhida no desktop', () => {
    component.toggleSidebar();
    expect(component.mostrarRotulos()).toBe(false);

    component.abrirMenuMobile();
    expect(component.mostrarRotulos()).toBe(true);
  });
});
