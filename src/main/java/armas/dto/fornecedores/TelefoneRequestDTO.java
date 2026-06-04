package armas.dto.fornecedores;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record TelefoneRequestDTO(

    @NotBlank(message = "O número de telefone é obrigatório")
    @Pattern(regexp = "^\\(?\\d{2}\\)?\\s?9?\\d{4}-?\\d{4}$", message = "Número de telefone inválido")
    String numero
) {}
