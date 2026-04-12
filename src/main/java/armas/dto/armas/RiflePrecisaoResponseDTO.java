package armas.dto.armas;

import java.util.List;

public record RiflePrecisaoResponseDTO(
    Long id,
    String nome,
    String marca,
    String modelo,
    String numeroSerie,
    double preco,
    
    boolean ativa,
    List<Long> calibres,
    Long fornecedorId,
    double comprimentoCano,
    boolean possuiMiraTelescopica,
    double alcanceEfetivo,
    String tipoFuncionamento
) {

}
