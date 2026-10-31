package drones.dto.fornecedores;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record CidadeRequestDTO(
    @NotBlank(message = "A cidade é obrigatória")
    @Pattern(regexp = "^[\\p{L}\\s.'-]{2,80}$", message = "Cidade inválida")
    String nome,

    @Valid
    @NotNull(message = "O estado é obrigatório")
    EstadoRequestDTO estado
) {
}
