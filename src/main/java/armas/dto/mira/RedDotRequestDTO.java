package armas.dto.mira;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record RedDotRequestDTO(

    @NotBlank(message = "Modelo é obrigatório")
    @Pattern(regexp = "^[\\p{L}0-9\\s._-]{2,50}$", message = "Modelo deve conter apenas letras, números, espaços, pontos, underscores e hífens")
    String modelo,

    @NotBlank(message = "Marca é obrigatória")
    @Pattern(regexp = "^[\\p{L}0-9\\s._-]{2,50}$", message = "Marca deve conter apenas letras, números, espaços, pontos, underscores e hífens")
    String marca,

    @Positive(message = "O aumento máximo deve ser maior que zero")
    int aumentoMaximo,

    @Positive(message = "A quantidade de níveis de brilho deve ser maior que zero")
    int niveisBrilho,

    @PositiveOrZero(message = "A duração da bateria não pode ser negativa")
    double duracaoBateria
) {
}
