package armas.services;

import armas.model.pedido.PagamentoPix;

import java.util.List;

public interface PagamentoPixServiceInterface {
    PagamentoPix criar(Long pedidoId, String login);
    PagamentoPix buscarPorId(Long id, String login);
    List<PagamentoPix> buscarTodos(String login);
    List<PagamentoPix> buscarPorPedidoId(Long pedidoId, String login);
    void pagarPix(Long id, String login);
    void cancelarPix(Long id, String login);
}
