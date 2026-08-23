package drones.dto.pedidos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ItemPedidoRequestDTO(

    @NotNull(message = "O id do drone é obrigatório")
    @Positive(message = "O id do drone deve ser maior que zero")
    Long droneId,

    @Positive(message = "A quantidade deve ser maior que zero")
    int quantidade
) {
}
