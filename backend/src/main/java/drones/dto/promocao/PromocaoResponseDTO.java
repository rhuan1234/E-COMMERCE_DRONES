package drones.dto.promocao;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PromocaoResponseDTO(
        Long id,
        String nome,
        BigDecimal percentualDesconto,
        LocalDateTime dataInicio,
        LocalDateTime dataFim,
        List<Long> droneIds
) {
}