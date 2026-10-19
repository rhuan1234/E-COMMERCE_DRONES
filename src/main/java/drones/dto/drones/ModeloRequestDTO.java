package drones.dto.drones;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

public record ModeloRequestDTO(
    @NotBlank(message = "O nome do modelo é obrigatório")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\s._+/-]{2,50}$", message = "Nome do modelo deve conter entre 2 e 50 caracteres válidos")
    String nome,

    @NotNull(message = "O id da marca é obrigatório")
    @Positive(message = "O id da marca deve ser um número positivo")
    Long marcaId
) {
}
