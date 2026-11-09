import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Drone } from '../../../../core/models/drone/Drone';
import { CarrinhoService } from '../../../../core/services/CarrinhoService';
import { DroneService } from '../../../../core/services/DroneService';
import { Carrinho } from './carrinho';

describe('Carrinho', () => {
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
      ],
    }).compileComponents();
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
});
