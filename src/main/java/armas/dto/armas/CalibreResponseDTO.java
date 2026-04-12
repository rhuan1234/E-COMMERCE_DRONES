package armas.dto.armas;

import java.util.List;

public record CalibreResponseDTO(
    Long id,
    String nome,
    String marca,
    List<Long> armasIds
) {

}