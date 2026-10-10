package drones.dto.pedidos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PagamentoPixResponseDTO(
    Long id,
    Long pedidoId,
    double valor,
    String statusPagamento,
    String chavePix
) {
}
