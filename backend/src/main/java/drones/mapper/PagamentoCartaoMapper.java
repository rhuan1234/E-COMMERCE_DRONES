package drones.mapper;

import drones.dto.pedidos.PagamentoCartaoResponseDTO;
import drones.model.pedido.PagamentoCartao;

public class PagamentoCartaoMapper {

    public static PagamentoCartaoResponseDTO toResponseDTO(PagamentoCartao pagamentoCartao) {
        return new PagamentoCartaoResponseDTO(
            pagamentoCartao.getId(),
            pagamentoCartao.getPedido() != null ? pagamentoCartao.getPedido().getId() : null,
            pagamentoCartao.getValor(),
            pagamentoCartao.getStatusPagamento() != null ? pagamentoCartao.getStatusPagamento().name() : null
        );
    }
}
