package drones.dto.pedidos;

public record ItemPedidoResponseDTO(
    Long id,
    Long droneId,
    int quantidade,
    double precoUnitario,
    double subtotal
) {
}
