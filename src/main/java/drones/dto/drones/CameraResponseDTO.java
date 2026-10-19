package drones.dto.drones;

public record CameraResponseDTO(
    Long id,
    ModeloResponseDTO modelo,
    MarcaResponseDTO marca,
    Long modeloId,
    Long marcaId,
    String resolucao,
    int zoom,
    boolean estabilizacao,
    String fps
) {
}
