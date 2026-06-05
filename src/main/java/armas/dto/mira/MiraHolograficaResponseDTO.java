package armas.dto.mira;

import java.util.List;

public record MiraHolograficaResponseDTO(
    Long id,
    String modelo,
    String marca,
    int aumentoMaximo,
    int alcanceLaser,
    boolean visaoNoturna,
    List<Long> armasIds
) {
}
