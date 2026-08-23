package drones.dto.pedidos;

import java.time.LocalDateTime;
import java.util.List;

public record PedidoResponseAnaliseAdminDTO(
    Long id,
    LocalDateTime dataPedido,
    double valorTotal,
    String statusPedido,
    List<ItemPedidoResponseDTO> itens,
    String rua,
    String bairro,
    String cidade,
    String estado,
    String cep,
    Long usuarioId,
    String cpfCliente,
    String nomeCompletoCliente,
    String registroAtiradorCliente
) {

}
