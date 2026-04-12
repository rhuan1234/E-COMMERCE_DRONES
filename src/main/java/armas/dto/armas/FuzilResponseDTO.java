package armas.dto.armas;

public record FuzilResponseDTO(

    // 🔹 campos da Arma
    Long id,
    String nome,
    String marca,
    String modelo,
    String numeroSerie,
    double preco,
    
    boolean ativa,
    String calibre,
    Long fornecedorId,
    Long registroId,
    // 🔹 campos da Fuzil
    String modoDisparo,
    int capacidadeCarregador,
    double alcanceEfetivo,
    boolean possuiTrilhoTatico
) {

}