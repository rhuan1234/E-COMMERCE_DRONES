package armas.dto.armas;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

public record CarregadorRequestDTO(

    @NotBlank(message = "Modelo é obrigatório")
    @Pattern(regexp = "^[\\p{L}0-9\\s._-]{2,50}$", message = "Modelo deve conter apenas letras, números, espaços, pontos, underscores e hífens")
    String modelo,

    @Positive(message = "A quantidade de munição deve ser maior que zero")
    int qtdMunicao,

    @NotBlank(message = "Marca é obrigatória")
    @Pattern(regexp = "^[\\p{L}0-9\\s._-]{2,50}$", message = "Marca deve conter apenas letras, números, espaços, pontos, underscores e hífens")
    String marca
) {
}
