package armas.dto.armas;
import java.util.List;
public record FuzilRequestDTO(

    // 🔹 campos da Arma
     String nome,
     String marca,
     String modelo,
     String numeroSerie,
     double preco,
     
     boolean ativa,
     List<Long> calibres,
    Long fornecedorId,

    // 🔹 campos da Fuzil
     String modoDisparo,
     int capacidadeCarregador,
     double alcanceEfetivo,
     boolean possuiTrilhoTatico
) {
    
}