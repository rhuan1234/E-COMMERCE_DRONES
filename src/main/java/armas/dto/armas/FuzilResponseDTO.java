package armas.dto.armas;
import java.util.List;
public record FuzilResponseDTO(

    // 🔹 campos da Arma
    Long id,
    String nome,
    String marca,
    String modelo,
    double preco,
    
    boolean ativa,
    
    List<Long> calibres,
    Long fornecedorId,
    Long registroId,
    // 🔹 campos da Fuzil
    String modoDisparo,
    int capacidadeCarregador,
    double alcanceEfetivo,
    boolean possuiTrilhoTatico
) {

}