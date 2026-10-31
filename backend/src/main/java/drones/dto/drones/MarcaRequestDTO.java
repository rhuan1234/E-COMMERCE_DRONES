package drones.dto.drones;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record MarcaRequestDTO(
    @NotBlank(message = "O nome da marca é obrigatório")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\s._-]{2,50}$", message = "Nome da marca deve conter entre 2 e 50 caracteres válidos")
    String nome
) {
}
