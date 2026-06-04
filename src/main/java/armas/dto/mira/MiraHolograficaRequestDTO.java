package armas.dto.mira;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

public record MiraHolograficaRequestDTO(

    @NotBlank(message = "Modelo é obrigatório")
    @Pattern(regexp = "^[\\p{L}0-9\\s._-]{2,50}$", message = "Modelo deve conter apenas letras, números, espaços, pontos, underscores e hífens")
    String modelo,

    @NotBlank(message = "Marca é obrigatória")
    @Pattern(regexp = "^[\\p{L}0-9\\s._-]{2,50}$", message = "Marca deve conter apenas letras, números, espaços, pontos, underscores e hífens")
    String marca,

    @Positive(message = "O aumento máximo deve ser maior que zero")
    int aumentoMaximo,

    @Positive(message = "O alcance do laser deve ser maior que zero")
    int alcanceLaser,

    boolean visaoNoturna
) {
}
