package armas.dto.armas;

public record FuzilRequestDTO(

    // 🔹 campos da Arma
     String nome,
     String marca,
     String modelo,
     String numeroSerie,
     double preco,
     
     boolean ativa,
     String calibre,
    Long fornecedorId,

    // 🔹 campos da Fuzil
     String modoDisparo,
     int capacidadeCarregador,
     double alcanceEfetivo,
     boolean possuiTrilhoTatico
) {
    
}