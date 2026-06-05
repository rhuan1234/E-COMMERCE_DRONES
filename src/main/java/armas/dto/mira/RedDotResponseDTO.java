package armas.dto.mira;

import java.util.List;

public record RedDotResponseDTO(
    Long id,
    String modelo,
    String marca,
    int aumentoMaximo,
    int niveisBrilho,
    double duracaoBateria,
    List<Long> armasIds
) {
}
