package armas.dto.pedidos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PagamentoCartaoResponseDTO(
    Long id,
    Long pedidoId,
    double valor,
    String statusPagamento,
    String numeroCartaoUltimosDigitos
) {
}
