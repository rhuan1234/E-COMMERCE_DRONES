package armas.dto.armas;

public record PistolaResponseDTO(

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

    // 🔹 campos da Pistola
     int capacidadeCarregador,
     String tipoAcao,
     boolean possuiTravaSeguranca,
     boolean possuiTrilho
) {

}
