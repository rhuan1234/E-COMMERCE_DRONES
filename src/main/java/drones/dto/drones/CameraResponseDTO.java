package drones.dto.drones;

public record CameraResponseDTO(
    Long id,
    String modelo,
    String marca,
    String resolucao,
    int zoom,
    boolean estabilizacao,
    String fps
) {
}
