import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Drone } from '../../../../core/models/drone/Drone';
import { AuthService } from '../../../../core/services/auth/AuthService';
import { DroneService } from '../../../../core/services/DroneService';
import { FavoritoService } from '../../../../core/services/FavoritoService';
import { DroneInfo } from './drone-info';

describe('DroneInfo', () => {
  let fixture: ComponentFixture<DroneInfo>;
  let component: DroneInfo;
  let router: Router;
  const drone = Object.assign(new Drone(), {
    id: 17,
    nome: 'Drone de detalhes',
    marca: { id: 1, nome: 'Marca de teste' },
    modelo: { id: 2, nome: 'Modelo de teste', marcaId: 1 },
    preco: 4500,
    quantidadeDisponivel: 3,
    ativa: true,
    tempoVooPratico: 40,
    pesoDecolagem: 800,
    altitudeMaxima: 500,
    velocidadeMaxima: 60,
    alcanceTransmissao: 10000,
    possuiCamera: true,
    quantidadeMotores: 4,
    comControleRemoto: true,
    controladoPorAplicativo: true,
    quantidadeBaterias: 2,
    duracaoBateria: '40 minutos',
    frequenciaWifi: '5.8 GHz',
    possuiGPS: true,
    camera: {
      id: 5,
      modeloId: 2,
      marcaId: 1,
      resolucao: '4K',
      zoom: 3,
      estabilizacao: true,
      fps: '60',
    },
    imagens: [
      { id: 8, caminho: '/imagem-2.jpg', principal: false, ordem: 2 },
      { id: 7, caminho: '/imagem-1.jpg', principal: true, ordem: 1 },
    ],
  });
  const droneService = {
    findByIdEcommerce: vi.fn().mockReturnValue(of(drone)),
    obterUrlImagem: vi.fn((imagem: { caminho: string }) => `http://localhost:8080${imagem.caminho}`),
  };
  const favoritoService = {
    listar: vi.fn().mockReturnValue(of({
      items: [],
      page: 0,
      pageSize: 100,
      totalItems: 0,
      totalPages: 0,
    })),
    adicionar: vi.fn().mockReturnValue(of('Drone favoritado')),
    remover: vi.fn().mockReturnValue(of('Drone removido')),
  };
  const authService = { isAuthenticated: vi.fn().mockReturnValue(true) };

  beforeEach(async () => {
    droneService.findByIdEcommerce.mockReturnValue(of(drone));
    favoritoService.listar.mockReturnValue(of({
      items: [],
      page: 0,
      pageSize: 100,
      totalItems: 0,
      totalPages: 0,
    }));
    favoritoService.adicionar.mockReturnValue(of('Drone favoritado'));
    favoritoService.remover.mockReturnValue(of('Drone removido'));
    authService.isAuthenticated.mockReturnValue(true);

    await TestBed.configureTestingModule({
      imports: [DroneInfo],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '17' })),
            snapshot: { paramMap: convertToParamMap({ id: '17' }) },
          },
        },
        { provide: DroneService, useValue: droneService },
        { provide: FavoritoService, useValue: favoritoService },
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(DroneInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the selected drone and renders its full technical information', () => {
    expect(droneService.findByIdEcommerce).toHaveBeenCalledWith(17);
    expect(fixture.nativeElement.textContent).toContain('Drone de detalhes');
    expect(fixture.nativeElement.textContent).toContain('Marca de teste');
    expect(fixture.nativeElement.textContent).toContain('Modelo de teste');
    expect(fixture.nativeElement.textContent).toContain('40 min');
    expect(fixture.nativeElement.textContent).toContain('10.000 m');
    expect(fixture.nativeElement.textContent).toContain('4K');
    expect(fixture.nativeElement.textContent).toContain('5.8 GHz');
    expect(fixture.nativeElement.textContent).toContain('40 minutos');
  });

  it('shows every product image and changes the main image when a thumbnail is selected', () => {
    const thumbnails = fixture.nativeElement.querySelectorAll('.image-thumbnails button') as NodeListOf<HTMLButtonElement>;
    expect(thumbnails).toHaveLength(2);
    expect(component.imagemPrincipal()?.id).toBe(7);

    thumbnails[1].click();
    fixture.detectChanges();

    expect(component.imagemPrincipal()?.id).toBe(8);
    expect(fixture.nativeElement.querySelector('.main-image img')?.getAttribute('src'))
      .toBe('http://localhost:8080/imagem-2.jpg');
  });

  it('adds the drone to favorites and updates the button only after success', () => {
    const favoriteButton = fixture.nativeElement.querySelector('.favorite-action') as HTMLButtonElement;
    expect(favoriteButton.getAttribute('aria-pressed')).toBe('false');
    favoriteButton.click();
    fixture.detectChanges();

    expect(favoritoService.adicionar).toHaveBeenCalledWith(17);
    expect(favoriteButton.getAttribute('aria-pressed')).toBe('true');
    expect(fixture.nativeElement.textContent).toContain('Produto adicionado aos favoritos.');
  });

  it('redirects an unauthenticated visitor to login when they favorite the drone', () => {
    authService.isAuthenticated.mockReturnValue(false);
    favoritoService.adicionar.mockClear();
    component.alternarFavorito();

    expect(router.navigate).toHaveBeenCalledWith(
      ['/login'],
      { queryParams: { returnUrl: '/drone-info/17' } },
    );
    expect(favoritoService.adicionar).not.toHaveBeenCalled();
  });

  it('shows an explicit message when the cart action is not available yet', () => {
    const cartButton = fixture.nativeElement.querySelector('.cart-action') as HTMLButtonElement;
    cartButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('O carrinho ainda não está disponível.');
  });

  it('shows a not-found state when the public detail endpoint returns 404', () => {
    droneService.findByIdEcommerce.mockReturnValueOnce(throwError(() => ({ status: 404 })));
    const errorFixture = TestBed.createComponent(DroneInfo);
    errorFixture.detectChanges();

    expect(errorFixture.nativeElement.querySelector('[role="alert"]')?.textContent)
      .toContain('não foi encontrado');
  });
});
