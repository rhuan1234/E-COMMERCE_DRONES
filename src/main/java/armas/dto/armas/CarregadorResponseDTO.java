package armas.dto.armas;

import java.util.List;

public record CarregadorResponseDTO(
    Long id,
    String modelo,
    int qtdMunicao,
    String marca,
    List<Long> fuzisIds
) {
}
