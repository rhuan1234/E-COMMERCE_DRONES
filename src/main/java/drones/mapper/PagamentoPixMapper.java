package drones.mapper;

import drones.dto.pedidos.PagamentoPixResponseDTO;
import drones.model.pedido.PagamentoPix;


public class PagamentoPixMapper {


    public static PagamentoPixResponseDTO toResponseDTO(PagamentoPix pagamentoPix) {
        return new PagamentoPixResponseDTO(
            pagamentoPix.getId(),
            pagamentoPix.getPedido() != null ? pagamentoPix.getPedido().getId() : null,
            pagamentoPix.getValor(),
            pagamentoPix.getStatusPagamento() != null ? pagamentoPix.getStatusPagamento().name() : null,
            pagamentoPix.getChavePix()
        );
    }
}
