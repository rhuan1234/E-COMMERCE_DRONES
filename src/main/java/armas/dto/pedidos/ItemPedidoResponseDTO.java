package armas.dto.pedidos;

public record ItemPedidoResponseDTO(
    Long id,
    Long fuzilId,
    int quantidade,
    double precoUnitario,
    double subtotal
) {
}
