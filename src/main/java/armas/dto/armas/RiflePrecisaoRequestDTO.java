package armas.dto.armas;

public record RiflePrecisaoRequestDTO(

    // 🔹 campos da Arma
    String nome,
    String marca,
    String modelo,
    String numeroSerie,
    double preco,
    
    boolean ativa,
    String calibre,
    Long fornecedorId,

    // 🔹 campos do RiflePrecisao
    double comprimentoCano,
    boolean possuiMiraTelescopica,
    double alcanceEfetivo,
    String tipoFuncionamento
) {

}
