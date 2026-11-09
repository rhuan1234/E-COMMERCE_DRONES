import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CheckoutRequest, CheckoutResponse, MetodoPagamentoCheckout } from '../../../../core/models/checkout/Checkout';
import { Drone } from '../../../../core/models/drone/Drone';
import { Endereco } from '../../../../core/models/endereco/Endereco';
import { AuthService } from '../../../../core/services/auth/AuthService';
import { CarrinhoService } from '../../../../core/services/CarrinhoService';
import { CheckoutApiService } from '../../../../core/services/CheckoutApiService';
import { DroneService } from '../../../../core/services/DroneService';
import { EnderecoApiService } from '../../../../core/services/EnderecoApiService';
import { PerfilService } from '../../../../core/services/PerfilService';
import { Carrinho } from './carrinho';

describe('Carrinho', () => {
  const endereco: Endereco = {
    id: 21,
    rua: 'Rua de teste, 10',
    bairro: 'Centro',
    cidade: { id: 1, nome: 'São Paulo', estado: { id: 1, nome: 'SP' } },
    cep: '01000-000',
    principal: true,
  };
  const pedidoCheckout: CheckoutResponse = {
    pedido: { id: 99, valorTotal: 1500, statusPedido: 'PENDENTE' },
    metodoPagamento: 'PIX',
    pagamentoId: 55,
    statusPagamento: 'PENDENTE',
    codigoPixDemonstracao: 'codigo-pix-falso',
  };
  const authService = { isAuthenticated: vi.fn(() => false) };
  const checkoutApi = {
    finalizar: vi.fn((_dados: CheckoutRequest) => of(pedidoCheckout)),
    simularAprovacao: vi.fn((_metodo: MetodoPagamentoCheckout, _id: number) => of(void 0)),
  };
  const enderecoApi = {
    listar: vi.fn(() => of({ items: [endereco], page: 0, pageSize: 100, totalItems: 1, totalPages: 1 })),
  };
  const perfilService = {
    obterPerfil: vi.fn(() => of({
      login: 'cliente',
      nomeCompleto: 'Cliente de teste',
      email: 'cliente@example.com',
      cpf: '12345678901',
      telefone: '',
    })),
  };
  const droneService = {
    obterUrlImagem: vi.fn((imagem: { caminho: string }) => `http://localhost:8080${imagem.caminho}`),
  };

  beforeEach(async () => {
    localStorage.removeItem('skyline.carrinho');
    await TestBed.configureTestingModule({
      imports: [Carrinho],
      providers: [
        provideRouter([]),
        { provide: DroneService, useValue: droneService },
        { provide: AuthService, useValue: authService },
        { provide: CheckoutApiService, useValue: checkoutApi },
        { provide: EnderecoApiService, useValue: enderecoApi },
        { provide: PerfilService, useValue: perfilService },
      ],
    }).compileComponents();
    authService.isAuthenticated.mockReturnValue(false);
    checkoutApi.finalizar.mockImplementation((dados) => of({
      ...pedidoCheckout,
      metodoPagamento: dados.metodoPagamento,
      codigoPixDemonstracao: dados.metodoPagamento === 'PIX' ? pedidoCheckout.codigoPixDemonstracao : null,
    }));
    checkoutApi.simularAprovacao.mockReturnValue(of(void 0));
    enderecoApi.listar.mockReturnValue(of({
      items: [endereco],
      page: 0,
      pageSize: 100,
      totalItems: 1,
      totalPages: 1,
    }));
  });

  it('shows the empty state and links back to the catalog', () => {
    const fixture = TestBed.createComponent(Carrinho);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Seu carrinho está vazio');
    expect(fixture.nativeElement.querySelector('a[routerLink="/home"]')?.getAttribute('href')).toBe('/home');
  });

  it('renders subtotal, updates quantity, and removes an item', () => {
    const service = TestBed.inject(CarrinhoService);
    const drone = Object.assign(new Drone(), {
      id: 8,
      nome: 'Drone no carrinho',
      preco: 1500,
      quantidadeDisponivel: 3,
      imagens: [],
    });
    service.adicionar(drone);
    const fixture = TestBed.createComponent(Carrinho);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Drone no carrinho');
    expect(fixture.nativeElement.textContent.replace(/\u00a0/g, ' ')).toContain('R$ 1.500,00');

    const increase = fixture.nativeElement.querySelector('[aria-label="Aumentar quantidade de Drone no carrinho"]') as HTMLButtonElement;
    increase.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.replace(/\u00a0/g, ' ')).toContain('R$ 3.000,00');

    const remove = fixture.nativeElement.querySelector('[aria-label="Remover Drone no carrinho do carrinho"]') as HTMLButtonElement;
    remove.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Seu carrinho está vazio');
  });

  it('requires login only when a visitor starts checkout', () => {
    const service = TestBed.inject(CarrinhoService);
    service.adicionar(Object.assign(new Drone(), {
      id: 8,
      nome: 'Drone no carrinho',
      preco: 1500,
      quantidadeDisponivel: 3,
      imagens: [],
    }));
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate');
    const fixture = TestBed.createComponent(Carrinho);
    fixture.detectChanges();

    const checkoutButton = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button'))
      .find((button: HTMLButtonElement) => button.textContent.includes('Continuar para finalizar')) as HTMLButtonElement;
    checkoutButton.click();

    expect(navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/carrinho?checkout=true' },
    });
  });

  it('creates a fake checkout without card details and clears cart after simulated approval', () => {
    const service = TestBed.inject(CarrinhoService);
    service.adicionar(Object.assign(new Drone(), {
      id: 8,
      nome: 'Drone no carrinho',
      preco: 1500,
      quantidadeDisponivel: 3,
      imagens: [],
    }));
    authService.isAuthenticated.mockReturnValue(true);
    const fixture = TestBed.createComponent(Carrinho);
    fixture.detectChanges();

    const checkoutButton = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button'))
      .find((button: HTMLButtonElement) => button.textContent.includes('Continuar para finalizar')) as HTMLButtonElement;
    checkoutButton.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Rua de teste, 10');

    const continueButton = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button'))
      .find((button: HTMLButtonElement) => button.textContent.includes('Continuar para pagamento')) as HTMLButtonElement;
    continueButton.click();
    fixture.detectChanges();

    const cardOption = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button'))
      .find((button: HTMLButtonElement) => button.textContent.includes('Cartão simulado')) as HTMLButtonElement;
    cardOption.click();
    fixture.detectChanges();
    const createOrderButton = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button'))
      .find((button: HTMLButtonElement) => button.textContent.includes('Criar pedido')) as HTMLButtonElement;
    createOrderButton.click();
    fixture.detectChanges();

    const request = checkoutApi.finalizar.mock.calls[0][0];
    expect(request).toEqual({
      enderecoId: 21,
      itens: [{ droneId: 8, quantidade: 1 }],
      metodoPagamento: 'CARTAO',
    });
    expect(Object.keys(request)).toEqual(['enderecoId', 'itens', 'metodoPagamento']);
    expect(fixture.nativeElement.textContent).toContain('nenhum dado de cartão foi solicitado ou armazenado.');

    const approveButton = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button'))
      .find((button: HTMLButtonElement) => button.textContent.includes('Simular aprovação')) as HTMLButtonElement;
    approveButton.click();
    fixture.detectChanges();

    expect(checkoutApi.simularAprovacao).toHaveBeenCalledWith('CARTAO', 55);
    expect(service.itens()).toHaveLength(0);
    expect(fixture.nativeElement.textContent).toContain('Pedido #99 confirmado');
  });
});
