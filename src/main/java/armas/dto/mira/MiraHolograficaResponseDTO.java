package armas.dto.mira;

public record MiraHolograficaResponseDTO(
    Long id,
    String modelo,
    String marca,
    int aumentoMaximo,
    int alcanceLaser,
    boolean visaoNoturna
) {
}
