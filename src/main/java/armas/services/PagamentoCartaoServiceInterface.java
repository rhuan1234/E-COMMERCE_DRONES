package armas.services;

import armas.model.pedido.PagamentoCartao;

import java.util.List;

public interface PagamentoCartaoServiceInterface {
    PagamentoCartao criar(PagamentoCartao pagamentoCartao, Long pedidoId, String login);
    PagamentoCartao buscarPorId(Long id, String login);
    List<PagamentoCartao> buscarTodos(String login);
    List<PagamentoCartao> buscarPorPedidoId(Long pedidoId, String login);
    void pagarCartao(Long id, String login);
    void cancelarCartao(Long id, String login);
}
