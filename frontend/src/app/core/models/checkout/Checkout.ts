export type MetodoPagamentoCheckout = 'PIX' | 'CARTAO';

export interface CheckoutRequest {
  enderecoId: number;
  itens: { droneId: number; quantidade: number }[];
  metodoPagamento: MetodoPagamentoCheckout;
}

export interface CheckoutPedido {
  id: number;
  valorTotal: number;
  statusPedido: string;
}

export interface CheckoutResponse {
  pedido: CheckoutPedido;
  metodoPagamento: MetodoPagamentoCheckout;
  pagamentoId: number;
  statusPagamento: string;
  codigoPixDemonstracao: string | null;
}
