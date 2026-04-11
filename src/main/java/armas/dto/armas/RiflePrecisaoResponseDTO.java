package armas.dto.armas;

public record RiflePrecisaoResponseDTO(
    Long id,
    String nome,
    String marca,
    String modelo,
    String numeroSerie,
    double preco,
    
    boolean ativa,
    String calibre,
    Long fornecedorId,
    double comprimentoCano,
    boolean possuiMiraTelescopica,
    double alcanceEfetivo,
    String tipoFuncionamento
) {

}
