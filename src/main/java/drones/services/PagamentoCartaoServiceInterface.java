package drones.services;

import java.util.List;

import drones.model.pedido.PagamentoCartao;

public interface PagamentoCartaoServiceInterface {
    PagamentoCartao criar(PagamentoCartao pagamentoCartao, Long pedidoId, String login);
    PagamentoCartao buscarPorId(Long id, String login);
    List<PagamentoCartao> buscarTodos(String login);
    List<PagamentoCartao> buscarPorPedidoId(Long pedidoId, String login);
    void pagarCartao(Long id, String login);
    void cancelarCartao(Long id, String login);
}
