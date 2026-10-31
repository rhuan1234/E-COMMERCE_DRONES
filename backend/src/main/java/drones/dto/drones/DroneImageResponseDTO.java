package drones.dto.drones;

public record DroneImageResponseDTO(
        Long id,
        String caminho,
        boolean principal,
        int ordem) {
}
