import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AvaliacaoService } from '../../../../core/services/AvaliacaoService';
import { Drone } from '../../../../core/models/drone/Drone';
import { AuthService } from '../../../../core/services/auth/AuthService';
import { CarrinhoService } from '../../../../core/services/CarrinhoService';
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
  const avaliacaoService = {
    listarPorDrone: vi.fn().mockReturnValue(of({
      items: [],
      page: 0,
      pageSize: 5,
      totalItems: 0,
      totalPages: 0,
    })),
    criar: vi.fn().mockReturnValue(of({
      id: 1,
      nota: 5,
      comentario: 'Ótimo drone',
      nomeCliente: 'Lucas Silva',
      dataAvaliacao: '2026-11-09T12:00:00',
      usuarioId: 2,
      droneId: 17,
    })),
  };
  const authService = { isAuthenticated: vi.fn().mockReturnValue(true) };

  beforeEach(async () => {
    localStorage.removeItem('skyline.carrinho');
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
    avaliacaoService.listarPorDrone.mockClear();
    avaliacaoService.criar.mockClear();
    avaliacaoService.listarPorDrone.mockReturnValue(of({
      items: [],
      page: 0,
      pageSize: 5,
      totalItems: 0,
      totalPages: 0,
    }));
    avaliacaoService.criar.mockReturnValue(of({
      id: 1,
      nota: 5,
      comentario: 'Ótimo drone',
      nomeCliente: 'Lucas Silva',
      dataAvaliacao: '2026-11-09T12:00:00',
      usuarioId: 2,
      droneId: 17,
    }));
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
        { provide: AvaliacaoService, useValue: avaliacaoService },
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

  it('loads the first five reviews and shows an empty state when none exist', () => {
    expect(avaliacaoService.listarPorDrone).toHaveBeenCalledWith(17, 0, 5);
    expect(fixture.nativeElement.querySelector('.review-state')?.textContent)
      .toContain('Ainda não há avaliações');
  });

  it('requests the next page of five and renders its reviews', () => {
    avaliacaoService.listarPorDrone.mockReturnValueOnce(of({
      items: [{
        id: 6,
        nota: 4,
        comentario: 'Bom produto',
        nomeCliente: 'Maria Souza',
        dataAvaliacao: '2026-11-08T12:00:00',
        usuarioId: 2,
        droneId: 17,
      }],
      page: 1,
      pageSize: 5,
      totalItems: 6,
      totalPages: 2,
    }));

    component.carregarPaginaAvaliacoes(1);
    fixture.detectChanges();

    expect(avaliacaoService.listarPorDrone).toHaveBeenLastCalledWith(17, 1, 5);
    expect(fixture.nativeElement.querySelector('.review-card')?.textContent).toContain('Bom produto');
    expect(fixture.nativeElement.querySelector('.review-card')?.textContent).toContain('Maria Souza');
    expect(fixture.nativeElement.querySelector('.review-pagination')?.textContent).toContain('Página 2 de 2');
  });

  it('submits the selected rating and comment for the current drone', () => {
    component.selecionarNota(5);
    component.avaliacaoForm.controls.comentario.setValue(' Excelente compra ');
    component.enviarAvaliacao();
    fixture.detectChanges();

    expect(avaliacaoService.criar).toHaveBeenCalledWith({
      nota: 5,
      comentario: 'Excelente compra',
      droneId: 17,
    });
    expect(fixture.nativeElement.textContent).toContain('Sua avaliação foi publicada.');
  });

  it('renders the unknown label when the customer has no saved profile name', () => {
    component.avaliacoes.set([{
      id: 7,
      nota: 3,
      comentario: 'Comentário sem nome no perfil',
      nomeCliente: '<desconhecido>',
      dataAvaliacao: '2026-11-08T12:00:00',
      usuarioId: 3,
      droneId: 17,
    }]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.review-card h3')?.textContent).toBe('<desconhecido>');
  });

  it('requires login before a visitor can submit a review', () => {
    authService.isAuthenticated.mockReturnValue(false);
    component.selecionarNota(5);
    component.enviarAvaliacao();

    expect(router.navigate).toHaveBeenCalledWith(
      ['/login'],
      { queryParams: { returnUrl: '/drone-info/17' } },
    );
    expect(avaliacaoService.criar).not.toHaveBeenCalled();
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

  it('adds the current drone to the shared cart', () => {
    const cartButton = fixture.nativeElement.querySelector('.cart-action') as HTMLButtonElement;
    cartButton.click();
    fixture.detectChanges();

    expect(TestBed.inject(CarrinhoService).itens()).toHaveLength(1);
    expect(TestBed.inject(CarrinhoService).itens()[0].droneId).toBe(17);
    expect(fixture.nativeElement.textContent).toContain('foi adicionado ao carrinho.');
    expect(fixture.nativeElement.querySelector('.inline-notice a')?.getAttribute('href')).toBe('/carrinho');
  });

  it('shows a not-found state when the public detail endpoint returns 404', () => {
    droneService.findByIdEcommerce.mockReturnValueOnce(throwError(() => ({ status: 404 })));
    const errorFixture = TestBed.createComponent(DroneInfo);
    errorFixture.detectChanges();

    expect(errorFixture.nativeElement.querySelector('[role="alert"]')?.textContent)
      .toContain('não foi encontrado');
  });
});
