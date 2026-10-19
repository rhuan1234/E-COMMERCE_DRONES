package drones.dto.drones;

public record ModeloResponseDTO(
    Long id,
    String nome,
    Long marcaId,
    MarcaResponseDTO marca
) {
}
