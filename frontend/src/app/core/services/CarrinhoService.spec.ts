import { TestBed } from '@angular/core/testing';
import { Drone } from '../models/drone/Drone';
import { CarrinhoService } from './CarrinhoService';

function criarDrone(id: number, preco: number, estoque: number): Drone {
  return Object.assign(new Drone(), {
    id,
    nome: `Drone ${id}`,
    preco,
    quantidadeDisponivel: estoque,
    imagens: [],
  });
}

describe('CarrinhoService', () => {
  let service: CarrinhoService;

  beforeEach(() => {
    localStorage.removeItem('skyline.carrinho');
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarrinhoService);
  });

  it('adds items, aggregates quantities and persists them in local storage', () => {
    expect(service.adicionar(criarDrone(1, 1250, 3))).toBe('adicionado');
    expect(service.adicionar(criarDrone(1, 1300, 3))).toBe('adicionado');
    expect(service.adicionar(criarDrone(2, 2200, 2))).toBe('adicionado');

    expect(service.quantidadeItens()).toBe(3);
    expect(service.subtotal()).toBe(4800);
    expect(service.itens()[0]).toMatchObject({ quantidade: 2, preco: 1300 });
    expect(JSON.parse(localStorage.getItem('skyline.carrinho') ?? '[]')).toHaveLength(2);

    const restored = new CarrinhoService();
    expect(restored.itens()).toEqual(service.itens());
    expect(restored.subtotal()).toBe(4800);
  });

  it('prevents adding or changing quantities beyond available stock', () => {
    const drone = criarDrone(4, 1500, 1);
    expect(service.adicionar(drone)).toBe('adicionado');
    expect(service.adicionar(drone)).toBe('limite-estoque');
    expect(service.definirQuantidade(4, 2)).toBe(false);
    expect(service.definirQuantidade(4, 1)).toBe(true);
    expect(service.adicionar(criarDrone(5, 800, 0))).toBe('indisponivel');

    expect(service.quantidadeItens()).toBe(1);
  });

  it('removes items and recalculates the total', () => {
    service.adicionar(criarDrone(1, 1000, 2));
    service.adicionar(criarDrone(2, 2000, 1));

    service.remover(1);

    expect(service.itens().map((item) => item.droneId)).toEqual([2]);
    expect(service.subtotal()).toBe(2000);
  });
});
