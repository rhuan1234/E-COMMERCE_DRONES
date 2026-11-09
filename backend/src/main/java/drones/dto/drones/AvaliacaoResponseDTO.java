package drones.dto.drones;

import java.time.LocalDateTime;

public record AvaliacaoResponseDTO(
    Long id,
    Integer nota,
    String comentario,
    String nomeCliente,
    LocalDateTime dataAvaliacao,
    Long usuarioId,
    Long droneId
) {
}