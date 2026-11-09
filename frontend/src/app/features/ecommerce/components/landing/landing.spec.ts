import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Drone } from '../../../../core/models/drone/Drone';
import { AuthService } from '../../../../core/services/auth/AuthService';
import { DroneService } from '../../../../core/services/DroneService';
import { DEPOIMENTO_FICTICIO, Landing } from './landing';

function criarDrone(dados: Partial<Drone>): Drone {
  return Object.assign(new Drone(), dados);
}

describe('Landing', () => {
  const droneService = {
    findAllEcommerce: vi.fn(),
    obterUrlImagem: vi.fn().mockReturnValue('http://localhost:8080/img.png'),
  };
  const authService = { isAuthenticated: vi.fn().mockReturnValue(false) };

  async function criar(): Promise<ComponentFixture<Landing>> {
    await TestBed.configureTestingModule({
      imports: [Landing],
      providers: [
        provideRouter([]),
        { provide: DroneService, useValue: droneService },
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Landing);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    droneService.findAllEcommerce.mockReset();
    authService.isAuthenticated.mockReturnValue(false);
  });

  it('requests a single drone to feature, never the catalog listing', async () => {
    droneService.findAllEcommerce.mockReturnValue(of({ items: [], totalPages: 0 }));
    const fixture = await criar();

    expect(droneService.findAllEcommerce).toHaveBeenCalledWith(0, 1);
    expect(fixture.nativeElement.querySelector('.drone-card')).toBeNull();
    expect(fixture.nativeElement.querySelector('.filters-panel')).toBeNull();
  });

  it('shows the featured drone with its real specs and a link to its page', async () => {
    droneService.findAllEcommerce.mockReturnValue(of({
      items: [criarDrone({
        id: 7,
        nome: 'Drone vitrine',
        preco: 6499,
        imagens: [],
        tempoVooPratico: 34,
        alcanceTransmissao: 20000,
        pesoDecolagem: 249,
      })],
      totalPages: 1,
    }));
    const fixture = await criar();

    const ficha = fixture.nativeElement.querySelector('.featured-drone') as HTMLElement;
    expect(ficha.textContent).toContain('Drone vitrine');
    expect(ficha.textContent).toContain('6.499,00');

    // Os números da cena "ficha" vêm da API: 34 min, 20 km (20000 m) e 249 g.
    const numeros = Array.from(
      fixture.nativeElement.querySelectorAll('.ficha-numeros [data-fx="contar"]') as NodeListOf<HTMLElement>,
    ).map((el) => el.getAttribute('data-fx-fim'));
    expect(numeros).toEqual(['34', '20', '249']);
    expect(fixture.nativeElement.querySelector('.ficha-numeros')?.textContent).toContain('km de alcance');
    const link = fixture.nativeElement.querySelector('.featured-link') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/drone-info/7');
  });

  it('keeps the presentation without the featured card when the API fails', async () => {
    droneService.findAllEcommerce.mockReturnValue(throwError(() => new Error('offline')));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const fixture = await criar();

    expect(fixture.nativeElement.querySelector('.featured-drone')).toBeNull();
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Você ainda não voou.');
    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('.ficha-numeros')).toBeNull();
  });

  it('links each flight-type shortcut to the filtered catalog', async () => {
    droneService.findAllEcommerce.mockReturnValue(of({ items: [], totalPages: 0 }));
    const fixture = await criar();

    const links = Array.from(fixture.nativeElement.querySelectorAll('.flight-type-link') as NodeListOf<HTMLAnchorElement>);
    expect(links).toHaveLength(4);
    expect(links[0].getAttribute('href')).toBe('/home?tipo=primeiro-voo');
  });

  it('points the main call to action to the catalog', async () => {
    droneService.findAllEcommerce.mockReturnValue(of({ items: [], totalPages: 0 }));
    const fixture = await criar();

    const cta = fixture.nativeElement.querySelector('.landing-cta') as HTMLAnchorElement;
    expect(cta.getAttribute('href')).toBe('/home');
  });

  it('closes with a single catalog call and an account link for visitors', async () => {
    droneService.findAllEcommerce.mockReturnValue(of({ items: [], totalPages: 0 }));
    const fixture = await criar();

    const final = fixture.nativeElement.querySelector('.landing-cta-final') as HTMLAnchorElement;
    expect(final.getAttribute('href')).toBe('/home');
    expect(fixture.nativeElement.querySelector('a[href="/register"]')).not.toBeNull();
  });

  it('shows the illustrative testimonial and keeps the altimeter out of the accessibility tree', async () => {
    droneService.findAllEcommerce.mockReturnValue(of({ items: [], totalPages: 0 }));
    const fixture = await criar();

    const depoimento = fixture.nativeElement.querySelector('.cena-depoimento') as HTMLElement;
    expect(depoimento.textContent).toContain(DEPOIMENTO_FICTICIO.nome);
    expect(depoimento.querySelector('[data-fx="digitar"]')?.textContent).toContain('coisa de profissional');
    expect(fixture.nativeElement.querySelector('.altimetro')?.getAttribute('aria-hidden')).toBe('true');
  });
});
