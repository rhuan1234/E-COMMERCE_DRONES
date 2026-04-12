package armas.dto.armas;
import java.util.List;
public record PistolaResponseDTO(

    // 🔹 campos da Arma
    Long id,
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
