package armas.dto.armas;

public record PistolaRequestDTO(

    // 🔹 campos da Arma
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
