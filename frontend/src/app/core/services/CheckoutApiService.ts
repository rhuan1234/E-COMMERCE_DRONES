import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CheckoutRequest, CheckoutResponse, MetodoPagamentoCheckout } from '../models/checkout/Checkout';

@Injectable({ providedIn: 'root' })
export class CheckoutApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/pedidos';

  finalizar(dados: CheckoutRequest): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.apiUrl}/checkout`, dados);
  }

  simularAprovacao(metodo: MetodoPagamentoCheckout, pagamentoId: number): Observable<void> {
    const tipo = metodo === 'PIX' ? 'pix' : 'cartao';
    return this.http.patch<void>(
      `${this.apiUrl}/pagamentos/${tipo}/${pagamentoId}/pagar`,
      {},
    );
  }
}
