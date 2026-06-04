package armas.dto.registro;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;

public record RegistroRequestDTO(

    @NotNull(message = "A data de registro é obrigatória")
    @PastOrPresent(message = "A data de registro não pode ser futura")
    LocalDate dataRegistro,

    @NotBlank(message = "O número de série é obrigatório")
    @Pattern(regexp = "^[\\p{L}0-9-]{1,50}$", message = "Número de série inválido")
    String numeroSerie
) {

}
