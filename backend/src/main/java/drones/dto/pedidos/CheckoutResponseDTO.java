package drones.dto.pedidos;

public record CheckoutResponseDTO(
    PedidoResponseDTO pedido,
    String metodoPagamento,
    Long pagamentoId,
    String statusPagamento,
    String codigoPixDemonstracao
) {
}
