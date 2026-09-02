package drones.dto.drones;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record AvaliacaoRequestDTO(
    @NotNull(message = "A nota é obrigatória")
    @Min(value = 1, message = "A nota deve ser entre 1 e 5")
    @Max(value = 5, message = "A nota deve ser entre 1 e 5")
    Integer nota,

    @Size(max = 1000, message = "O comentário deve ter no máximo 1000 caracteres")
    String comentario,

    @NotNull(message = "O id do drone é obrigatório")
    @Positive(message = "O id do drone deve ser positivo")
    Long droneId
) {
}