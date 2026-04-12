package armas.dto.registro;

import java.time.LocalDate;

public record RegistroResponseDTO(

    Long id,
    LocalDate dataRegistro,
    String numeroSerie
) {

}