package drones.dto.fornecedores;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record EstadoRequestDTO(
    @NotBlank(message = "O estado é obrigatório")
    @Pattern(regexp = "^[A-Za-z]{2}$", message = "Estado deve ser a sigla da UF (2 letras)")
    String nome
) {
}
