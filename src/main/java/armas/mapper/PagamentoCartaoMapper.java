package armas.mapper;

import armas.dto.pedidos.PagamentoCartaoRequestDTO;
import armas.dto.pedidos.PagamentoCartaoResponseDTO;
import armas.model.pedido.PagamentoCartao;

public class PagamentoCartaoMapper {

    public static PagamentoCartao toEntity(PagamentoCartaoRequestDTO dto) {
        PagamentoCartao pagamentoCartao = new PagamentoCartao();

        pagamentoCartao.setNumeroCartao(dto.numeroCartao());
        pagamentoCartao.setNomeTitular(dto.nomeTitular());
        pagamentoCartao.setDataValidade(dto.dataValidade());
        pagamentoCartao.setCodigoSeguranca(dto.codigoSeguranca());
        return pagamentoCartao;
    }

    public static PagamentoCartaoResponseDTO toResponseDTO(PagamentoCartao pagamentoCartao) {
        return new PagamentoCartaoResponseDTO(
            pagamentoCartao.getId(),
            pagamentoCartao.getPedido() != null ? pagamentoCartao.getPedido().getId() : null,
            pagamentoCartao.getValor(),
            pagamentoCartao.getStatusPagamento() != null ? pagamentoCartao.getStatusPagamento().name() : null,
            pagamentoCartao.getNumeroCartao().trim().substring(pagamentoCartao.getNumeroCartao().length() - 4)
        );
    }
}
