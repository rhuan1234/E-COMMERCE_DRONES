package drones.dto.drones;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record CameraRequestDTO(

    @NotNull(message = "O modelo da câmera é obrigatório")
    @Positive(message = "O id do modelo da câmera deve ser um número positivo")
    Long modeloId,

    @NotNull(message = "A marca da câmera é obrigatória")
    @Positive(message = "O id da marca da câmera deve ser um número positivo")
    Long marcaId,

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
