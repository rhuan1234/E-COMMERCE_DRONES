import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router, provideRouter } from '@angular/router';
import { MinhaConta } from './minha-conta';

function token(claims: Record<string, unknown>): string {
  const base64 = (valor: object) => btoa(JSON.stringify(valor)).replace(/=+$/, '');
  return `${base64({ alg: 'none' })}.${base64(claims)}.assinatura`;
}

describe('MinhaConta', () => {
  let fixture: ComponentFixture<MinhaConta>;

  async function criar(grupos: string[]): Promise<HTMLElement> {
    localStorage.setItem('token', token({ upn: 'ana', groups: grupos, exp: Math.floor(Date.now() / 1000) + 3600 }));
    await TestBed.configureTestingModule({
      imports: [MinhaConta],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
    fixture = TestBed.createComponent(MinhaConta);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  afterEach(() => localStorage.clear());

  it('links every account section inside the store', async () => {
    const pagina = await criar(['CLIENTE']);
    const links = Array.from(pagina.querySelectorAll('.account-link')).map((a) => a.getAttribute('href'));

    expect(links).toEqual(['/minha-conta/dados', '/minha-conta/enderecos', '/minha-conta/seguranca', '/favoritos']);
    expect(pagina.querySelector('.admin-shortcut')).toBeNull();
  });

  it('shows the admin panel shortcut only to administrators', async () => {
    const pagina = await criar(['ADMIN']);

    expect(pagina.querySelector('.admin-shortcut')?.getAttribute('href')).toBe('/admin');
  });

  it('logs out and returns to the store front', async () => {
    const pagina = await criar(['CLIENTE']);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    (pagina.querySelector('.account-logout') as HTMLButtonElement).click();

    expect(localStorage.getItem('token')).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/']);
  });
});
