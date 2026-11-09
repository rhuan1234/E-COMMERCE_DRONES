import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CheckoutRequest } from '../models/checkout/Checkout';
import { CheckoutApiService } from './CheckoutApiService';

describe('CheckoutApiService', () => {
  let service: CheckoutApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CheckoutApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(CheckoutApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('submits the selected address, cart items, and fake payment method', () => {
    const request: CheckoutRequest = {
      enderecoId: 3,
      itens: [{ droneId: 7, quantidade: 2 }],
      metodoPagamento: 'PIX',
    };

    service.finalizar(request).subscribe();

    const req = http.expectOne('http://localhost:8080/pedidos/checkout');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({
      pedido: { id: 10, valorTotal: 600, statusPedido: 'PENDENTE' },
      metodoPagamento: 'PIX',
      pagamentoId: 15,
      statusPagamento: 'PENDENTE',
      codigoPixDemonstracao: 'pix-falso',
    });
  });

  it('approves a fake card payment without sending card data', () => {
    service.simularAprovacao('CARTAO', 15).subscribe();

    const req = http.expectOne('http://localhost:8080/pedidos/pagamentos/cartao/15/pagar');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({});
    req.flush(null);
  });
});
