package drones.dto.pedidos;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PedidoRequestDTO(

    @NotEmpty(message = "O pedido deve conter ao menos um item")
    @Valid
    List<ItemPedidoRequestDTO> itens
) {
}
