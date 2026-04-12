package armas.dto.registro;

import java.time.LocalDate;

public record RegistroRequestDTO(

    LocalDate dataRegistro,
    String numeroSerie
) {
    
}