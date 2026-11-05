import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router, provideRouter } from '@angular/router';
import { EcommerceCatalogSearchService } from '../../../../core/services/EcommerceCatalogSearchService';
import { EcommerceLayout } from './ecommerce-layout';

function token(claims: Record<string, unknown>): string {
  const base64 = (valor: object) => btoa(JSON.stringify(valor)).replace(/=+$/, '');
  return `${base64({ alg: 'none' })}.${base64(claims)}.assinatura`;
}

const futuro = Math.floor(Date.now() / 1000) + 3600;

describe('EcommerceLayout', () => {
  let fixture: ComponentFixture<EcommerceLayout>;

  async function criar(jwt: string | null): Promise<HTMLElement> {
    localStorage.clear();
    sessionStorage.clear();
    if (jwt) {
      localStorage.setItem('token', jwt);
    }
    await TestBed.configureTestingModule({
      imports: [EcommerceLayout],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(EcommerceLayout);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  afterEach(() => localStorage.clear());

  it('submits the search term to the catalog and navigates to the home', async () => {
    const header = await criar(null);
    const router = TestBed.inject(Router);
    const search = TestBed.inject(EcommerceCatalogSearchService);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const searchSpy = vi.spyOn(search, 'search');
    const input = header.querySelector('#store-search') as HTMLInputElement;
    const form = header.querySelector('.search-form') as HTMLFormElement;

    input.value = '  Mavic  ';
    input.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    expect(searchSpy).toHaveBeenCalledWith('Mavic');
    expect(navigateSpy).toHaveBeenCalledWith(['/home']);
  });

  it('points the compare link to its own page instead of a catalog anchor', async () => {
    const header = await criar(null);
    const link = Array.from(header.querySelectorAll('nav a'))
      .find((a) => a.textContent?.includes('Comparar')) as HTMLAnchorElement;

    expect(link.getAttribute('href')).toBe('/comparar');
  });

  it('offers a login link to visitors instead of the admin profile', async () => {
    const header = await criar(null);

    expect(header.querySelector('.login-link')?.getAttribute('href')).toContain('/login?returnUrl=');
    expect(header.querySelector('.account-trigger')).toBeNull();
    expect(header.querySelector('.admin-link')).toBeNull();
  });

  it('shows the account menu to customers without the admin shortcut', async () => {
    const header = await criar(token({ upn: 'maria', groups: ['CLIENTE'], exp: futuro }));

    expect(header.querySelector('.account-trigger')?.textContent).toContain('maria');
    expect(header.querySelector('.admin-link')).toBeNull();
    expect(header.querySelector('a[href="/perfil"]')).toBeNull();
  });

  it('gives administrators a direct link to the admin panel', async () => {
    const header = await criar(token({ upn: 'admin', groups: ['ADMIN'], exp: futuro }));

    expect(header.querySelector('.admin-link')?.getAttribute('href')).toBe('/admin');

    (header.querySelector('.account-trigger') as HTMLButtonElement).click();
    fixture.detectChanges();
    const menu = document.querySelector('.account-menu') as HTMLElement;
    expect(menu.querySelector('a[href="/minha-conta/dados"]')).not.toBeNull();
    expect(menu.querySelector('a[href="/admin"]')).not.toBeNull();
  });
});
