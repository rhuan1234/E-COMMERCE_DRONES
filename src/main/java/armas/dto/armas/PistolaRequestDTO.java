package armas.dto.armas;
import java.util.List;
public record PistolaRequestDTO(

    // 🔹 campos da Arma
     String nome,
     String marca,
     String modelo,
     String numeroSerie,
     double preco,
     
     boolean ativa,
     List<Long> calibres,
     Long fornecedorId,

    // 🔹 campos da Pistola
     int capacidadeCarregador,
     String tipoAcao,
     boolean possuiTravaSeguranca,
     boolean possuiTrilho
) {
    
} 
