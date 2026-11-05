import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Drone } from '../../../../core/models/drone/Drone';
import { AuthService } from '../../../../core/services/auth/AuthService';
import { DroneService } from '../../../../core/services/DroneService';
import { Landing } from './landing';

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
    expect(ficha.textContent).toContain('34 min');
    expect(ficha.textContent).toContain('20 km');
    expect(ficha.textContent).toContain('249 g');
    const link = fixture.nativeElement.querySelector('.featured-link') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/drone-info/7');
  });

  it('keeps the presentation without the featured card when the API fails', async () => {
    droneService.findAllEcommerce.mockReturnValue(throwError(() => new Error('offline')));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const fixture = await criar();

    expect(fixture.nativeElement.querySelector('.featured-drone')).toBeNull();
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Voe mais longe.');
    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
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
});
