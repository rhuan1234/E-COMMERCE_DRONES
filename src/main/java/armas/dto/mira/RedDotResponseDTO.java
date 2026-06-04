package armas.dto.mira;

public record RedDotResponseDTO(
    Long id,
    String modelo,
    String marca,
    int aumentoMaximo,
    int niveisBrilho,
    double duracaoBateria
) {
}
