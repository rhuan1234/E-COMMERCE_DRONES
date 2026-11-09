package drones.dto.pedidos;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

public record CheckoutRequestDTO(
    @NotNull(message = "O endereço de entrega é obrigatório")
    @Positive(message = "O endereço de entrega deve ser válido")
    Long enderecoId,

    @NotEmpty(message = "O pedido deve conter ao menos um item")
    @Valid
    List<ItemPedidoRequestDTO> itens,

    @NotNull(message = "A forma de pagamento é obrigatória")
    @Pattern(regexp = "PIX|CARTAO", message = "A forma de pagamento deve ser PIX ou CARTAO")
    String metodoPagamento
) {
}
