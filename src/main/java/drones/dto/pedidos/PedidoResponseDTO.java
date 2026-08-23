package drones.dto.pedidos;

import java.time.LocalDateTime;
import java.util.List;

public record PedidoResponseDTO(
    Long id,
    LocalDateTime dataPedido,
    double valorTotal,
    String statusPedido,
    Long usuarioId,
    List<ItemPedidoResponseDTO> itens,
    String rua,
    String bairro,
    String cidade,
    String estado,
    String cep
) {
}
