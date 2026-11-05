import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { Drone } from '../../../../core/models/drone/Drone';
import { DroneService } from '../../../../core/services/DroneService';
import { EcommerceCatalogSearchService } from '../../../../core/services/EcommerceCatalogSearchService';
import { FavoritoService } from '../../../../core/services/FavoritoService';
import { AuthService } from '../../../../core/services/auth/AuthService';
import { ComparacaoService } from '../../../../core/services/ComparacaoService';
import { Home } from './home';

function criarDrone(dados: Pick<Drone, 'id' | 'nome' | 'preco' | 'imagens'> & Partial<Drone>): Drone {
  return Object.assign(new Drone(), dados);
}

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  const droneService = {
    findAllEcommerce: vi.fn().mockReturnValue(of({ items: [], totalPages: 1 })),
  };
  const favoritoService = {
    listar: vi.fn().mockReturnValue(of({
      items: [],
      page: 0,
      pageSize: 100,
      totalItems: 0,
      totalPages: 0,
    })),
    adicionar: vi.fn().mockReturnValue(of('ok')),
    remover: vi.fn().mockReturnValue(of('ok')),
  };
  const authService = { isAuthenticated: vi.fn().mockReturnValue(true) };
  let router: Router;

  beforeEach(async () => {
    sessionStorage.clear();
    droneService.findAllEcommerce.mockClear();
    favoritoService.listar.mockClear();
    favoritoService.adicionar.mockClear();
    favoritoService.remover.mockClear();
    authService.isAuthenticated.mockReturnValue(true);
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        { provide: DroneService, useValue: droneService },
        { provide: FavoritoService, useValue: favoritoService },
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a card for each drone in the response', () => {
    component.drones.set([criarDrone({
      id: 1,
      nome: 'Drone de teste',
      preco: 1200,
      imagens: [],
    })]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.drone-card')).toHaveLength(1);
  });

  it('renders drones when the request completes without user interaction', async () => {
    const response$ = new Subject<{ items: Drone[]; totalPages: number }>();
    droneService.findAllEcommerce.mockReturnValueOnce(response$);

    const asyncFixture = TestBed.createComponent(Home);
    asyncFixture.autoDetectChanges();
    response$.next({
      items: [criarDrone({
        id: 2,
        nome: 'Drone carregado',
        preco: 1500,
        imagens: [],
      })],
      totalPages: 1,
    });

    await asyncFixture.whenStable();
    expect(asyncFixture.nativeElement.querySelectorAll('.drone-card')).toHaveLength(1);
  });

  it('renders the filters next to the product catalog in the home', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.filters-panel')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.products-area')).not.toBeNull();
  });

  it('only requests the combined filters after clicking apply', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.filter-option') as NodeListOf<HTMLButtonElement>;
    const alcance = Array.from(buttons)
      .find((button) => button.textContent?.includes('Acima de 50m até 10km'));
    const gps = fixture.nativeElement.querySelector('.feature-option input') as HTMLInputElement | null;
    const applyButton = fixture.nativeElement.querySelector('.apply-filters') as HTMLButtonElement | null;
    expect(alcance).toBeDefined();
    expect(gps).not.toBeNull();
    expect(applyButton).not.toBeNull();

    alcance?.click();
    if (gps) {
      gps.checked = true;
      gps.dispatchEvent(new Event('change'));
    }

    expect(droneService.findAllEcommerce).toHaveBeenCalledTimes(1);
    applyButton?.click();

    expect(droneService.findAllEcommerce).toHaveBeenLastCalledWith(
      0,
      12,
      expect.objectContaining({
        alcance: ['ATE_10KM'],
        possuiGPS: true,
      }),
    );
  });

  it('searches both drone name and model and displays unique results', async () => {
    const namedDrone = criarDrone({
      id: 3,
      nome: 'Drone encontrado pelo nome',
      preco: 2000,
      imagens: [],
    });
    const modelDrone = criarDrone({
      id: 4,
      nome: 'Drone encontrado pelo modelo',
      preco: 2500,
      imagens: [],
    });
    droneService.findAllEcommerce
      .mockReturnValueOnce(of({ items: [namedDrone], totalPages: 1 }))
      .mockReturnValueOnce(of({ items: [modelDrone], totalPages: 1 }));

    TestBed.inject(EcommerceCatalogSearchService).search('Mavic');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(droneService.findAllEcommerce).toHaveBeenNthCalledWith(
      2,
      0,
      12,
      expect.objectContaining({ nome: 'Mavic' }),
    );
    expect(droneService.findAllEcommerce).toHaveBeenNthCalledWith(
      3,
      0,
      12,
      expect.objectContaining({ modelo: 'Mavic' }),
    );
    expect(fixture.nativeElement.querySelectorAll('.drone-card')).toHaveLength(2);
  });

  it('adds and removes a favorite from the drone card', () => {
    const drone = criarDrone({ id: 21, nome: 'Drone favorito', preco: 3000, imagens: [] });
    component.drones.set([drone]);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.favorite-button') as HTMLButtonElement;
    expect(button.getAttribute('aria-pressed')).toBe('false');
    button.click();
    fixture.detectChanges();

    expect(favoritoService.adicionar).toHaveBeenCalledWith(21);
    expect(button.getAttribute('aria-pressed')).toBe('true');

    button.click();
    fixture.detectChanges();

    expect(favoritoService.remover).toHaveBeenCalledWith(21);
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('redirects unauthenticated users to login before adding a favorite', () => {
    authService.isAuthenticated.mockReturnValue(false);
    component.alternarFavorito(criarDrone({
      id: 22,
      nome: 'Drone protegido',
      preco: 3200,
      imagens: [],
    }));

    expect(router.navigate).toHaveBeenCalledWith(
      ['/login'],
      { queryParams: { returnUrl: '/home' } },
    );
    expect(favoritoService.adicionar).not.toHaveBeenCalled();
  });

  it('links each drone card to its product detail page', () => {
    component.drones.set([criarDrone({
      id: 23,
      nome: 'Drone detalhado',
      preco: 4500,
      imagens: [],
    })]);
    fixture.detectChanges();

    const detailLink = fixture.nativeElement.querySelector('.drone-card-link') as HTMLAnchorElement;
    expect(detailLink.getAttribute('href')).toBe('/drone-info/23');
    expect(detailLink.getAttribute('aria-label')).toBe('Ver detalhes de Drone detalhado');
  });

  it('applies a flight-type shortcut as catalog filters and marks it as active', () => {
    const cinema = component.tiposDeVoo.find((tipo) => tipo.id === 'cinema');
    expect(cinema).toBeDefined();
    const botao = Array.from(fixture.nativeElement.querySelectorAll('.flight-type') as NodeListOf<HTMLButtonElement>)
      .find((button) => button.textContent?.includes('Fotografia e cinema'));

    botao?.click();
    fixture.detectChanges();

    expect(droneService.findAllEcommerce).toHaveBeenLastCalledWith(
      0,
      12,
      expect.objectContaining({
        camera: ['4K', 'ESTABILIZACAO'],
        autonomia: ['ACIMA_40_MIN'],
      }),
    );
    expect(botao?.getAttribute('aria-pressed')).toBe('true');

    component.limparFiltros();
    fixture.detectChanges();
    expect(botao?.getAttribute('aria-pressed')).toBe('false');
  });

  it('opens the catalog with a flight-type shortcut from the query string', async () => {
    TestBed.resetTestingModule();
    droneService.findAllEcommerce.mockClear();
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        { provide: DroneService, useValue: droneService },
        { provide: FavoritoService, useValue: favoritoService },
        { provide: AuthService, useValue: authService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({ tipo: 'longo-alcance' }) } },
        },
      ],
    }).compileComponents();

    const atalhoFixture = TestBed.createComponent(Home);
    atalhoFixture.detectChanges();
    await atalhoFixture.whenStable();
    atalhoFixture.detectChanges();

    expect(droneService.findAllEcommerce).toHaveBeenCalledTimes(1);
    expect(droneService.findAllEcommerce).toHaveBeenCalledWith(
      0,
      12,
      expect.objectContaining({ alcance: ['DE_20_A_50KM', 'ACIMA_50KM'] }),
    );
    const ativo = atalhoFixture.nativeElement.querySelector('.flight-type[aria-pressed="true"]') as HTMLButtonElement;
    expect(ativo.textContent).toContain('Longo alcance');
  });

  it('no longer renders the comparison table inside the catalog', () => {
    component.drones.set([
      criarDrone({ id: 41, nome: 'Leve', preco: 5000, imagens: [] }),
      criarDrone({ id: 42, nome: 'Autonomo', preco: 9000, imagens: [] }),
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.comparison-table')).toBeNull();
    expect(fixture.nativeElement.querySelector('#comparar')).toBeNull();
  });

  it('selects drones for comparison and shows a tray linking to the comparison page', () => {
    component.drones.set([
      criarDrone({ id: 41, nome: 'Leve', preco: 5000, imagens: [] }),
      criarDrone({ id: 42, nome: 'Autonomo', preco: 9000, imagens: [] }),
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.compare-tray')).toBeNull();

    const toggles = fixture.nativeElement.querySelectorAll('.compare-toggle') as NodeListOf<HTMLButtonElement>;
    toggles[0].click();
    toggles[1].click();
    fixture.detectChanges();

    expect(TestBed.inject(ComparacaoService).itens().map((item) => item.id)).toEqual([41, 42]);
    expect(toggles[0].getAttribute('aria-pressed')).toBe('true');
    const tray = fixture.nativeElement.querySelector('.compare-tray') as HTMLElement;
    expect(tray.textContent).toContain('Leve');
    expect(tray.textContent).toContain('2/3');
    expect((tray.querySelector('.compare-now') as HTMLAnchorElement).getAttribute('href')).toBe('/comparar');

    toggles[0].click();
    fixture.detectChanges();
    expect(toggles[0].getAttribute('aria-pressed')).toBe('false');
    expect(TestBed.inject(ComparacaoService).quantidade()).toBe(1);
  });

  it('explains the limit instead of adding a fourth drone', () => {
    const drones = [51, 52, 53, 54].map((id) => criarDrone({ id, nome: `Drone ${id}`, preco: 1000, imagens: [] }));
    drones.forEach((drone) => component.alternarComparacao(drone));
    fixture.detectChanges();

    expect(TestBed.inject(ComparacaoService).quantidade()).toBe(3);
    expect(component.mensagemComparacao()).toContain('Remova um para incluir Drone 54');
  });
});
