package armas.dto.armas;

import java.util.List;

public record RiflePrecisaoRequestDTO(

    // 🔹 campos da Arma
    String nome,
    String marca,
    String modelo,
    double preco,
    
    boolean ativa,
    List<Long> calibres,
    Long fornecedorId,

    // 🔹 campos do RiflePrecisao
    double comprimentoCano,
    boolean possuiMiraTelescopica,
    double alcanceEfetivo,
    String tipoFuncionamento
) {

}
