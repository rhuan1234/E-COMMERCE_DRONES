package drones.dto.drones;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;

public record CameraRequestDTO(

    @NotBlank(message = "O modelo da câmera é obrigatório")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\s._-]{2,50}$", message = "Modelo da câmera inválido")
    String modelo,

    @NotBlank(message = "A marca da câmera é obrigatória")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\s._-]{2,50}$", message = "Marca da câmera inválida")
    String marca,

    @NotBlank(message = "A resolução é obrigatória")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\s._-]{2,50}$", message = "Resolução inválida")
    String resolucao,

    @NotNull(message = "O zoom é obrigatório")
    @PositiveOrZero(message = "O zoom deve ser zero ou maior")
    Integer zoom,

    @NotNull(message = "O campo de estabilização é obrigatório")
    Boolean estabilizacao,

    @NotBlank(message = "Os FPS são obrigatórios")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\s._-]{2,20}$", message = "FPS inválido")
    String fps
) {
}
