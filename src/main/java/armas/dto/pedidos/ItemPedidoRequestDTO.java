package armas.dto.pedidos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ItemPedidoRequestDTO(

    @NotNull(message = "O id do fuzil é obrigatório")
    @Positive(message = "O id do fuzil deve ser maior que zero")
    Long fuzilId,

    @Positive(message = "A quantidade deve ser maior que zero")
    int quantidade
) {
}
