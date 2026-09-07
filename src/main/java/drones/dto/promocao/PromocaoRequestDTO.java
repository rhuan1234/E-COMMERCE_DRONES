package drones.dto.promocao;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PromocaoRequestDTO(
        @NotBlank(message = "Nome da promoção é obrigatório")
        String nome,

        @NotNull(message = "Percentual de desconto é obrigatório")
        @DecimalMin(value = "0.0", message = "Percentual de desconto não pode ser negativo")
        @DecimalMax(value = "100.0", message = "Percentual de desconto não pode ser maior que 100")
        BigDecimal percentualDesconto,

        @NotNull(message = "Data de início é obrigatória")
        LocalDateTime dataInicio,

        @NotNull(message = "Data de fim é obrigatória")
        LocalDateTime dataFim,

        @Size(max = 1000, message = "A promoção pode ter no máximo 1000 drones")
        List<Long> droneIds
) {
}