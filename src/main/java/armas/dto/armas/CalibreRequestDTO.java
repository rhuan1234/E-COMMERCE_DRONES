package armas.dto.armas;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CalibreRequestDTO(

    @NotBlank(message = "Nome é obrigatório")
    @Pattern(regexp = "^[\\p{L}0-9\\s._-]{2,50}$", message = "Nome deve conter apenas letras, números, espaços, pontos, underscores e hífens")
    String nome,

    @NotBlank(message = "Marca é obrigatória")
    @Pattern(regexp = "^[\\p{L}0-9\\s._-]{2,50}$", message = "Marca deve conter apenas letras, números, espaços, pontos, underscores e hífens")
    String marca
) {

}
